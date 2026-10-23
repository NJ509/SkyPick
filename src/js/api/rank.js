import auth from "../../auth.js";

async function showRanking(req, res, type) {
    const types = "total | weekend"
    if(!type || !types.includes(type))
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
export default { showRanking };