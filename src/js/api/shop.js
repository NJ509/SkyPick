import auth from "../../auth.js";
import sessions from "../utils/session.js";
import {AUTH_RESULT} from "../enums/authResult.js";

async function showShopList(res) {
    try {
        const result = await auth.getShopList();
        if(result === {} || !result) {
            return res.writeHead(400).end(JSON.stringify({message: "요청을 불러오지 못헀습니다."}));
        }

        console.log("result:", result);
        console.log("isArray:", Array.isArray(result));
        return res.writeHead(200).end(JSON.stringify({
            message: "상품 목록 로드 완료",
            data: result
        }))
    } catch (e) {
        console.log("[ERROR] Failed Load Shop List : " +e);
        return res.writeHead(500).end(JSON.stringify({message: "요청을 불러오지 못헀습니다."}));
    }
}

async function buyItem(req, res) {
    const session = sessions.getSession(req);

    if (!session) {
        res.writeHead(401, {
            "Content-Type": "application/json; charset=utf-8",
        });

        return res.end(JSON.stringify({
            message: "로그인이 필요합니다.",
        }));
    }

    const userId = session.userId;
    const { itemId } = req.body;

    if (!userId || !itemId) {
        return res.writeHead(400).end(JSON.stringify({message: "잘못된 요청"}));
    }

    const result = await auth.buyItem(userId, itemId);

    if(result.code === AUTH_RESULT.SUCCESS) {
        return res.writeHead(200).end(JSON.stringify({
            message: "구매 성공",
            data: result
        }));
    } else return res.writeHead(400).end(JSON.stringify({
        message: "구매 실패",
        code: result.code,
        data: result.data,
    }))

}

// 지역 해금
async function unlockMap(req, res) {
    const session = sessions.getSession(req);

    if (!session) {
        return res.writeHead(401, {
            "Content-Type": "application/json; charset=utf-8",
        }).end(JSON.stringify({
            message: "로그인이 필요합니다."
        }));
    }

    const userId = session.userId;
    const { map } = req.body;

    if (!userId || !map) {
        return res.writeHead(400, {
            "Content-Type": "application/json; charset=utf-8",
        }).end(JSON.stringify({
            message: "잘못된 요청입니다."
        }));
    }

    try {
        const result = await auth.unlockMap(userId, map);

        if (result.code === AUTH_RESULT.SUCCESS) {
            return res.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8",
            }).end(JSON.stringify({
                message: "지역 해금 성공",
                data: result.data
            }));
        }

        return res.writeHead(400, {
            "Content-Type": "application/json; charset=utf-8",
        }).end(JSON.stringify({
            message: result.message || "지역 해금 실패",
            code: result.code
        }));

    } catch (e) {
        console.log("[ERROR] Failed Unlock Map API:", e);

        return res.writeHead(500, {
            "Content-Type": "application/json; charset=utf-8",
        }).end(JSON.stringify({
            message: "서버 오류가 발생했습니다."
        }));
    }
}


// 사용자의 해금 지역 조회
async function getUserMaps(req, res) {
    const session = sessions.getSession(req);

    if (!session) {
        return res.writeHead(401, {
            "Content-Type": "application/json; charset=utf-8",
        }).end(JSON.stringify({
            message: "로그인이 필요합니다."
        }));
    }

    try {
        const result = await auth.getUserMaps(session.userId);

        return res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
        }).end(JSON.stringify({
            message: "지역 목록 조회 성공",
            data: result.map(value => value.map)
        }));

    } catch (e) {
        console.log("[ERROR] Failed Load User Maps:", e);

        return res.writeHead(500, {
            "Content-Type": "application/json; charset=utf-8",
        }).end(JSON.stringify({
            message: "지역 목록 조회 실패"
        }));
    }
}

export default { showShopList, buyItem, unlockMap, getUserMaps }
