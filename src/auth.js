import bcrypt from "bcrypt";
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url";

import { db } from "./app.js";
import {AUTH_RESULT} from "./js/enums/authResult.js";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(
    __dirname,
    "./assets/data/shopManager.json"
);

/**
 * 유저 로그인 처리
 * @param {*} id input id
 * @param {*} password input pwd
 * @returns 성공 시 status: 200, 실패 시 ERROR
 */
async function doLogin(id, password) {
  if (!id || !password) throw new Error("ID OR PWD IS EMPTY");

  try {
    const query = "SELECT id, password FROM user WHERE id = ?";
    const rows = await db.executeQueryV(query, id);
    const row = rows[0];

    if(row == undefined) {
          return {
              code: AUTH_RESULT.INVALID_CREDENTIALS,
          }
    }

    const verifyedPwd = await verifyPwd(row.password, password); // 스펠링 verifyed가 맞나..?
    if (!verifyedPwd)
      return {
        code: AUTH_RESULT.INVALID_CREDENTIALS,
      };
    else if (verifyedPwd)
      return {
        code: AUTH_RESULT.SUCCESS,
        userId: row.id,
      };
    else
      return {
        code: AUTH_RESULT.FAILED,
      };
  } catch (error) {
    console.log("[ERROR] LOGIN: "+ error);
    throw error;
  }
}

/**
 * 유저 회원가입 처리 <br>
 * 계정 생성, 초반 예측 지역 선택 <br>
 *
 * 회원가입, 지역 선택 모두 성공 시 회원가입 성공, DB 업데이트 <br>
 * 회원가입 실패 또는 지역 선택 실패 시 DB 롤백
 * @param {*} id 입력받은 유저 ID
 * @param {*} password 입력받은 유저 Pwd
 * @param {*} name 입력받은 유저 이름
 * @param {*} map 초반 예측 지역 선택: 서울 | 인천 | 경기 | 강원 | 충북 | 충남 | 대전 | 전북 | 전남 | 광주 | 경북 | 경남 | 대구 | 울산 | 부산
 * @returns 회원가입 성공 시 status: 201, 실패 시 status: 409
 */
async function signup(id, password, name, map) {
  console.log("[LOG] SIGNUP REQUEST: ", id);
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const query = "INSERT INTO user (id, password, name) VALUES (?, ?, ?)";
    const hashedPassword = await hashPassword(password);

    const result = await db.executeQueryForTransaction(
      connection,
      query,
      id,
      hashedPassword,
      name,
    );
    console.log("[LOG] SIGNUP SUCCESS: ", result ? true : false);

    const mapResult = await newMap(id, map, connection);
    console.log("[LOG] MAP INSERT SUCCESS: ", result ? true : false);

    await connection.commit();
    connection.release(); // 반환에 if 해줘야 할려나?
    console.log("[LOG] SIGNUP SUCCESS: ", id);

    return {
        code: AUTH_RESULT.SUCCESS,
      userId: result.id,
        map: mapResult.result,
    };
  } catch (e) {
    await connection.rollback();
    connection.release();

    if (e.code == "ER_DUP_ENTRY") {
      return {
          code: AUTH_RESULT.ALREADY_EXISTS,
      };
    } else if (e.message === "MAP IS NOT VALID") {
        return {
            code: AUTH_RESULT.NOT_VALID,
        };
    } else if (e.message === "TRANSACTION_MAP_INSERT_FAILED") {
        return {
            code: AUTH_RESULT.FAILED,
        };
    } else {
      throw new Error("DB ERROR");
    }
  }
}

// bi dong gi
/**
 * 비밀번호 해싱
 * @param {*} password input pwd
 * @returns 해싱된 비밀번호
 */
async function hashPassword(password) {
  const saltRound = 10;
  const salt = await bcrypt.genSalt(saltRound);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("[LOG] HASHED SUCCESS");

  return hashedPassword;
}
async function verifyPwd(hashedPwd, inputPwd) {
  try {
    return await bcrypt.compare(inputPwd, hashedPwd);
  } catch (error) {
    console.error("[LOG] Error : verifying password:", error);
    return false;
  }
}

/**
 * 예측 가능 지역 추가 <br>
 * mapList에 없으면 불가 <br>
 * mapList: 서울 | 인천 | 경기 | 강원 | 충북 | 충남 | 대전 | 전북 | 전남 | 광주 | 경북 | 경남 | 대구 | 울산 | 부산
 * @param {*} user_id 유저 ID
 * @param {*} map 추가할 예측 가능 지역
 * @param {*} connection DB connection
 * @returns 성공 201, 실패 500
 */
async function newMap(user_id, map, connection = null) {
  if (!user_id || !map) throw new Error("USER_ID OR MAP IS EMPTY");

  const mapList =
    "서울 | 인천 | 경기 | 강원 | 충북 | 충남 | 대전 | 전북 | 전남 | 광주 | 경북 | 경남 | 대구 | 울산 | 부산";
  const query = "INSERT INTO map (user_id, map) VALUES (?, ?)";

  if (!mapList.split(" | ").includes(map)) {
    throw new Error("MAP IS NOT VALID");
  }

  let result;
  if (connection) {
    result = await db.executeQueryForTransaction(
      connection,
      query,
      user_id,
      map,
    );
  } else {
    result = await db.executeQueryV(query, user_id, map);
  }

  if(connection && result.affectedRows == 0) {
      throw new Error("TRANSACTION_MAP_INSERT_FAILED");
  }
  if (result.affectedRows == 0) {
    return {
        code: AUTH_RESULT.FAILED,
    };
  }

  return {
      code: AUTH_RESULT.SUCCESS,
    result: result,
  };
}

/**
 * 유저 ID로 정보 조회
 * @param {*} id 유저 ID
 * @returns 유저 데이터, 200. <br> id 조회 시 없으면 404, 그 외 오류 500
 */
async function findByUserId(id) {
  const query = "SELECT * FROM user WHERE id = ?";
  try {
    const row = await db.executeQueryV(query, id);
    if (!row)
      return {
        code: AUTH_RESULT.NOT_FOUND,
      };
    else
      return {
        code: AUTH_RESULT.SUCCESS,
        data: row,
      };
  } catch (e) {
    console.log(e); // 일단 임시
    return {
      status: 500, // 상태코드 그대로 보내는 건 일단 임시로 해둔 거
      message: "Server OR DB ERROR",
    };
  }
}

/**
 *
 * @param {*} id 유저 ID
 * @param {*} value 변경할 값
 * @param {*} type 변경할 컬럼명 (type: "point" | "current_streak" | "equipped_title" | "equipped_profile_image")
 * @returns 업데이트 성공 시 status: 204, 실패 시 status: 500
 */
async function updateUser(id, value, type, connection = null) {
  const query = `UPDATE user SET ${type} = ? WHERE id = ?`;
  try {
    if (connection) {
      await db.executeQueryForTransaction(connection, query, value, id);
    } else {
      await db.executeQueryV(query, value, id);
    }
    return {
      status: 204, // n c
    };
  } catch (e) {
    console.log(e); // 일단 임시
    return {
      status: 500,
      message: "Update User Failed",
    };
  }
}

/**
 * 인벤토리 업데이트 <br>
 * 인벤토리 변경 실패 시, 해당 유저의 인벤토리 조회해서 행 있는데, 실패한거면 status: 500, <br>
 * 행 없으면 INSERT 후 status: 204
 * @param {*} id 유저 id
 * @param {*} itemId 아이템 ID
 * @param {*} quantity 변경할 수량
 * @returns 성공 시 status: 204, 실패 시 status: 500
 */
async function inventoryUpdate(userId, itemId, quantity, connection = null) {
  try {
    const selectQuery = "SELECT user_id FROM inventory WHERE user_id = ? AND item_id = ?";
    const rows = connection
      ? await db.executeQueryForTransaction(connection, selectQuery, userId, itemId)
      : await db.executeQueryV(selectQuery, userId, itemId);

    if (rows.length > 0) {
      const updateQuery = "UPDATE inventory SET quantity = ? WHERE user_id = ? AND item_id = ?";
      if (connection) {
        await db.executeQueryForTransaction(connection, updateQuery, quantity, userId, itemId);
      } else {
        await db.executeQueryV(updateQuery, quantity, userId, itemId);
      }
    } else {
      const insertQuery = "INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?)";
      if (connection) {
        await db.executeQueryForTransaction(connection, insertQuery, userId, itemId, quantity);
      } else {
        await db.executeQueryV(insertQuery, userId, itemId, quantity);
      }
    }

    return { code: AUTH_RESULT.SUCCESS };
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "Update Inventory Failed",
    };
  }
}

/**
 * 유저 인벤토리 조회
 * @param {*} id 유저 ID
 * @returns 인벤토리 데이터, 204. 오류 : 500
 */
async function getInventory(id, connection = null) {
  const query = "SELECT * FROM inventory WHERE user_id = ?";
  try {
    return {
      code: AUTH_RESULT.SUCCESS, 
      data: connection ? await db.executeQueryForTransaction(connection, query, id): await db.executeQueryV(query, id),
    };
  } catch (e) {
    console.log(e); // 일단 임시
    return {
      status: 500,
      message: "Server OR DB ERROR",
    };
  }
}

async function showRanking(type) {
    let query = "";
    if(type === "total") {
        query = "SELECT id, name, point, current_streak, equipped_title, equipped_profile_image FROM user ORDER BY point DESC, current_streak DESC LIMIT 100";
    } else if (type === "weekend") {
        query = "SELECT * FROM weekly_stat ORDER BY earned_point DESC, success_count DESC LIMIT 100"; // 여기 나중에 칭호나 프사도 가능하게 해줘야 함.
    } else return { code: AUTH_RESULT.NOT_VALID };

    const rows = await db.executeQueryV(query);
    const row = rows[0];

    if(!row) return { code: AUTH_RESULT.FAILED }

    return {
        code: AUTH_RESULT.SUCCESS,
        data: row
    };
}


// SHOP ---
async function getShopList() {
    const data = await fs.readFile(filePath, "utf8");
    const result = JSON.parse(data);

    console.log("[LOG] shopManager.json Loaded");
    return JSON.stringify(result);
}

async function buyItem(userId, itemId) {
    const connection = await db.getConnection();
    let transactionStarted = false;
    try {
        await connection.beginTransaction();
        transactionStarted = true;

        const users = await db.executeQueryForTransaction(
            connection,
            "SELECT id, point FROM user WHERE id = ? FOR UPDATE",
            userId
        );
        const user = users[0];
        if(!user) {
            await connection.rollback();
            transactionStarted = false;
            return {
                code: AUTH_RESULT.INVALID_CREDENTIALS
            };
        }

        const havingPoint = Number(user.point);
        if (!Number.isFinite(havingPoint)) {
            throw new Error(`Invalid point balance for user ${userId}: ${user.point}`);
        }

        const items = JSON.parse(await getShopList());
        const item = items.find((value) => value.id === Number(itemId));
        if (!item) {
            await connection.rollback();
            transactionStarted = false;
            return {
                code: AUTH_RESULT.NOT_FOUND,
            };
        }

        const itemPrice = Number(item.price);
        if (!Number.isInteger(itemPrice) || itemPrice < 0) {
            throw new Error(`Invalid item price: ${item.price}`);
        }

        if(havingPoint < itemPrice) {
            await connection.rollback();
            transactionStarted = false;
            return {
                code: AUTH_RESULT.NOT_VALID,
                data: { havingPoint, itemPrice },
            }
        }

        if (itemPrice > 0) {
            const pointUpdate = await db.executeQueryForTransaction(
                connection,
                "UPDATE user SET point = point - ? WHERE id = ? AND point >= ?",
                itemPrice,
                userId,
                itemPrice
            );
            if (pointUpdate.affectedRows !== 1) {
                throw new Error(`Point update affected ${pointUpdate.affectedRows} rows for user ${userId}`);
            }
        }

        const [previousItem] = await db.executeQueryForTransaction(
            connection,
            "SELECT quantity FROM inventory WHERE user_id = ? AND item_id = ? FOR UPDATE",
            userId,
            Number(itemId)
        );
        const expectedQuantity = Number(previousItem?.quantity ?? 0) + 1;

        const inventoryUpdate = await db.executeQueryForTransaction(
            connection,
            "INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, 1) " +
                "ON DUPLICATE KEY UPDATE quantity = COALESCE(quantity, 0) + 1",
            userId,
            Number(itemId)
        );
        if (inventoryUpdate.affectedRows < 1) {
            throw new Error(`Inventory update affected ${inventoryUpdate.affectedRows} rows for user ${userId}, item ${itemId}`);
        }

        const [updatedUser] = await db.executeQueryForTransaction(
            connection,
            "SELECT point FROM user WHERE id = ?",
            userId
        );
        const [updatedItem] = await db.executeQueryForTransaction(
            connection,
            "SELECT quantity FROM inventory WHERE user_id = ? AND item_id = ?",
            userId,
            Number(itemId)
        );
        const expectedPoint = Number(havingPoint) - itemPrice;
        if (!updatedUser || Number(updatedUser.point) !== expectedPoint || !updatedItem || Number(updatedItem.quantity) !== expectedQuantity) {
            throw new Error(`Purchase readback mismatch: user=${JSON.stringify(updatedUser)}, inventory=${JSON.stringify(updatedItem)}`);
        }

        await connection.commit();
        transactionStarted = false;

        return {
            code: AUTH_RESULT.SUCCESS,
            message: AUTH_RESULT.SUCCESS,
            data: {
                point: Number(updatedUser.point),
                itemId: Number(itemId),
                quantity: Number(updatedItem.quantity),
            }
        };

    } catch (e) {
        if (transactionStarted) {
            await connection.rollback();
            transactionStarted = false;
        }

        console.log("[ERROR] Failed Buy Item: " +e);

        return {
            code: AUTH_RESULT.FAILED,
            message: AUTH_RESULT.FAILED
        }
    } finally {
        connection.release();
    }
}
// ---
export default {
    doLogin,
    signup,
    newMap,
    findByUserId,
    updateUser,
    inventoryUpdate,
    getInventory,
    getShopList,
    buyItem,
    showRanking,
};
