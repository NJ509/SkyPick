// 서버 실행 파일
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import http from "http";
import userApi from "./js/api/user.js";
import rankApi from "./js/api/rank.js";
import shopApi from "./js/api/shop.js";
const result = dotenv.config({path: '../.env'});

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

  // 에러는 서비스에서
  /** 사실 얘는 필요 없을 것 같긴 한데 혹시 모르니까
   * DB 쿼리 실행
   * @param {*} query  SQL 쿼리문
   * @param  {...params} params 쿼리 '?' 에 들어갈 값
   * @returns {Promise} 쿼리 결과 (값, 메타데이터)
   */
  async executeQueryVM(query, ...params) {
    return await this.db.execute(query, params);
  }
  /**
   * DB 쿼리 실행
   * @param {*} query  SQL 쿼리문
   * @param  {...params} params 쿼리 '?' 에 들어갈 값
   * @returns {Promise} 쿼리 결과 (값)
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
   * @returns 결과값
   */
  async executeQueryForTransaction(connection, query, ...params) {
    const [row] = await connection.execute(query, params);
    return row;
  }
}

const db = new Database();
export { db };

const server = http
  .createServer((request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Content-Type", "application/json;charset=UTF-8");

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
                    return await rankApi.showRanking(queryParams.get("type"));
                }
                if(requestUrl === "/shop") {
                    return await shopApi.showShopList();
                }
            } catch (e) {
                console.log("[ERROR] " +e)
                response.destroy();
            }
        })
    } else if (request.method === "POST") {
            let body = "";

            request.on("data", (chunk) => {
                body += chunk;
            });

            request.on("end", async () => {
                try {
                request.body = body ? JSON.parse(body) : {};

                if (request.url === "/login") {
                    return await userApi.login(request, response);
                }
                if (request.url === "/signup") {
                    return await userApi.signup(request, response);
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
  });
