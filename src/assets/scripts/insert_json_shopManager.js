import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 현재 파일 루트
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const result = dotenv.config({
    path: path.resolve(__dirname, "../../../.env"),
});

console.log("[LOG] env loaded: SUCCESS");

const db = mysql.createPool({
    host: process.env.db_host,
    port: Number(process.env.db_port),
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name,
});

// JSON 저장 경로
const OUTPUT_PATH = path.resolve(
    __dirname,
    "../data/shopManager.json"
);

async function exportShop() {
    try {
        console.log("[LOG] SHOP DATA EXPORT START");

        const [items] = await db.execute(`
            SELECT id, name, price, value, type
            FROM item
            ORDER BY id ASC, type, price, name
        `);

        await fs.mkdir(path.dirname(OUTPUT_PATH), {
            recursive: true,
        });

        await fs.writeFile(
            OUTPUT_PATH,
            JSON.stringify(items, null, 2),
            "utf8"
        );

        console.log(`[LOG] SHOP DATA SAVED: ${OUTPUT_PATH}`);
        console.log(`[LOG] ITEM COUNT: ${items.length}`);
    } catch (error) {
        console.error("[ERROR] SHOP DATA EXPORT FAILED:", error);
    } finally {
        await db.end();
    }
}

exportShop();