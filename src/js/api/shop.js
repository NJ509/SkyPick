import auth from "../../auth.js";

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

export default { showShopList }