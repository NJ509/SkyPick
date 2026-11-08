
const predictionList = document.getElementById("prediction-list");
const predictionFilter = document.getElementById("prediction-filter");

let predictionData = [];

// 예측 종류 이름
function getPredictionType(type) {
    const types = {
        weather: "날씨",
        temperature: "기온",
        humidity: "습도",
        rain: "강수량"
    };

    return types[type] || type;
}

// 날짜 표시
function formatPredictionTime(time) {
    const date = new Date(time);

    return date.toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

// 예측 상태
function getPredictionStatus(forecast) {
    if (!forecast.is_settled) {
        return {
            text: "진행중",
            className: "status-progress"
        };
    }

    if (forecast.is_correct) {
        return {
            text: "성공",
            className: "status-success"
        };
    }

    return {
        text: "실패",
        className: "status-fail"
    };
}

// 예상 보상 계산
function calculateReward(forecast) {
    const betting = Number(forecast.used_point);

    if (forecast.beting_type === "역배") {
        return 100 + Math.floor(betting * 0.5);
    }

    return 100 + Math.floor(betting * 0.15);
}

// 예측 목록 출력
function renderPredictionList() {
    const filter = predictionFilter.value;

    predictionList.innerHTML = "";

    const filteredData = predictionData.filter((forecast) => {
        const status = getPredictionStatus(forecast);

        if (filter === "전체") return true;
        if (filter === "진행중") return status.text === "진행중";
        if (filter === "성공") return status.text === "성공";
        if (filter === "실패") return status.text === "실패";

        return true;
    });

    if (filteredData.length === 0) {
        predictionList.innerHTML = `
            <p class="text-center text-muted">
                해당하는 예측 내역이 없습니다.
            </p>
        `;
        return;
    }

    filteredData.forEach((forecast) => {
        const status = getPredictionStatus(forecast);
        const card = document.createElement("div");

        card.className = "prediction-list-card";

        const top = document.createElement("div");
        top.className = "prediction-card-top";

        const regionInfo = document.createElement("div");

        const region = document.createElement("span");
        region.className = "prediction-region";
        region.textContent = forecast.forecast_map;

        const time = document.createElement("span");
        time.className = "prediction-time";
        time.textContent = formatPredictionTime(forecast.forecast_time);

        regionInfo.append(region, time);

        const statusElement = document.createElement("span");
        statusElement.className = `prediction-status ${status.className}`;
        statusElement.textContent = status.text;

        top.append(regionInfo, statusElement);

        const info = document.createElement("div");
        info.className = "prediction-card-info";

        const items = [
            ["예측 대상", getPredictionType(forecast.forecast_type)],
            ["예측 값", forecast.predicted_value],
            ["배팅", `${forecast.used_point} P`],
            ["예상 보상", `+${calculateReward(forecast)} P`]
        ];

        items.forEach(([label, value]) => {
            const item = document.createElement("div");

            const span = document.createElement("span");
            span.textContent = label;

            const strong = document.createElement("strong");
            strong.textContent = value;

            item.append(span, strong);
            info.appendChild(item);
        });

        card.append(top, info);
        predictionList.appendChild(card);
    });
}

// DB에서 예측 목록 조회
async function loadPredictionList() {
    try {
        const response = await fetch(
            "http://localhost:3000/api/predictionController",
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "예측 목록 조회 실패");
        }

        predictionData = data;
        renderPredictionList();

    } catch (error) {
        console.error("예측 목록 조회 실패:", error);
        predictionList.textContent = error.message;
    }
}

// 필터 변경
predictionFilter.addEventListener("change", renderPredictionList);

// 예측 등록 후 목록 갱신
window.addEventListener("prediction:updated", loadPredictionList);

loadPredictionList();
