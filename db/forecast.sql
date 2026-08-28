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