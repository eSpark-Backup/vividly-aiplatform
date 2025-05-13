CREATE TABLE IF NOT EXISTS user_usage_metric (
    id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id              uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                 text CHECK (type IN ('image_generation', 'image_analysis')) NOT NULL,
    image_generation_id  text,
    image_analysis_id    text,
    created_at           timestamp with time zone DEFAULT current_timestamp NOT NULL,

    -- Optional: Logical constraint to ensure only relevant ID is filled
    CONSTRAINT only_one_image_type CHECK (
        (type = 'image_generation' AND image_generation_id IS NOT NULL AND image_analysis_id IS NULL) OR
        (type = 'image_analysis' AND image_analysis_id IS NOT NULL AND image_generation_id IS NULL)
    )
);

CREATE INDEX user_usage_metric_created_at_idx ON user_usage_metric (created_at);
CREATE INDEX user_usage_metric_user_id_idx ON user_usage_metric (user_id);
