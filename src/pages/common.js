async function loadPoint() {
    const pointElement = document.getElementById("user-point");
    try {
        const response = await fetch("/point", {credentials: "include"});
        const result = await response.json();
        if (!response.ok) {
            if (response.status === 401) pointElement.textContent = "로그인 필요";
            else pointElement.textContent = "조회 실패";
            return;
        }
        pointElement.textContent = result.data.point + " P";
    } catch (error) {
        pointElement.textContent = "조회 실패";
        console.error(error);
    }
}

async function loadRanking(type) {
    const weekendTab = document.getElementById("weekend-tab");
    const totalTab = document.getElementById("total-tab");

    // 버튼 색 바꾸기
    if (type === "weekend") {
        weekendTab.className = "ranking-tab active";
        totalTab.className = "ranking-tab";
    } else {
        weekendTab.className = "ranking-tab";
        totalTab.className = "ranking-tab active";
    }

    try {
        const response = await fetch(
            "http://localhost:3000/rank?type=" + type,
            {credentials: "include"}
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "랭킹 조회 실패");
        }

        // console.log(type, result);
        for (let rank = 1; rank <= 3; rank++) {
            const nameElement = document.getElementById("rank" + rank + "-name");
            const pointElement = document.getElementById("rank" + rank + "-point");
            const titleElement = document.getElementById("rank" + rank + "-title");
            const imageElement = document.getElementById("rank" + rank + "-image");

            imageElement.style.backgroundImage = "none";
            imageElement.style.backgroundSize = "cover";
            imageElement.style.backgroundPosition = "center";

            const user = result.data[rank - 1];

            if (user) {
                nameElement.textContent = user.name;
                pointElement.textContent = user.point + " P";
                titleElement.textContent = user.equipped_title || "";

                if (user.equipped_profile_image) {
                    const imageName = encodeURIComponent(user.equipped_profile_image);

                    imageElement.style.backgroundImage =
                        'url("/images/' + imageName + '")';
                }
            } else {
                nameElement.textContent = "랭킹 없음";
                pointElement.textContent = "";
                titleElement.textContent = "";
            }
        }

        // 전체랭킹
        const listElement = document.getElementById("ranking-list");
        const rangeElement = document.getElementById("ranking-range");

        listElement.innerHTML = "";
        rangeElement.textContent = "";

        let lastRank = result.data.length;

        if (lastRank < 4) {
            listElement.textContent = "4위 이하의 랭킹이 없습니다.";
        } else {
            rangeElement.textContent = "4위 ~ " + lastRank + "위";

            for (let rank = 4; rank <= lastRank; rank++) {
                listElement.innerHTML += `
            <div class="ranking-item">
                <strong class="ranking-number">${rank}</strong>

                <div
                    id="rank${rank}-image"
                    class="ranking-profile"
                    style="background-size: cover; background-position: center;">
                </div>

                <div class="ranking-user">
                    <strong id="rank${rank}-name"></strong>
                    <span id="rank${rank}-title"></span>
                    <span id="rank${rank}-detail"></span>
                </div>

                <strong
                    id="rank${rank}-point"
                    class="ranking-point">
                </strong>
            </div>
        `;

                const user = result.data[rank - 1];

                const nameElement = document.getElementById("rank" + rank + "-name");
                const pointElement = document.getElementById("rank" + rank + "-point");
                const titleElement = document.getElementById("rank" + rank + "-title");
                const detailElement = document.getElementById("rank" + rank + "-detail");
                const imageElement = document.getElementById("rank" + rank + "-image");

                nameElement.textContent = user.name;
                pointElement.textContent = user.point + " P";
                titleElement.textContent = user.equipped_title || "";

                if (type === "total") {
                    detailElement.textContent = "연승 " + user.current_streak + "회";
                } else {
                    detailElement.textContent = "주간 성공 " + user.success_count + "회";
                }

                if (user.equipped_profile_image) {
                    const imageName = encodeURIComponent(user.equipped_profile_image);

                    imageElement.style.backgroundImage =
                        'url("/images/' + imageName + '")';
                }
            }
        }
    } catch (error) {
        // 일단 로그 찍기만
        console.log(error);
    }
}

async function loadCollection(type) {
    const tabTypes = ["all", "title", "profile", "theme"];
    const groups = ["title", "profile", "theme"];
    const groupNames = ["칭호", "프로필", "테마"]; // 일단은..
    const groupCounts = [0, 0, 0]; // 이건 혹시 모르니까
    const ownedCounts = [0, 0, 0]; // 이것도

    const messageElement = document.getElementById("collection-message");
    const countElement = document.getElementById("collection-count");
    const labelElement = document.getElementById("collection-progress-label");
    const selectedTab = document.getElementById("collection-" + type + "-tab");

    // 탭 색 바꾸기 (가진거 바꾸는 거)
    for (let i = 0; i < tabTypes.length; i++) {
        const tab = document.getElementById("collection-" + tabTypes[i] + "-tab");
        if (tabTypes[i] === type) tab.className = "collection-tab active";
        else tab.className = "collection-tab";
    }

    labelElement.textContent = "전체 수집 현황";
    countElement.textContent = "- / -";
    messageElement.textContent = "도감을 불러오는 중입니다.";

    // 이전 목록 지우고 저기 그 버튼 눌러서 필터링 한거만 보여주게
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const section = document.getElementById("collection-" + group + "-section");
        const grid = document.getElementById("collection-" + group + "-grid");
        const count = document.getElementById("collection-" + group + "-count");

        grid.innerHTML = "";
        count.textContent = "- / -";

        if (type === "all" || type === group) section.style.display = "block";
        else section.style.display = "none";

        if (type === group) labelElement.textContent = groupNames[i] + " 수집 현황";
    }

    try {
        // API 찌르ㄱ
        const response = await fetch("/collection?type=" + type, {
            credentials: "include",
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "도감을 불러오지 못했습니다.");
        }

        let ownedCount = 0;

        for (let i = 0; i < result.data.length; i++) {
            const item = result.data[i].item;
            const isHave = result.data[i].isHave;

            let groupIndex;
            if (item.type === "title") groupIndex = 0;
            else if (item.type === "profile_image") groupIndex = 1;
            else if (item.type === "theme") groupIndex = 2;
            else continue;

            groupCounts[groupIndex]++;

            let stateClass = "locked";
            let stateText = "미보유";
            if (isHave) {
                stateClass = "owned";
                stateText = "보유";
                ownedCount++;
                ownedCounts[groupIndex]++;
            }

            let imageHtml = `
                <div class="collection-image" style="font-size:14px;">
                    ${item.value}
                </div>
            `;

            if (item.type === "profile_image") {
                imageHtml = `
                    <div class="collection-image" style="
                        background-image: url('/images/${item.value}');
                        background-size: contain;
                        background-position: center;
                        background-repeat: no-repeat;">
                    </div>
                `;
            }

            let equipHtml = "";

            if (isHave && (item.type === "title" || item.type === "profile_image")) {
                let equipType = "title";

                if (item.type === "profile_image") {
                    equipType = "profile";
                }

                equipHtml = `
                    <button type="button"
                        onclick="equipCollectionItem('${equipType}', ${item.id})">
                        장착
                    </button>
                    `;
            }

            const grid = document.getElementById("collection-" + groups[groupIndex] + "-grid");

            grid.innerHTML += `
                <div class="collection-item ${stateClass}">
                    ${imageHtml}
                    <h3>${item.name}</h3>
                    <span class="collection-state">${stateText}</span> 
                    ${equipHtml}
                </div>
            `;
        }

        countElement.textContent = ownedCount + " / " + result.data.length;

        for (let i = 0; i < groups.length; i++) {
            const count = document.getElementById("collection-" + groups[i] + "-count");
            const grid = document.getElementById("collection-" + groups[i] + "-grid");

            count.textContent = ownedCounts[i] + " / " + groupCounts[i];
            if (groupCounts[i] === 0) grid.textContent = "등록된 아이템이 없습니다.";
        }

        messageElement.textContent = "";
    } catch (error) {
        console.log(error); // 여기도 일단 로그만
    }
}

async function loadShop() {
    const decorateGrid = document.getElementById("shop-decorate-grid");
    const playGrid = document.getElementById("shop-play-grid");
    const messageElement = document.getElementById("shop-message");

    decorateGrid.innerHTML = "";
    playGrid.innerHTML = "";

    try {
        await loadPoint();
        const response = await fetch("/shop", { credentials: "include" });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "상품을 불러오지 못했습니다.");
        }

        for (let i = 0; i < result.data.length; i++) {
            const item = result.data[i];
            let grid = decorateGrid;

            if (item.type === "usage_item")
                grid = playGrid;


            let imageHtml = `
                <div class="shop-item-image" style="font-size:16px;">아이템</div>
            `;

            if (item.type === "profile_image") {
                imageHtml = `
                    <div class="shop-item-image" style="
                        background-image: url('/images/${item.value}');
                        background-size: contain;
                        background-position: center;
                        background-repeat: no-repeat;">
                    </div>
                `;
            } else if (item.type === "title" || item.type === "theme") {
                imageHtml = `
                    <div class="shop-item-image" style="font-size:16px;">
                        ${item.value}
                    </div>
                `;
            }

            grid.innerHTML += `
                <div class="shop-item">
                    ${imageHtml}
                    <div class="shop-item-info">
                        <h3>${item.name}</h3>
                        <p id="shop-quantity-${item.id}"></p>
                        <div class="shop-item-bottom">
                            <strong>${item.price} P</strong>
                            <button id="shop-buy-${item.id}" class="shop-buy-button"
                                onclick="buyShopItem(${item.id})">구매</button>
                        </div>
                    </div>
                </div>
            `;
        }

        messageElement.textContent = "";
    } catch (error) {
        console.log(error);
    }
}

async function buyShopItem(itemId) {
    const button = document.getElementById("shop-buy-" + itemId);
    const quantityElement = document.getElementById("shop-quantity-" + itemId);

    button.disabled = true;
    button.textContent = "구매 중";

    try {
        const response = await fetch("/shop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ itemId: itemId }),
        });
        const result = await response.json();

        if (!response.ok) {
            if (result.code === "NOT_VALID") {
                throw new Error("포인트가 부족합니다.");
            }
            throw new Error(result.message || "구매하지 못했습니다.");
        }

        const purchase = result.data.data; // 이거 나중에 API 부분 바꾸는게 좋을지도 data.data

        quantityElement.textContent = "보유 " + purchase.quantity + "개";
        await loadPoint();
    } catch (error) {
        console.log(error);
    } finally {
        button.disabled = false;
        button.textContent = "구매";
    }
}

async function equipCollectionItem(type, itemId) {
    try {
        const response = await fetch(
            "/equip?type=" + type + "&itemId=" + itemId,
            { credentials: "include" }
        );

        const result = await response.json();
        // console.log(result);
    } catch (error) {
        console.log("[FETCH ERROR]" +error);
    }
}