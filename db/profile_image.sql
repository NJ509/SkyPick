CREATE TABLE profile_image (
    user_id VARCHAR(20) NOT NULL,
    image_loc VARCHAR(50) NOT NULL, -- 파일 경로 \public\images\[img name].webp

    PRIMARY KEY(user_id, image_loc),
    FOREIGN KEY user_id REFERENCES user(id) ON DELETE CASCADE
)