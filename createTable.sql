CREATE TABLE movies_table (
    id BIGSERIAL NOT NULL,
    name VARCHAR(70) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL,
    price INTEGER NOT NULL
);