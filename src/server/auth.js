import bcrypt from "bcrypt";
import db from "./app.js";

/**
 * 유저 로그인 처리
 * @param {*} id input id
 * @param {*} password input pwd
 * @returns 성공 시 status: 200, 실패 시 ERROR
 */
function doLogin(id, password) {
  if (!id || !password) throw new Error("ID OR PWD IS EMPTY");

  try {
    // 여기 비번 맞는지 조회하고 확인하는 거 해야 함
    const query = "SELECT id, password FROM user WHERE id = ?";
    const row = db.executeQueryV(query, id);

    if (!row || !verifyPwd(row.password, password))
      return {
        status: 401, // unauthorized
        message: "INVALID ID OR PASSWORD",
      };

    localStorage.setItem("userId", id);
  } catch (error) {
    throw new Error("LOCAL STORAGE OR DB SELECt ERROR");
  }

  return {
    status: 200,
    message: "LOGIN SUCCESS",
  };
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
  if (!id || !password || !name) throw new Error("ID OR PWD OR NAME IS EMPTY");

  const query = "INSERT INTO user (id, password, name) VALUES (?, ?, ?)";
  const hashedPassword = hashPassword(password);

  try {
    // const connection = await db.getConnection();
    // connection.beginTransaction();

    db.executeQueryV(query, id, hashedPassword, name);
    newMap(id, map);

    // connection.commit();
  } catch (e) {
    // connection.rollback();

    if (e.code == "ER_DUP_ENTRY") {
      return {
        status: 409, //Conflict
        message: "ID ALREADY EXISTS",
      };
    } else {
      throw new Error("DB ERROR");
    }
  } //finally {
  //   db.endTransaction();
  // }
  return {
    status: 201, // created
    message: "SIGNUP SUCCESS",
  };
}

// bi dong gi
/**
 * 비밀번호 해싱
 * @param {*} password input pwd
 * @param {*} salt salt
 * @returns 해싱된 비밀번호
 */
async function hashPassword(password) {
  const saltRound = 10;
  const salt = bcrypt.genSalt(saltRound);
  const hashedPassword = bcrypt.hash(password, salt);

  return hashedPassword;
}
async function verifyPwd(hashedPwd, inputPwd) {
  return bcrypt.compare(inputPwd, hashedPwd);
}

/**
 * 예측 가능 지역 추가 <br>
 * mapList에 없으면 불가 <br>
 * mapList: 서울 | 인천 | 경기 | 강원 | 충북 | 충남 | 대전 | 전북 | 전남 | 광주 | 경북 | 경남 | 대구 | 울산 | 부산
 * @param {*} user_id 유저 ID
 * @param {*} map 추가할 예측 가능 지역
 * @returns 성공 201, 실패 500
 */
async function newMap(user_id, map) {
  if (!user_id || !map) throw new Error("USER_ID OR MAP IS EMPTY");

  const mapList =
    "서울 | 인천 | 경기 | 강원 | 충북 | 충남 | 대전 | 전북 | 전남 | 광주 | 경북 | 경남 | 대구 | 울산 | 부산";
  const query = "INSERT INTO map (user_id, map) VALUES (?, ?)";

  if (!mapList.includes(map)) {
    throw new Error("MAP IS NOT VALID");
  }

  const result = await db.executeQueryV(query, user_id, map);

  if (result.affectedRows == 0) {
    return {
      status: 500,
      message: "Map Insert Failed",
    };
  }

  return {
    status: 201,
    message: "Map Insert Success",
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
        status: 404,
        message: "User Not Found",
      };
    else
      return {
        status: 200,
        message: "User Found",
        data: row,
      };
  } catch (e) {
    console.log(e); // 일단 임시
    return {
      status: 500,
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
async function updateUser(id, value, type) {
  const query = `UPDATE user SET ${type} = ? WHERE id = ?`;
  try {
    await db.executeQueryV(query, value, id);
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
 * @param {*} value 변경할 값
 * @param {*} type 변경할 컬럼명 (type: "quantity")
 * @returns 성공 시 status: 204, 실패 시 status: 500
 */
async function inventoryUpdate(id, value, type) {
  let query = `UPDATE inventory SET ${type} = ? WHERE user_id = ? AND item_name = ?`;
  try {
    const result = await db.executeQueryV(query, value, id, type);
    if (result.affectedRows > 0) {
      return {
        status: 204,
      };
    } else if (result.length === 0) {
      let query = `SELECT user_id FROM inventory WHERE user_id = ? AND item_name = ?`;
      let row = await db.executeQueryV(query, id, type);
      if (row.length === 0) {
        let query = `INSERT INTO inventory (user_id, item_name, quantity) VALUES (?, ?, ?)`;
        await db.executeQueryV(query, id, type, value);
        return {
          status: 204,
        };
      }
    } else
      return {
        status: 500,
        message: "Update Inventory Failed",
      };
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
async function getInventory(id) {
  const query = "SELECT * FROM inventory WHERE user_id = ?";
  try {
    return {
      status: 204,
      data: await db.executeQueryV(query, id),
    };
  } catch (e) {
    console.log(e); // 일단 임시
    return {
      status: 500,
      message: "Server OR DB ERROR",
    };
  }
}
