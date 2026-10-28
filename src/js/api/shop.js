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

export default { showShopList, buyItem }
