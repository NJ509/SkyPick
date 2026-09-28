import http from "http";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { getWeather } from "./weather.js";

dotenv.config();

class Database {
  constructor() {
    this.db = mysql.createPool({
      host: process.env.db_host,
      user: process.env.db_user,
      password: process.env.db_password,
      database: process.env.db_name,
    });
  }

  getConnection() {
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
}

const db = new Database();
export { db };

const server = http
  .createServer(async (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Content-Type", "application/json;charset=UTF-8");
    if (request.method === "GET") {
      if (request.url === "/") {
      }else if (request.url.startsWith("/api/weather")) {
        try {
          const url = new URL(request.url, "http://localhost:3000");

          const baseDate = url.searchParams.get("base_date");
          const baseTime = url.searchParams.get("base_time");
          const nx = url.searchParams.get("nx");
          const ny = url.searchParams.get("ny");

          const data = await getWeather(baseDate,baseTime,nx,ny);

          response.writeHead(200);
          response.end(JSON.stringify(data));
          
        } catch (error) {
          console.error(error);
          response.writeHead(500);
        }
      }
      else {
        response.writeHead(404);
      }
    } else if (request.method === "POST") {
    } else if (request.method === "PUT") {
    } else if (request.method === "DELETE") {
    } else {
      response.writeHead(404);
      response.end(JSON.stringify({ error: "Not Found" }));
    }
  })
  .listen(3000, () => {
    console.log("Server running at http://localhost:3000/");
  });
