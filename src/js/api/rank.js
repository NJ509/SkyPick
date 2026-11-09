import auth from "../../auth.js";
import { db } from "../../app.js";

async function showRanking(req, res, type) {
    const types = ["total", "weekend"];

    if (!types.includes(type))
        return res.writeHead(400).end(JSON.stringify({message: "잘못된 요청"}));

    const result = await auth.showRanking(type);
    const { code } = result;

    switch (code) {
        case "NOT_VALID": {
            res.writeHead(422);
            res.end(JSON.stringify(
                {
                    message: "잘못된 요청입니다.",
                }
            ));
            break;
        }
        case "FAILED": {
            res.writeHead(400);
            res.end(JSON.stringify({
                message: "랭킹을 불러오지 못했습니다."
            }));
            break;
        }
        case "SUCCESS": {
            res.writeHead(200);
            res.end(JSON.stringify({
                message: "랭킹 조회 완료",
                data: result.data,
            }));
        }
    }
    return res;
}

async function weekRankTimeOut () {
    const now = new Date();

    // 매 주 일요일 0시 0분
    const TARGET_DAY = 0;
    const TARGET_HOUR = 0;
    const TARGET_MINUTE = 0;

    let target = new Date(now)
    target.setHours(TARGET_HOUR, TARGET_MINUTE, 0, 0);

    let untilTarget = (TARGET_DAY - now.getDay() + 7) % 7;
    if(untilTarget === 0 && now.getTime() >= target.getTime()) {
        untilTarget = 7;
    }

    target.setDate(now.getDate() + untilTarget);

    const delay = target.getTime() - now.getTime();

    setTimeout(async () => {
        try {
            const query = "TRUNCATE TABLE weekly_stat";

            await db.executeQueryV(query);
        } catch (e) {
            console.log("[ERROR] weekendRankTimeOut Failed: "+e);
        }
        finally {
            await weekRankTimeOut()
        }
    }, delay)

    console.log("[LOG INFO] reset week ranking");
}

export default { showRanking };
export { weekRankTimeOut };