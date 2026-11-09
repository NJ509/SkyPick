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

async function createPrediction(request, response) {
    try {
        // 1. 로그인 세션 확인
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

        // 2. 필수 정보 확인
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

        // 3. 예측 시간 검증
        const forecastTimestamp = new Date(forecast_time).getTime();
        const currentTime = Date.now();

        const timeDifference = forecastTimestamp - currentTime;

        const MIN_TIME = 2 * 60 * 60 * 1000;
        const MAX_TIME = 48 * 60 * 60 * 1000;

        if (
            !Number.isFinite(forecastTimestamp) ||
            timeDifference < MIN_TIME ||
            timeDifference > MAX_TIME
        ) {
            response.writeHead(400, {
                "Content-Type": "application/json; charset=utf-8"
            });
            return response.end(JSON.stringify({
                message: "예측 시간은 현재 시각 기준 2~48시간 이내여야 합니다."
            }));
        }


        // 지역 해금 여부 확인
        const isUnlocked = await auth.isMapUnlocked(userSession.userId, forecast_map);

        if (!isUnlocked) {
            response.writeHead(403, {
                "Content-Type": "application/json"
            });

            return response.end(JSON.stringify({
                message: "해금하지 않은 지역입니다."
            }));
        }

        // 4. 세션의 사용자 ID로 예측 등록
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
    showPredictionList,
    createPrediction
};