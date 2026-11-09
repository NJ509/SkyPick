import auth from "../../auth.js";
import session from "../utils/session.js";
import {AUTH_RESULT} from "../enums/authResult.js";

async function showDamagochi(req, res) {
    const userSession = session.getSession(req);
    if (!userSession?.userId) {
        return res.writeHead(401).end(JSON.stringify({
            message: "로그인이 필요합니다."
        }));
    }

    try {
        const damagochi = await auth.findDamagochiByUserId(userSession.userId);
        if (!damagochi) {
            return res.writeHead(404).end(JSON.stringify({
                message: "다마고치를 찾을 수 없습니다."
            }));
        }

        return res.writeHead(200).end(JSON.stringify({
            code: AUTH_RESULT.SUCCESS,
            message: "다마고치 조회 완료",
            data: damagochi
        }));
    } catch (error) {
        console.error("[ERROR] showDamagochi Failed:", error);
        return res.writeHead(500).end(JSON.stringify({
            message: "다마고치를 불러오지 못했습니다."
        }));
    }
}

async function newDamagochi(req, res) {
    const userSession = session.getSession(req);
    if (!userSession?.userId) {
        return res.writeHead(401).end(JSON.stringify({
            message: "로그인이 필요합니다."
        }));
    }

    try {
        const result = await auth.newDamagochi(userSession.userId);
        switch (result.code) {
            case AUTH_RESULT.SUCCESS:
                return res.writeHead(201).end(JSON.stringify(result));
            case AUTH_RESULT.REQUIRED_LOGIN:
                return res.writeHead(401).end(JSON.stringify(result));
            default:
                return res.writeHead(500).end(JSON.stringify(result));
        }
    } catch (error) {
        console.error("[ERROR] newDamagochi Failed:", error);

        return res.writeHead(500).end(JSON.stringify({
            message: "다마고치를 생성하지 못했습니다."
        }));
    }
}

async function eatExp(req, res) {
    const userSession = session.getSession(req);
    if (!userSession?.userId) {
        return res.writeHead(401).end(JSON.stringify({
            message: "로그인이 필요합니다."
        }));
    }

    try {
        const result = await auth.eatExp(userSession.userId);
        switch (result.code) {
            case AUTH_RESULT.SUCCESS:
                return res.writeHead(200).end(JSON.stringify(result));
            case AUTH_RESULT.NOT_VALID:
                return res.writeHead(400).end(JSON.stringify(result));
            case AUTH_RESULT.REQUIRED_LOGIN:
                return res.writeHead(401).end(JSON.stringify(result));
            case AUTH_RESULT.NOT_FOUND:
                return res.writeHead(404).end(JSON.stringify(result));
            default:
                return res.writeHead(500).end(JSON.stringify(result));
        }
    } catch (error) {
        console.error("[ERROR] eatExp Failed:", error);

        return res.writeHead(500).end(JSON.stringify({
            message: "다마고치 경험치 증가에 실패했습니다."
        }));
    }
}

async function changeName(req, res) {
    const userSession = session.getSession(req);
    if (!userSession?.userId) {
        return res.writeHead(401).end(JSON.stringify({
            message: "로그인이 필요합니다."
        }));
    }

    try {
        const result = await auth.changeName(userSession.userId, req.body?.name);

        switch (result.code) {
            case AUTH_RESULT.SUCCESS:
                return res.writeHead(200).end(JSON.stringify(result));
            case AUTH_RESULT.NOT_VALID:
                return res.writeHead(400).end(JSON.stringify(result));
            case AUTH_RESULT.REQUIRED_LOGIN:
                return res.writeHead(401).end(JSON.stringify(result));
            case AUTH_RESULT.NOT_FOUND:
                return res.writeHead(404).end(JSON.stringify(result));
            default:
                return res.writeHead(500).end(JSON.stringify(result));
        }
    } catch (error) {
        console.error("[ERROR] changeName Failed:", error);

        return res.writeHead(500).end(JSON.stringify({
            message: "다마고치 이름 변경에 실패했습니다."
        }));
    }
}

export default { showDamagochi, newDamagochi, eatExp, changeName };
