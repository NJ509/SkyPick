import auth from "../../auth.js";
import sessions from "../utils/session.js";
import {AUTH_RESULT} from "../enums/authResult.js";

async function showCollection(req, res, filterType) {
    const filterTypes = ["all", "title", "profile", "theme"];

    if(!filterTypes.includes(filterType)) {
        return res.writeHead(400).end(JSON.stringify({
            message: "잘못된 필터링 요청. \nall, title, profile, theme 중 하나여야 함."
        }));
    }

    const session = sessions.getSession(req);
    if (!session) {
        res.writeHead(401, {
            "Content-Type": "application/json; charset=utf-8",
        });

        return res.end(JSON.stringify({
            message: "로그인이 필요합니다.",
        }));
    }

    if(!session.userId) {
        return res.writeHead(404).end(JSON.stringify({
            message: "쿠키의 유저 정보를 찾을 수 없습니다."
        }))
    }

    const result = await auth.showCollection(session.userId, filterType);
    if(result.code === AUTH_RESULT.SUCCESS) {
        return res.writeHead(200).end(JSON.stringify(result));
    }

    return res.writeHead(500).end(JSON.stringify({
        message: "도감을 불러오지 못했습니다."
    }));
}

export default { showCollection };
