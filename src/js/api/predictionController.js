import auth from "../../auth.js";
import session from "../utils/session.js";

// 예측 목록 조회
async function showPredictionList(request, response, queryParams) {
    try {
        // 로그인 세션 확인
        const userSession = session.getSession(request);

        if (!userSession) {
            response.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
            });
            return response.end(JSON.stringify({
                message: "로그인이 필요합니다."
            }));
        }

        // 세션에 저장된 사용자 ID 사용
        const result = await auth.getForecastList(userSession.userId);

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
        // 로그인 세션 확인
        const userSession = session.getSession(request);

        if (!userSession) {
            response.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
            });
            return response.end(JSON.stringify({
                message: "로그인이 필요합니다."
            }));
        }

        const {
            forecast_map,
            forecast_time,
            forecast_type,
            predicted_value,
            used_point
        } = request.body;

        if (
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

        // 요청의 user_id가 아닌 세션의 userId 사용
        const result = await auth.createForecast(
            userSession.userId,
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
    showPredictionList: showPredictionList,
    createForecast: createPrediction
};
