/* @ts-check */

import auth from "../../auth.js";

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
          res.writeHead(200);
          res.end(JSON.stringify({
              message: "로그인 성공",
              userId: response.userId,
          }));
          break;
      }

      return res;
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

export default { login, signup };
