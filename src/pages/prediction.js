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
                    <option value="우박">우박</option>
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
