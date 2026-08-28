CREATE TABLE inventory (
    user_id VARCHAR(20) NOT NULL,
    item_name VARCHAR(30) NOT NULL,
    quantity INT DEFAULT 0,
    
    PRIMARY KEY(user_id, item_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);