# SkpPick
> 날씨 예측 프로그램

---

## 목차 
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [START](#-START)

---

## 주요 기능
- **날씨 예측**: 설명
- **상점**: 설명
- **랭킹**: 설명

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
   - `.env.example` 파일을 복사 후 `.env` 파일 생성
   ```bash
   cp .env.example .env
   ```
4. DB 테이블 생성 및 데이터 주입
   - `schema.sql` 코드 복사 후, `MySQL Workbench` 등에서 실행
   - `./src/assets/data/` 폴더의 `insert_shop_data.sql` 쿼리 복사 후 실행
   - `./src/assets/scripts/` 폴더의 `insert_json_shopManager.js` 파일 실행

4. 서버 실행
   ```bash
   node ./src/app.js
   ```

---

## 사용 (작성 예정)