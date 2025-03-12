-- Migration: 001_create_user_images_table.sql

-- Create user_images table
CREATE TABLE public.user_images
(
    id              UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    user_id         UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    filename        VARCHAR(255) NOT NULL,                     -- Original filename provided by the user
    stored_filename VARCHAR(255) NOT NULL,                     -- Actual filename on the server
    type            VARCHAR(50)  NOT NULL,                     -- MIME type of the image
    size            BIGINT       NOT NULL,                     -- Size in bytes
    source          VARCHAR(50)              DEFAULT 'upload', -- Source of the image: 'upload', 'generated_from_text', 'generated_similar', 'edited', etc.
    source_id       UUID,                                      -- Reference to parent image if this was derived (e.g. edited version)
    thumbnail       TEXT,                                      -- Base64 encoded thumbnail
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_source_image FOREIGN KEY (source_id) REFERENCES user_images (id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_user_images_user_id ON user_images (user_id);
CREATE INDEX idx_user_images_source_id ON user_images (source_id) WHERE source_id IS NOT NULL;
CREATE INDEX idx_user_images_created_at ON user_images (created_at);

-- Add updated_at trigger
CREATE TRIGGER update_user_images_updated_at
    BEFORE UPDATE
    ON user_images
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Migration: 002_create_message_references_table.sql

-- Create message_references table
CREATE TABLE public.message_references
(
    id             UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    message_id     UUID        NOT NULL REFERENCES messages (id) ON DELETE CASCADE,
    reference_type VARCHAR(50) NOT NULL, -- 'image', 'file', etc.
    reference_id   UUID        NOT NULL, -- ID of the referenced entity
    reference_path VARCHAR(255),         -- Optional path or additional reference data
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX idx_message_references_message_id ON message_references (message_id);
CREATE INDEX idx_message_references_reference_id ON message_references (reference_id);
CREATE INDEX idx_message_references_type_id ON message_references (reference_type, reference_id);

-- Migration: 003_modify_messages_for_images.sql

-- Update the messages table to indicate attachment presence
ALTER TABLE messages
    ADD COLUMN has_attachments BOOLEAN DEFAULT FALSE;

-- Add a trigger to automatically update has_attachments when references are added
CREATE OR REPLACE FUNCTION update_message_attachment_flag()
    RETURNS TRIGGER AS
$$
BEGIN
    UPDATE messages SET has_attachments = TRUE WHERE id = NEW.message_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_message_reference_inserted
    AFTER INSERT
    ON message_references
    FOR EACH ROW
EXECUTE FUNCTION update_message_attachment_flag();

-- Migration: 004_add_image_retention_policy.sql

-- Migration: 005_add_image_usage_tracking.sql

-- Add an image usage tracking table to monitor bandwidth and storage
CREATE TABLE public.image_usage_metrics
(
    id                UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    image_id          UUID NOT NULL REFERENCES user_images (id) ON DELETE CASCADE,
    bytes_transferred BIGINT                   DEFAULT 0,
    request_count     INTEGER                  DEFAULT 0,
    last_accessed     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE image_usage_metrics
    ADD CONSTRAINT unique_image_user
        UNIQUE (image_id, user_id);

-- Add indexes for metric queries
CREATE INDEX idx_image_usage_user_id ON image_usage_metrics (user_id);
CREATE INDEX idx_image_usage_image_id ON image_usage_metrics (image_id);
CREATE INDEX idx_image_usage_last_accessed ON image_usage_metrics (last_accessed);

-- Add trigger to update timestamp
CREATE TRIGGER update_image_usage_metrics_updated_at
    BEFORE UPDATE
    ON image_usage_metrics
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Function to record image access
CREATE OR REPLACE FUNCTION record_image_access(
    p_image_id UUID,
    p_user_id UUID,
    p_bytes_transferred BIGINT DEFAULT 0
)
    RETURNS VOID AS
$$
BEGIN
    INSERT INTO image_usage_metrics(image_id, user_id, bytes_transferred, request_count, last_accessed)
    VALUES (p_image_id, p_user_id, p_bytes_transferred, 1, CURRENT_TIMESTAMP)
    ON CONFLICT (image_id, user_id) DO UPDATE SET bytes_transferred = image_usage_metrics.bytes_transferred + p_bytes_transferred,
                                                  request_count     = image_usage_metrics.request_count + 1,
                                                  last_accessed     = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;