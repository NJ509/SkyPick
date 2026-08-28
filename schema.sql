CREATE TABLE user (
    id VARCHAR(20) PRIMARY KEY,
    password VARCHAR(60) NOT NULL,
    
    name VARCHAR(20) NOT NULL,
    point INTEGER UNSIGNED NOT NULL DEFAULT 500
);

CREATE TABLE profile_image (
    user_id VARCHAR(20) NOT NULL,
    image_loc VARCHAR(50) NOT NULL, -- 파일 경로 \public\images\[img name].webp

    PRIMARY KEY(user_id, image_loc),
    FOREIGN KEY user_id REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE inventory (
    user_id VARCHAR(20) NOT NULL,
    item_name VARCHAR(30) NOT NULL,
    quantity INT DEFAULT 0,
    
    PRIMARY KEY(user_id, item_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE title (
    id BIGINT PRIMARY KEY,
    user_id VARCHAR(20), 
    title VARCHAR(10),

    FOREIGN KEY user_id REFERENCES user(id)
);

CREATE TABLE map (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    user_id VARCHAR(20) NOT NULL,
    map VARCHAR(7) NOT NULL,

    UNIQUE(user_id, map),
    FOREIGN KEY user_id REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE forecast(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,

    submitted_at TIMESTAMP NOT NULL, -- 유저가 예측 버튼 누른 시점 (쿨타임 계산용)
    forecast_map VARCHAR(7) NOT NULL,
    forecast_time DATETIME NOT NULL,
    used_point INTEGER NOT NULL DEFAULT 0,

    FOREIGN KEY user_id REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_cooldown (user_id, submitted_at DESC) -- 쿨타임 조회용 (최적화)
);