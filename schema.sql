CREATE TABLE user (
    id VARCHAR(20) PRIMARY KEY,
    password VARCHAR(60) NOT NULL,
    
    name VARCHAR(20) NOT NULL,
    point INTEGER UNSIGNED NOT NULL DEFAULT 500, -- 포인트 (음수 불가)
    current_streak INTEGER UNSIGNED NOT NULL DEFAULT 0, -- 연승 횟수(음수 불가)

    equipped_title VARCHAR(30) DEFAULT NULL, -- 장착한 타이틀
    equipped_profile_image VARCHAR(50) DEFAULT NULL -- 장착한 프로필 이미지
);

CREATE TABLE item (
    name VARCHAR(30) PRIMARY KEY,
    price INTEGER NOT NULL,
    value VARCHAR(50) NOT NULL, -- 아이템 값 (타이틀이면 title name, 프로필 이미지면 image_loc, 방지권이면 방지권 종류)

    type VARCHAR(10) NOT NULL -- 아이템 종류 (title, profile_image)
);

CREATE TABLE inventory (
    user_id VARCHAR(20) NOT NULL,
    item_name VARCHAR(30) NOT NULL,
    quantity INT DEFAULT 0,
    
    PRIMARY KEY(user_id, item_name),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (item_name) REFERENCES item(name) ON DELETE CASCADE
);

CREATE TABLE map (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    user_id VARCHAR(20) NOT NULL,
    map VARCHAR(7) NOT NULL,

    UNIQUE(user_id, map),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE forecast(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,

    submitted_at TIMESTAMP NOT NULL, -- 유저가 예측 버튼 누른 시점 (쿨타임 계산용)
    forecast_map VARCHAR(7) NOT NULL,
    forecast_time DATETIME NOT NULL,
    forecast_type VARCHAR(10) NOT NULL, -- 예측 종류 (기온, 강수량, 습도 등)
    predicted_value VARCHAR(10) NOT NULL, -- 예측 값
    used_point INTEGER NOT NULL DEFAULT 0,
    beting_type VARCHAR(10) NOT NULL, -- 배팅 종류 (역/정배)

    is_correct BOOLEAN DEFAULT FALSE, -- 예측 성공 여부
    is_settled BOOLEAN DEFAULT FALSE, -- 정산 여부

    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_cooldown (user_id, submitted_at DESC) -- 쿨타임 조회용 (최적화)
);

CREATE TABLE damagochi (
    user_id VARCHAR(20) PRIMARY KEY,

    name VARCHAR(20) NOT NULL DEFAULT '고치',
    level INTEGER NOT NULL DEFAULT 1,
    exp INTEGER NOT NULL DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE weekly_stat ( -- 주간랭킹용
    user_id VARCHAR(20) PRIMARY KEY,
    success_count INTEGER UNSIGNED NOT NULL DEFAULT 0, -- 주간 예측 성공 횟수 (음수 불가)
    earned_point INTEGER NOT NULL DEFAULT 0, -- 주간 획득 포인트

    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);