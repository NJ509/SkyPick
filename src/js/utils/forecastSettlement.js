import { getWeather } from "../api/weather.js";
import auth from "../../auth.js";

// 지역별 기상청 격자 좌표
const weatherGrids = {
    "서울": { nx: 61, ny: 127 },
    "인천": { nx: 55, ny: 126 },
    "경기": { nx: 61, ny: 121 },
    "강원": { nx: 73, ny: 135 },
    "충북": { nx: 68, ny: 108 },
    "충남": { nx: 64, ny: 111 },
    "대전": { nx: 69, ny: 101 },
    "전북": { nx: 65, ny: 90 },
    "전남": { nx: 51, ny: 67 },
    "광주": { nx: 58, ny: 75 },
    "경북": { nx: 103, ny: 96 },
    "경남": { nx: 82, ny: 76 },
    "대구": { nx: 90, ny: 92 },
    "울산": { nx: 100, ny: 85 },
    "부산": { nx: 98, ny: 75 }
};

// 지역별 격자 좌표 조회
function getWeatherGrid(region) {
    return weatherGrids[region] || null;
}

// 기상청 예보를 정산용 날씨 종류로 변환
function getWeatherOptions(sky, pty) {
    switch (String(pty)) {
        case "1":
        case "4":
        case "5":
            return ["비"];

        case "2":
        case "6":
            return ["비", "눈"];

        case "3":
        case "7":
            return ["눈"];
    }

    switch (String(sky)) {
        case "1":
            return ["맑음"];

        case "3":
        case "4":
            return ["흐림"];

        default:
            return [];
    }
}

// 예측 시간에 해당하는 기상청 예보 조회
async function getForecastWeather(region, forecastTime) {
    const grid = getWeatherGrid(region);

    if (!grid) {
        throw new Error(`등록되지 않은 지역입니다: ${region}`);
    }

    const targetDate = new Date(forecastTime);

    if (Number.isNaN(targetDate.getTime())) {
        throw new Error("올바르지 않은 예측 시간입니다.");
    }

    // 예측 시간을 YYYYMMDD, HHmm 형식으로 변환
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const hour = String(targetDate.getHours()).padStart(2, "0");

    const targetDateString = `${year}${month}${day}`;
    const targetTimeString = `${hour}00`;

    // 기상청 단기예보 발표 시간
    const baseHours = [2, 5, 8, 11, 14, 17, 20, 23];

    // 예측 대상 시간보다 이전에 발표된 가장 최근 예보 선택
    let baseHour = [...baseHours]
        .reverse()
        .find(hour => hour < targetDate.getHours());

    // 발표 날짜 설정
    const baseDateObject = new Date(targetDate);

    if (baseHour === undefined) {
        baseDateObject.setDate(baseDateObject.getDate() - 1);
        baseHour = 23;
    }

    const baseDate =
        `${baseDateObject.getFullYear()}${String(baseDateObject.getMonth() + 1).padStart(2, "0")}${String(baseDateObject.getDate()).padStart(2, "0")}`;

    const baseTime = String(baseHour).padStart(2, "0") + "00";

    const data = await getWeather(
        baseDate,
        baseTime,
        grid.nx,
        grid.ny
    );

    const items = data?.response?.body?.items?.item;

    if (!items || data?.response?.header?.resultCode !== "00") {
        throw new Error("기상청 예보를 가져오지 못했습니다.");
    }

    // 목표 날짜와 시간에 해당하는 예보만 추출
    const targetItems = items.filter(item =>
        item.fcstDate === targetDateString &&
        item.fcstTime === targetTimeString
    );

    // 필요한 예보 항목 확인
    const requiredCategories = ["TMP", "REH", "PCP", "SKY", "PTY"];

    for (const category of requiredCategories) {
        const exists = targetItems.some(
            item => item.category === category
        );

        if (!exists) {
            throw new Error(
                `예보 항목이 누락되었습니다: ${category}`
            );
        }
    }

    if (targetItems.length === 0) {
        throw new Error("해당 시간의 예보가 없습니다.");
    }

    const sky = targetItems.find(item => item.category === "SKY")?.fcstValue;
    const pty = targetItems.find(item => item.category === "PTY")?.fcstValue;

    if (sky === undefined || pty === undefined) {
        throw new Error("날씨 예보 데이터가 부족합니다.");
    }

    const getValue = (category) =>
        targetItems.find(item => item.category === category)?.fcstValue;

    const temperature = getValue("TMP");
    const humidity = getValue("REH");
    const precipitation = getValue("PCP");

    if (
        temperature === undefined ||
        humidity === undefined ||
        precipitation === undefined
    ) {
        throw new Error("정산에 필요한 예보 데이터가 부족합니다.");
    }

    return {
        weather: getWeatherOptions(sky, pty),
        temperature: Number(temperature),
        humidity: Number(humidity),
        precipitation
    };
}

// 기상청 강수량을 범위로 변환
function parsePrecipitationRange(value) {
    const text = String(value).trim();

    if (text === "강수없음") {
        return { min: 0, max: 0 };
    }

    if (text === "1mm 미만") {
        return { min: 0, max: 1 };
    }

    // mm와 공백 제거
    const numberText = text
        .replaceAll("mm", "")
        .replaceAll(" ", "");

    // 이상인 경우
    if (numberText.includes("이상")) {
        const number = Number(numberText.replace("이상", ""));

        if (Number.isNaN(number)) {
            throw new Error("강수량을 변환할 수 없습니다.");
        }

        return {
            min: number,
            max: Infinity
        };
    }

    // 미만인 경우
    if (numberText.includes("미만")) {
        const number = Number(numberText.replace("미만", ""));

        if (Number.isNaN(number)) {
            throw new Error("강수량을 변환할 수 없습니다.");
        }

        return {
            min: 0,
            max: number
        };
    }

    // 범위로 제공되는 경우
    if (numberText.includes("~")) {
        const numbers = numberText.split("~");
        const min = Number(numbers[0]);
        const max = Number(numbers[1]);

        if (
            numbers.length !== 2 ||
            Number.isNaN(min) ||
            Number.isNaN(max)
        ) {
            throw new Error("강수량 범위가 올바르지 않습니다.");
        }

        return { min, max };
    }

    // 단일 숫자인 경우
    const number = Number(numberText);

    if (Number.isNaN(number)) {
        throw new Error("강수량을 변환할 수 없습니다.");
    }

    return {
        min: number,
        max: number
    };
}


// 예측 정답 판정
function checkPrediction(forecast, weatherData) {
    const predicted = forecast.predicted_value;

    switch (forecast.forecast_type) {
        case "weather":
            return weatherData.weather.includes(predicted);

        case "temperature":
            return Math.abs(
                Number(predicted) - weatherData.temperature
            ) <= 1;

        case "humidity":
            return Math.abs(
                Number(predicted) - weatherData.humidity
            ) <= 3;

        case "rain": {
            const predictedRain = Number(predicted);
            const range = parsePrecipitationRange(
                weatherData.precipitation
            );

            return (
                predictedRain + 15 >= range.min &&
                predictedRain - 15 <= range.max
            );
        }

        default:
            throw new Error("알 수 없는 예측 종류입니다.");
    }
}

// 정답 보상 계산
function calculateReward(forecast) {
    const betting = Number(forecast.used_point);

    if (forecast.beting_type === "역배") {
        return betting + 100 + Math.floor(betting * 0.5);
    }

    return betting + 100 + Math.floor(betting * 0.15);
}

// 정산 대상 예측 처리
async function settleDueForecasts() {
    const forecasts = await auth.getUnsettledForecasts();

    for (const forecast of forecasts) {
        try {
            // 예측 시간에 해당하는 기상청 예보 조회
            const weatherData = await getForecastWeather(
                forecast.forecast_map,
                forecast.forecast_time
            );

            // 정답 여부 판정
            const isCorrect = checkPrediction(
                forecast,
                weatherData
            );

            // 정답인 경우 보상 계산
            const reward = isCorrect
                ? calculateReward(forecast)
                : 0;

            // DB 정산 처리
            const settled = await auth.settleForecast(
                forecast.id,
                isCorrect,
                reward
            );

            if (settled) {
                console.log(
                    `[정산 완료] 예측 ID: ${forecast.id}, 결과: ${isCorrect ? "정답" : "오답"}, 보상: ${reward}P`
                );
            }

        } catch (error) {
            console.error(
                `[정산 실패] 예측 ID: ${forecast.id}`,
                error.message
            );
        }
    }
}


export {
    getWeatherGrid,
    getWeatherOptions,
    getForecastWeather,
    checkPrediction,
    calculateReward,
    settleDueForecasts
};