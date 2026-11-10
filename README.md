# SkyPick
> 날씨 예측 프로그램

---

## 목차 
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [START](#-START)

---

## 주요 기능
- **날씨 예측**:
- **상점**:
- **랭킹**:

---

## 기술 스택

| 분류 | 기술 이름                 |
| :--- |:----------------------|
| **Frontend** | HTML, CSS, Vanilla JS |
| **Backend** | Vanilla JS, Node.js   |
| **Database** | MySQL                 |

---

## START
### 환경 요구 사항
- **Node.js**: v24.14.0 (18.x 이상)
- **npm**: 11.9.0 (9.x 이상)
- **MySQL**: v8.0 (8.x 이상)

### 설치 및 실행 순서
1. 레포 클론 
   ```bash
   git clone https://github.com/NJ509/SkyPick
   cd SkyPick
   ```

2. 의존성 설치
   ```bash
   npm install
   ```

3. 환경 변수 설정 
   - `.env.example` 파일을 복사 후 `.env` 파일 생성 후 환경 변수 설정
   ```bash
   cp .env.example .env
   ```
4. DB 테이블 생성 및 데이터 주입
   - `schema.sql` 코드 복사 후, `MySQL Workbench` 등에서 실행
   - `./src/assets/data/` 폴더의 `insert_shop_data.sql` 쿼리 복사 후 실행
   - `./src/assets/scripts/` 폴더의 `insert_json_shopManager.js` 파일 실행
   ```bash
    node src/assets/scripts/insert_json_shopManager.js
    ```
4. 서버 실행
   ```bash
   node ./src/app.js
   ```

---

## 사용
- **로그인 후 서비스 이용 가능**: http://localhost:3000/signup.html 또는 http://localhost:3000/login.html
- **홈 화면**: http://localhost:3000/home.html


## 테스트 계정
- 별도로 제공되는 테스트 계정은 없습니다.
- 두 가지 방법으로 테스트 계정 생성이 가능합니다.
 1. 직접 계정 생성: 위 실행 과정을 완료한 뒤, `localhost:3000/signup.html`에 접속하여 테스트 계정을 생성하기
 2. 아래 SQL 스키마 복사 후, 실행하기
    공통 비밀번호: `SkyPick123!`
    로그인: localhost:3000/login.html
    | 아이디 | 용도 | 초기 포인트 |
| --- | --- | ---: |
| `skypick_test` | 구매 / 도감 / 예측 내역 / 다마고치 테스트 | 20,000 |
| `skypick_rank` | 랭킹, 다마고치 확인 | 12,000 |
| `skypick_new` | 신규 유저 상태 | 500 |
   ```sql
   USE skypick;

SET NAMES utf8mb4;

SET @test_password =
    '$2b$10$gY3vF78gWBv2/n6WPsBzI.EnJn3M00ELsckouIw98cPNG8XaU2ite';

SET @seed_time = NOW();

START TRANSACTION;

INSERT INTO user (
    id, password, name, point, current_streak,
    equipped_title, equipped_profile_image
)
VALUES
    ('skypick_test', @test_password, '날씨 테스트',
     20000, 2, '봄', NULL),
    ('skypick_rank', @test_password, '랭킹 테스트',
     12000, 1, '인간 기상청', NULL),
    ('skypick_new', @test_password, '신규유저 테스트',
     500, 0, NULL, NULL);

INSERT INTO map (user_id, map)
VALUES
    ('skypick_test', '서울'),
    ('skypick_test', '부산'),
    ('skypick_test', '인천'),
    ('skypick_rank', '부산'),
    ('skypick_rank', '경기'),
    ('skypick_new', '서울');

INSERT INTO inventory (user_id, item_id, quantity)
SELECT owned.user_id, MIN(i.id), owned.quantity
FROM (
    SELECT 'skypick_test' AS user_id,
           'title' AS item_type,
           '봄' AS item_value,
           1 AS quantity
    UNION ALL
    SELECT 'skypick_test', 'title', '서울', 1
    UNION ALL
    SELECT 'skypick_test', 'profile_image', 'bee.png', 1
    UNION ALL
    SELECT 'skypick_test', 'profile_image', 'rabbit.png', 1
    UNION ALL
    SELECT 'skypick_test', 'usage_item', 'bet_refund_25', 3
    UNION ALL
    SELECT 'skypick_rank', 'title', '인간 기상청', 1
    UNION ALL
    SELECT 'skypick_rank', 'profile_image', 'cloud.png', 1
) AS owned
JOIN item AS i
    ON i.type = owned.item_type
   AND i.value = owned.item_value
GROUP BY
    owned.user_id, owned.item_type,
    owned.item_value, owned.quantity;

INSERT INTO forecast (
    user_id, submitted_at, forecast_map, forecast_time,
    forecast_type, predicted_value, used_point,
    beting_type, is_correct, is_settled
)
VALUES
    (
        'skypick_test',
        DATE_SUB(@seed_time, INTERVAL 12 HOUR),
        '서울',
        DATE_SUB(@seed_time, INTERVAL 8 HOUR),
        'weather', '맑음', 100, '정배', TRUE, TRUE
    ),
    (
        'skypick_test',
        DATE_SUB(@seed_time, INTERVAL 10 HOUR),
        '부산',
        DATE_SUB(@seed_time, INTERVAL 6 HOUR),
        'temperature', '20', 200, '정배', FALSE, TRUE
    ),
    (
        'skypick_test',
        DATE_SUB(@seed_time, INTERVAL 8 HOUR),
        '인천',
        DATE_SUB(@seed_time, INTERVAL 4 HOUR),
        'humidity', '60', 100, '역배', TRUE, TRUE
    ),
    (
        'skypick_test',
        @seed_time,
        '서울',
        DATE_ADD(@seed_time, INTERVAL 4 HOUR),
        'rain', '0', 100, '정배', FALSE, FALSE
    ),
    (
        'skypick_rank',
        DATE_SUB(@seed_time, INTERVAL 9 HOUR),
        '경기',
        DATE_SUB(@seed_time, INTERVAL 5 HOUR),
        'humidity', '80', 100, '정배', FALSE, TRUE
    ),
    (
        'skypick_rank',
        DATE_SUB(@seed_time, INTERVAL 7 HOUR),
        '부산',
        DATE_SUB(@seed_time, INTERVAL 3 HOUR),
        'weather', '흐림', 300, '역배', TRUE, TRUE
    );

INSERT INTO damagochi (user_id, name, level, exp)
VALUES
    ('skypick_test', '구름이', 3, 90),
    ('skypick_rank', '햇살이', 7, 50);

INSERT INTO weekly_stat (user_id, success_count, earned_point)
VALUES
    ('skypick_test', 2, 265),
    ('skypick_rank', 1, 250),
    ('skypick_new', 0, 0);

COMMIT;
   ```
