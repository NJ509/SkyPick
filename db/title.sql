CREATE TABLE title (
    id BIGINT PRIMARY KEY,
    user_id VARCHAR(20), 
    title VARCHAR(10),

    FOREIGN KEY user_id REFERENCES user(id)
);