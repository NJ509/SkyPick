/* @ts-check */

import auth from "../../auth.js";
import session from "../utils/session.js";
import {AUTH_RESULT} from "../enums/authResult.js";

/**
 * 유저 로그인 api
 * @param {*} req 유저가 보낸 로그인 요청
 * @param {*} res 로그인 결과
 * @returns 상태코드 + 메시지
 */
async function login(req, res) {
  const { id, password } = req.body;

  if (!id || !password) {
    res.writeHead(400);
    return res.end(JSON.stringify({ message: "ID 또는 비밀번호가 없습니다." }));
  }

  const response = await auth.doLogin(id, password);
  const {code} = response;

  switch (code) {
      case "FAILED": {
        res.writeHead(400);
        res.end(JSON.stringify({message: "잘못된 요청입니다."}));
        break;
      }
      case "INVALID_CREDENTIALS": {
          res.writeHead(401);
          res.end(JSON.stringify({message: "ID 또는 비밀번호가 잘못되었습니다."}));
          break;
      }
      case "SUCCESS": {
          const sessionId = session.createSession(response.userId);

          res.writeHead(200, {
            "Set-Cookie": `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
          });
          res.end(JSON.stringify({
              message: "로그인 성공",
              userId: response.userId,
          }));
          break;
      }

      default: return res;
  }
}

async function signup(req, res) {
  const { id, password, name, map } = req.body;

  if (!id || !password || !name || !map) {
    return res
      .writeHead(400)
      .end(
        JSON.stringify({ message: "ID, 비밀번호, 이름 또는 지역이 없습니다." }),
      );
  }

  const response = await auth.signup(id, password, name, map);
  const { code } = response;
  switch (code) {
    case "FAILED":
      return res.writeHead(400).end(JSON.stringify({ message: "회원가입 실패" }));
    case "ALREADY_EXISTS":
      return res.writeHead(409).end(JSON.stringify({ message: "이미 존재하는 ID입니다." }));
    case "NOT_VALID":
      return res.writeHead(400).end(JSON.stringify({ message: "선택한 지역이 없거나 잘못되었습니다." }));
    case "SUCCESS":
      return res.writeHead(201).end(JSON.stringify({ message: "회원가입이 완료되었습니다." }));
    default:
      return res.writeHead(500).end(JSON.stringify({ message: "회원가입 처리 실패" }));
  }
}

async function showPoint(req, res) {
  const userSession = session.getSession(req);

  if (!userSession?.userId) {
    return res.writeHead(401).end(JSON.stringify({
      message: "로그인이 필요한 작업입니다."
    }));
  }

  const result = await auth.showPoint(userSession.userId);
  switch (result.code) {
    case AUTH_RESULT.SUCCESS:
      return res.writeHead(200).end(JSON.stringify(result));
    case AUTH_RESULT.NOT_FOUND:
      return res.writeHead(404).end(JSON.stringify({ message: "유저 정보를 찾을 수 없습니다." }));
    default:
      return res.writeHead(500).end(JSON.stringify({ message: "포인트를 불러오지 못했습니다." }));
  }
}

async function equipItem(req, res, type, itemId) {
    const types = ["title", "profile"];

    if (!session.getSession(req)?.userId) {
        return res.writeHead(401).end(JSON.stringify({
            message: "로그인이 필요한 작업입니다."
        }));
    }

    if (!types.includes(type) || !itemId) {
        return res.writeHead(400).end(JSON.stringify({
            message: "아이템 종류 또는 아이템 ID가 잘못되었습니다."
        }));
    }

    const userId = session.getSession(req).userId;
    const result = await auth.equipItem(userId, type, itemId);

    switch (result.code) {
        case "NOT_VALID": {
            return res.writeHead(400).end(JSON.stringify({
                message: result.message
            }));
        }
        case "FAILED": {
            return res.writeHead(500).end(JSON.stringify({
                message: result.message
            }));
        }
        case "SUCCESS": {
            return res.writeHead(200).end(JSON.stringify({
                message: result.message
            }));
        }
        default: {
            return res.writeHead(500).end(JSON.stringify({
                message: "아이템을 장착하지 못했습니다."
            }));
        }
    }
}

async function showProfile(req, res) {
    const userSession = await session.getSession(req);

    if (!userSession?.userId) {
        return res.writeHead(401).end(JSON.stringify({
            message: "로그인이 필요한 작업입니다."
        }));
    }

    const result = await auth.showProfile(userSession.userId);
    switch (result.code) {
        case AUTH_RESULT.SUCCESS:
            return res.writeHead(200).end(JSON.stringify(result));
        case AUTH_RESULT.NOT_FOUND:
            return res.writeHead(404).end(JSON.stringify({ message: "유저 정보를 찾을 수 없습니다." }));
        default:
            return res.writeHead(500).end(JSON.stringify({ message: "프로필을 불러오지 못했습니다." }));
    }
}

export default { login, signup, showPoint, equipItem, showProfile };
