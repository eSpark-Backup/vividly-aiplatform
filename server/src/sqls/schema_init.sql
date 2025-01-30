CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE auth_type AS ENUM ('email', 'google');

CREATE TYPE subscription_tier AS ENUM ('starter', 'pro', 'enterprise');

CREATE TABLE users
(
    id            UUID PRIMARY KEY             DEFAULT uuid_generate_v4(),
    first_name    VARCHAR(50)         NOT NULL,
    last_name     VARCHAR(50)         NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    auth_type     auth_type           NOT NULL DEFAULT 'email',
    google_id     VARCHAR(255) UNIQUE,
    created_at    TIMESTAMP WITH TIME ZONE     DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles
(
    user_id    UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    phone      VARCHAR(20),
    address    TEXT,
    city       VARCHAR(100),
    birthdate  DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens
(
    id         UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    user_id    UUID                     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token      VARCHAR(6)               NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used       BOOLEAN                  DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions
(
    id                      UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    user_id                 UUID                     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    payment_customer_id     VARCHAR(255) UNIQUE      NOT NULL,
    payment_subscription_id VARCHAR(255) UNIQUE      NOT NULL,
    tier                    subscription_tier        NOT NULL,
    max_projects            INTEGER                  NOT NULL,
    status                  VARCHAR(50)              NOT NULL,
    current_period_start    TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end      TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations
(
    id         UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    user_id    UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages
(
    id              UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    conversation_id UUID        NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    role            VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    content         TEXT        NOT NULL,
    tokens_used     INTEGER     NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_google_id ON users (google_id);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX idx_conversations_user_id ON conversations (user_id);
CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE
    ON users
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE
    ON user_profiles
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE
    ON subscriptions
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE
    ON conversations
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();