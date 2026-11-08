document.querySelectorAll(".prediction-type").forEach(function (button) {
    button.addEventListener("click", function () {
        document.querySelectorAll(".prediction-type").forEach(function (item) {
            item.classList.remove("active");
        });

        button.classList.add("active");

        const target = button.dataset.target;

        if (target === "weather") {
            document.getElementById("prediction-value-container").innerHTML = `
                <select id="prediction-value" class="form-select">
                    <option value="맑음">맑음</option>
                    <option value="비">비</option>
                    <option value="흐림">흐림</option>
                    <option value="눈">눈</option>
                </select>`;

        } else if (target === "temperature") {
            document.getElementById("prediction-value-container").innerHTML =  `
                <input type="number" id="prediction-value"
                       class="form-control" step="0.1"
                       placeholder="예: 22">`;

        } else if (target === "humidity") {
            document.getElementById("prediction-value-container").innerHTML =  `
                <input type="number" id="prediction-value"
                       class="form-control" min="0" max="100"
                       placeholder="예: 55">`;

        } else if (target === "rain") {
            document.getElementById("prediction-value-container").innerHTML =  `
                <input type="number" id="prediction-value"
                       class="form-control" min="0" step="0.1"
                       placeholder="예: 0">`;
        }
    });
});



function updateReward() {
    const betting = Number(document.getElementById("betting").value);

    // 기본 보상 100 P + 배팅 포인트의 15%
    const reward = 100 + Math.floor(betting * 0.15);

    document.getElementById("bettingValue").textContent = betting;
    document.getElementById("successReward").textContent = `+${reward} P`;
}

// 배팅 포인트 변경 시 보상 갱신
document.getElementById("betting").addEventListener("input", function () {
    updateReward();
});


updateReward();


// 예측 등록 버튼
document.querySelector(".submit-btn").addEventListener("click", async function () {
    const forecastMap = document.getElementById("region").value;
    const forecastTime = document.getElementById("prediction-time").value;
    const forecastType = document.querySelector(".prediction-type.active").dataset.target;
    const predictedValue = document.getElementById("prediction-value").value;
    const usedPoint = Number(document.getElementById("betting").value);

    if (!forecastTime || !predictedValue) {
        alert("예측 시간과 예측값을 입력해주세요.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/predictionController", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                forecast_map: forecastMap,
                forecast_time: forecastTime,
                forecast_type: forecastType,
                predicted_value: predictedValue,
                used_point: usedPoint
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "예측 등록에 실패했습니다.");
            return;
        }

        alert("예측이 등록되었습니다.");

    } catch (error) {
        console.error("예측 등록 오류:", error);
        alert("서버와 통신할 수 없습니다.");
    }
});