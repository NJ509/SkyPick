// ?쒕쾭 ?ㅽ뻾 ?뚯씪
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import http from "http";
import userApi from "./js/api/user.js";
import rankApi from "./js/api/rank.js";
import weatherApi from "./js/api/weather.js";
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

  // ?먮윭???쒕퉬?ㅼ뿉??
  /** ?ъ떎 ?섎뒗 ?꾩슂 ?놁쓣 寃?媛숆릿 ?쒕뜲 ?뱀떆 紐⑤Ⅴ?덇퉴
   * DB 荑쇰━ ?ㅽ뻾
   * @param {*} query  SQL 荑쇰━臾?
   * @param  {...params} params 荑쇰━ '?' ???ㅼ뼱媛?媛?
   * @returns {Promise} 荑쇰━ 寃곌낵 (媛? 硫뷀??곗씠??
   */
  async executeQueryVM(query, ...params) {
    return await this.db.execute(query, params);
  }
  /**
   * DB 荑쇰━ ?ㅽ뻾
   * @param {*} query  SQL 荑쇰━臾?
   * @param  {...params} params 荑쇰━ '?' ???ㅼ뼱媛?媛?
   * @returns {Promise} 荑쇰━ 寃곌낵 (媛?
   */
  async executeQueryV(query, ...params) {
    const [row] = await this.db.execute(query, params);
    return row;
  }

  /**
   * ?몃옖??뀡?먯꽌 DB 荑쇰━ ?ㅽ뻾
   * @param {*} connection ?몃옖??뀡 ?곌껐 媛앹껜
   * @param {*} query 荑쇰━臾?
   * @param  {...any} params ?뚮씪誘명꽣
   * @returns 寃곌낵媛?
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

        let requestUrl = request.url;
        if(requestUrl) {
            requestUrl = url.pathname;
        }
        const queryParams = url.searchParams;

        let body = "";
        request.on("data", (chunk) => {
            body += chunk;
        });

        request.on("end", async () => {
            try {
                request.body = body ? JSON.parse(body) : {};

                if (requestUrl === "/rank") {
                    return await rankApi.showRanking(request, response, queryParams.get("type"));
                }if (requestUrl === "/api/weather") {
                    return await weatherApi.showWeather(request, response, queryParams);
                }
                if (requestUrl === "/api/grid") {
                    return await weatherApi.showGrid(request, response, queryParams);
                }

                return;
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
      response.end(JSON.stringify({ error: "吏?먮릺吏 ?딅뒗 硫붿꽌???붿껌 ?뺤떇" }));
    }
  })
  .listen(3000, () => {
    console.log("Server running at http://localhost:3000/");
  });

