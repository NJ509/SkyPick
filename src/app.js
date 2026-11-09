// 서버 실행 파일
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import http from "http";
import fs from "node:fs";

import userApi from "./js/api/user.js";
import rankApi from "./js/api/rank.js";
import shopApi from "./js/api/shop.js";
import weatherApi from "./js/api/weather.js";
import predictionApi from "./js/api/predictionController.js";
import collectionApi from "./js/api/collection.js";
import damagochiApi from "./js/api/damagochi.js";
import { settleDueForecasts } from "./js/utils/forecastSettlement.js";

const result = dotenv.config({path: new URL('../.env', import.meta.url)});
const allowedOrigins = new Set(
  (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

console.log("[LOG] env loaded: " +result);
class Database {
  constructor() {
    this.db = mysql.createPool({
      host: process.env.db_host,
      port: process.env.db_port,
      user: process.env.db_user,
      password: process.env.db_password,
      database: process.env.db_name,
    });
    console.log("[LOG] DB CONNECTION SUCCESS");
  }

  getConnection() {
    console.log("[LOG] DB CONNECTION REQUEST");
    return this.db.getConnection();
  }

  //  에러는 서비스에서
  /**  사실 얘는 필요 없을 것 같긴 한데 혹시 모르니까
   * DB 쿼리 실행
   * @param {*} query  SQL 쿼리문
   * @param  {...params}  params 쿼리 '?' 에 들어갈 값
   * @returns {Promise} 쿼리 결과 (값, 메타데이터)
   */
  async executeQueryVM(query, ...params) {
    return await this.db.execute(query, params);
  }
  /**
   * DB 쿼리 실행
   * @param {*} query  SQL 쿼리문
   * @param  {...params} params 쿼리- '?' 에 들어갈 값
   * @returns {Promise} 쿼리 결과 (값, 메타데이터)
   */
  async executeQueryV(query, ...params) {
    const [row] = await this.db.execute(query, params);
    return row;
  }

  /**
   * 트랜잭션에서 DB 쿼리 실행
   * @param {*} connection 트랜잭션 연결 객체
   * @param {*} query 쿼리문
   * @param  {...any} params 파라미터
   * @returns 寃곌낵媛?
   */
  async executeQueryForTransaction(connection, query, ...params) {
    const [row] = await connection.execute(query, params);
    return row;
  }
}

const db = new Database();
export { db };

function sendPage(requestUrl, response) {
    try {
        const fileName = decodeURIComponent(requestUrl);

        // pages 폴더 밖으로 밖 불가임
        if (fileName.includes("..") || fileName.includes("\\")) {
            response.writeHead(403);
            return response.end();
        }

        let contentType;
        // 프사? 암튼 이미지들
        if (fileName.startsWith("/images/")) {
            let imageType;

            if (fileName.endsWith(".png")) {
                imageType = "image/png";
            } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                imageType = "image/jpeg";
            } else if (fileName.endsWith(".webp")) {
                imageType = "image/webp";
            } else {
                response.writeHead(404);
                return response.end();
            }

            const image = fs.readFileSync(
                new URL("../public" + fileName, import.meta.url)
            );

            response.writeHead(200, { "Content-Type": imageType });
            return response.end(image);
        }

        if (fileName.endsWith(".html")) {
            contentType = "text/html; charset=utf-8";
        } else if (fileName.endsWith(".js")) {
            contentType = "text/javascript; charset=utf-8";
        } else if (fileName.endsWith(".css")) {
            contentType = "text/css; charset=utf-8";
        } else {
            response.writeHead(404);
            return response.end();
        }

        let file;

        if (fileName === "/style.css") {
            file = fs.readFileSync(
                new URL("./style.css", import.meta.url)
            );
        } else {
            file = fs.readFileSync(
                new URL("./pages" + fileName, import.meta.url)
            );
        }

        response.writeHead(200, { "Content-Type": contentType });
        response.end(file);
    } catch {
        response.writeHead(404);
        response.end("파일을 찾을 수 없습니다.");
    }
}

const server = http
  .createServer((request, response) => {
    response.setHeader("Content-Type", "application/json;charset=UTF-8");
    response.setHeader("Vary", "Origin");

    const origin = request.headers.origin;
    if (origin && !allowedOrigins.has(origin)) {
      response.writeHead(403);
      response.end(JSON.stringify({ error: "허용되지 않은 origin입니다." }));
      return;
    }

    if (origin) {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Access-Control-Allow-Credentials", "true");
    }

    if (request.method === "OPTIONS") {
      response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type");
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method === "GET") {
        const url = new URL(request.url, "http://localhost:3000");
        const queryParams = url.searchParams;
        let requestUrl = request.url;
        if(requestUrl) {
            requestUrl = url.pathname;
        }

        let body = "";
        request.on("data", (chunk) => {
            body += chunk;
        })

      request.on("end", async () => {
        try {
          request.body = body ? JSON.parse(body) : {};

                if (requestUrl === "/rank") {
                    return await rankApi.showRanking(request, response, queryParams.get("type"));
                }
                if(requestUrl === "/shop") {
                    return await shopApi.showShopList(response);
                }
                if (requestUrl === "/api/weather") {
                    return await weatherApi.showWeather(request, response, queryParams);
                }
                if (requestUrl === "/api/predictionController") {
                  return await predictionApi.showPredictionList(
                      request,
                      response,
                      queryParams
                  );
              }
                if(requestUrl === "/collection") {
                    return await collectionApi.showCollection(request, response, queryParams.get("type"));
                }
                if(requestUrl === "/damagochi") {
                    return await damagochiApi.showDamagochi(request, response);
                }
                if(requestUrl === "/point") {
                    return await userApi.showPoint(request, response);
                }
                if(requestUrl === "/equip") {
                    return await userApi.equipItem(request, response, queryParams.get("type"), queryParams.get("item_id"));
                }

                return sendPage(requestUrl, response); // 페이지 ㅂㅂ여주기 (/ranking.html → ./src/pages/ranking.html)
            } catch (e) {
                console.log("[ERROR] " +e)
                response.destroy();
            }
        })
    } else if (request.method === "POST") {
        const url = new URL(request.url, "http://localhost:3000");
        const queryParams = url.searchParams;
        let requestUrl = request.url;
        if (requestUrl) {
            requestUrl = url.pathname;
        }

        let body = "";

        request.on("data", (chunk) => {
            body += chunk;
        });

        request.on("end", async () => {
            try {
                request.body = body ? JSON.parse(body) : {};

                if (requestUrl === "/login") {
                    return await userApi.login(request, response);
                }
                if (requestUrl === "/signup") {
                    return await userApi.signup(request, response);
                }
                if (requestUrl === "/shop") {
                    return await shopApi.buyItem(request, response);
                }
                if (requestUrl === "/damagochi") {
                    return await damagochiApi.newDamagochi(request, response);
                }
                if (requestUrl === "/damagochi/exp") {
                    return await damagochiApi.eatExp(request, response);
                }
                if (requestUrl === "/damagochi/name") {
                    return await damagochiApi.changeName(request, response);
                }
                if (requestUrl === "/api/predictionController") {
                    return await predictionApi.createPrediction(request, response);
                }


                response.writeHead(404);
                response.end(JSON.stringify({error: "Not Found"}));
            } catch (e) {
                console.log("[ERROR] " + e);
                response.destroy();
            }
        });

        return;
    } else if (request.method === "PUT") {
    } else if (request.method === "DELETE") {
    } else {
      response.writeHead(405);
      response.end(JSON.stringify({ error: "지원되지 않는 메서드 요청 형식" }));
    }
  })
  .listen(3000, () => {
    console.log("Server running at http://localhost:3000/");
    console.log("Home: http://localhost:3000/home.html");
  });
// 자동 정산 실행
let isSettling = false;

async function runSettlement() {
    // 이전 정산이 아직 진행 중이면 중복 실행 방지
    if (isSettling) return;

    isSettling = true;

    try {
        await settleDueForecasts();
    } catch (error) {
        console.error("[정산 실행 오류]", error);
    } finally {
        isSettling = false;
    }
}

// 서버 시작 후 정산 실행
runSettlement();

// 1분마다 정산 대상 확인
setInterval(runSettlement, 60 * 1000);

