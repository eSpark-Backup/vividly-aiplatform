ALTER TABLE users
    ADD COLUMN is_student      bool not null default false,
    ADD COLUMN student_id_card varchar;