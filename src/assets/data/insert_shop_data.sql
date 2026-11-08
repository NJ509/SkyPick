INSERT INTO item (name, price, value, type)
VALUES
-- 프로필 이미지
('꿀벌', 1500, 'bee.png', 'profile_image'),
('북극여우', 1500, 'arctic_fox.png', 'profile_image'),
('토끼', 1500, 'rabbit.png', 'profile_image'),
('지구', 1500, 'earth.png', 'profile_image'),
('해파리', 1500, 'jellyfish.png', 'profile_image'),
('소라', 1500, 'shell.png', 'profile_image'),
('햄스터', 1500, 'hamster.png', 'profile_image'),
('개구리', 1500, 'frog.png', 'profile_image'),
('해', 1500, 'sun.png', 'profile_image'),
('구름', 1500, 'cloud.png', 'profile_image'),
('우산', 1500, 'umbrella.png', 'profile_image'),
('아기', 1500, 'baby.png', 'profile_image'),
('우주인', 1500, 'astronaut.png', 'profile_image'),
('요정', 1500, 'fairy.png', 'profile_image'),
('탐험가', 1500, 'explorer.png', 'profile_image'),
('유령 아이', 1500, 'ghost_child.png', 'profile_image'),
('공룡 후드 아이', 1500, 'dinosaur_hood_child.png', 'profile_image'),
('곰 후드 아이', 1500, 'bear_hood_child.png', 'profile_image'),
('잠옷 아이', 1500, 'pajama_child.png', 'profile_image'),
('해적', 1500, 'pirate.png', 'profile_image'),

-- 구매 칭호
('제우스', 7000, '제우스', 'title'),
('토르', 7000, '토르', 'title'),
('인간 기상청', 6000, '인간 기상청', 'title'),

('봄', 3500, '봄', 'title'),
('여름', 3500, '여름', 'title'),
('가을', 3500, '가을', 'title'),
('겨울', 3500, '겨울', 'title'),

('말벌', 3000, '말벌', 'title'),

('서울', 2500, '서울', 'title'),
('인천', 2500, '인천', 'title'),
('경기', 2500, '경기', 'title'),
('강원', 2500, '강원', 'title'),
('충청남도', 2500, '충청남도', 'title'),
('충청북도', 2500, '충청북도', 'title'),
('대전', 2500, '대전', 'title'),
('전라남도', 2500, '전라남도', 'title'),
('전라북도', 2500, '전라북도', 'title'),
('광주', 2500, '광주', 'title'),
('경상남도', 2500, '경상남도', 'title'),
('경상북도', 2500, '경상북도', 'title'),
('대구', 2500, '대구', 'title'),
('울산', 2500, '울산', 'title'),
('부산', 2500, '부산', 'title'),

('꿀벌', 2000, '꿀벌', 'title'),

('식물러버', 1500, '식물러버', 'title'),
('꽃', 1500, '꽃', 'title'),
('매미', 1500, '매미', 'title'),
('달팽이', 1500, '달팽이', 'title'),

('동네 날씨 지킴이', 1000, '동네 날씨 지킴이', 'title'),
('지렁이', 1000, '지렁이', 'title'),
('모기', 1000, '모기', 'title'),

-- 플레이 아이템 - 시작값 (가격 증가는 서버에서 처리)
('지역 해금', 2500, 'region_unlock', 'usage_item'),
('예측 범위 해금', 700, 'prediction_range_unlock', 'usage_item'),
('예측 대상 해금', 700, 'prediction_target_unlock', 'usage_item'),
('배팅 실패 반환권', 1000, 'bet_refund_25', 'usage_item'),
('연승 보호권', 3000, 'streak_protection', 'usage_item'),
('뽑기', 500, 'gacha', 'usage_item');