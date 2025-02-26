CREATE TABLE IF NOT EXISTS humanized_messages
(
    id              uuid primary key         DEFAULT uuid_generate_v4(),
    message_id      uuid references messages on delete cascade,
    user_id         uuid references users on delete cascade            not null,
    original_text   text                                               not null,
    humanized_text  text                                               not null,
    re_humanized_id uuid references humanized_messages on delete cascade,
    created_at      timestamp with time zone default current_timestamp not null,
    CONSTRAINT prevent_self_reference CHECK (id != re_humanized_id)
);

create index humanized_messages_created_at_idx on humanized_messages ("created_at");