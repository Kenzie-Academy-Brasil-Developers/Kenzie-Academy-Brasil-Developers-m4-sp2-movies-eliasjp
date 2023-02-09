CREATE TABLE movies (
    id SERIAL NOT NULL,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    price INTEGER NOT NULL
);