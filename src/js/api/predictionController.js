import auth from "../../auth.js";
import session from "../utils/session.js";

// 예측 목록 조회
async function showPredictionList(request, response, queryParams) {
    try {
        const userSession = session.getSession(request);

        if (!userSession) {
            response.writeHead(401);
            return response.end(JSON.stringify({
                message: "로그인이 필요합니다."
            }));
        }

        const userId = userSession.userId;

        const result = await auth.getForecastList(userId);

        response.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8"
        });
        response.end(JSON.stringify(result));

    } catch (error) {
        console.error(error);

        response.writeHead(500, {
            "Content-Type": "application/json; charset=utf-8"
        });
        response.end(JSON.stringify({
            message: "예측 목록 조회 실패"
        }));
    }
}

// 예측 등록
async function createPrediction(request, response) {
    try {
        const {
            user_id,
            forecast_map,
            forecast_time,
            forecast_type,
            predicted_value,
            used_point
        } = request.body;

        if (
            !user_id ||
            !forecast_map ||
            !forecast_time ||
            !forecast_type ||
            predicted_value === undefined ||
            used_point === undefined
        ) {
            response.writeHead(400, {
                "Content-Type": "application/json; charset=utf-8"
            });
            return response.end(JSON.stringify({
                message: "필수 정보가 누락되었습니다."
            }));
        }

        const result = await auth.createForecast(
            user_id,
            forecast_map,
            forecast_time,
            forecast_type,
            predicted_value,
            used_point
        );

        response.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8"
        });
        response.end(JSON.stringify({
            message: "예측 등록 성공",
            result
        }));

    } catch (error) {
        console.error(error);

        response.writeHead(400, {
            "Content-Type": "application/json; charset=utf-8"
        });
        response.end(JSON.stringify({
            message: error.message || "예측 등록 실패"
        }));
    }
}

export default {
    showPredictionList,
    createPrediction
};
