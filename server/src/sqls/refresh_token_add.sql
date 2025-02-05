-- Add refresh tokens table with enhanced security tracking
CREATE TABLE refresh_tokens
(
    id                 UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    user_id            UUID                     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token              VARCHAR(255) UNIQUE      NOT NULL,
    expires_at         TIMESTAMP WITH TIME ZONE NOT NULL,
    initial_expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Original expiration time never changes
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at         TIMESTAMP WITH TIME ZONE,
    revocation_reason  VARCHAR(50),                       -- Reason for revocation (e.g., 'rotated', 'user_logout', 'expired')
    replaced_by_token  VARCHAR(255)
);

-- Create indexes for faster token lookups
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens (token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);

-- Create index for checking valid tokens
CREATE INDEX idx_valid_refresh_tokens ON refresh_tokens (user_id, revoked_at)
    WHERE revoked_at IS NULL;