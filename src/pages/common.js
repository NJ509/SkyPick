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

async function loadDamagochi() {
    const msg = document.getElementById("damagochi-message");
    const emptyBox = document.getElementById("damagochi-empty");
    const loginBox = document.getElementById("damagochi-login");
    const againBtn = document.getElementById("damagochi-retry");

    msg.textContent = "다마고치를 불러오는 중입니다.";
    msg.className = "damagochi-message";

    emptyBox.hidden = true;
    loginBox.hidden = true;
    againBtn.hidden = true;

    try {
        const res = await fetch("/damagochi", {
            credentials: "include"
        });

        const result = await res.json();

        if(res.status === 404) {
            emptyBox.hidden = false;
            msg.textContent = "새로운 친구와 함께 시작해보세요.";
            return false;
        }

        if(!res.ok) {
            if(res.status === 401) {
                loginBox.hidden = false;
            } else {
                againBtn.hidden = false;
            }

            if(result.data && result.data.point !== undefined) {
                document.getElementById("user-point").textContent = result.data.point + " P";
            }

            msg.textContent = result.message || "요청을 처리하지 못했습니다.";
            msg.className = "damagochi-message error";
            return false;
        }

        if(result.data.name !== undefined) {
            document.getElementById("damagochi-name").textContent = result.data.name;
            document.getElementById("damagochi-name-input").value = result.data.name;
        }

        document.getElementById("damagochi-level").textContent = "Lv. " + result.data.level;
        document.getElementById("damagochi-exp").textContent = result.data.exp + " / 100 EXP";
        document.getElementById("damagochi-exp-bar").value = result.data.exp;
        document.getElementById("damagochi-exp-note").textContent = "다음 레벨까지 " + (100 - result.data.exp) + " EXP 남았어요.";

        document.getElementById("damagochi-speech").textContent = "반가워요! 오늘도 함께 놀아요.";
        msg.textContent = "먹이기와 씻기로 친구를 돌봐주세요.";

        return true;
    } catch (e) {
        console.log("[FETCH ERROR] " +e);

        againBtn.hidden = false;
        msg.textContent = "다마고치를 불러오지 못했습니다. 다시 시도해주세요.";
        msg.className = "damagochi-message error";

        return false;
    }
}

// 없으면 생성a
async function createDamagochi() {
    const msg = document.getElementById("damagochi-message");
    const emptyBox = document.getElementById("damagochi-empty");
    const loginBox = document.getElementById("damagochi-login");
    const againBtn = document.getElementById("damagochi-retry");

    msg.textContent = "새로운 친구를 만나고 있어요.";
    msg.className = "damagochi-message";

    try {
        const res = await fetch("/damagochi", {
            method: "POST",
            credentials: "include"
        });

        const result = await res.json();

        if(!res.ok && res.status !== 409) {
            if(res.status === 401) {
                emptyBox.hidden = true;
                againBtn.hidden = true;
                loginBox.hidden = false;
            } else if(res.status === 404) {
                againBtn.hidden = false;
            }

            if(result.data && result.data.point !== undefined) {
                document.getElementById("user-point").textContent = result.data.point + " P";
            }

            msg.textContent = result.message || "요청을 처리하지 못했습니다.";
            msg.className = "damagochi-message error";
            return;
        }

        const loadOk = await loadDamagochi();

        if(loadOk) {
            msg.textContent = "구름 친구를 만났어요! 이름을 지어주고 함께 자라보세요.";
            msg.className = "damagochi-message";
        }
    } catch (e) {
        console.log("[FETCH ERROR] " +e);

        againBtn.hidden = false;
        msg.textContent = "다마고치를 만들지 못했습니다. 다시 불러와 확인해주세요.";
        msg.className = "damagochi-message error";
    }

}

// 다마고치 케어하기 (씻기/먹이기)
async function careDamagochi(type) {
    if(type !== "feed" && type !== "wash") {
        return;
    }

    const box = document.getElementById("damagochi-stage");
    const talk = document.getElementById("damagochi-speech");
    const expText = document.getElementById("damagochi-reward");
    const msg = document.getElementById("damagochi-message");
    const point = document.getElementById("user-point");

    // 효과만 다르게, API 똑같이
    if(type === "feed") {
        box.className = "damagochi-stage is-feeding";
        talk.textContent = "아~ 맛있는 먹이를 먹어요!";
        msg.textContent = "먹이를 주고 있어요.";
    } else {
        box.className = "damagochi-stage is-washing";
        talk.textContent = "뽀득뽀득! 목욕하는 시간이에요.";
        msg.textContent = "깨끗하게 씻고 있어요.";
    }

    msg.className = "damagochi-message";
    expText.textContent = "";

    try {
        const res = await fetch("/damagochi/exp", {
            method: "POST",
            credentials: "include"
        });

        const result = await res.json();

        if(!res.ok) {
            if(res.status === 401) {
                document.getElementById("damagochi-empty").hidden = true;
                document.getElementById("damagochi-retry").hidden = true;
                document.getElementById("damagochi-login").hidden = false;
            } else if(res.status === 404) {
                document.getElementById("damagochi-retry").hidden = false;
            }

            if(result.data && result.data.point !== undefined) {
                point.textContent = result.data.point + " P";
            }

            msg.textContent = result.message || "요청을 처리하지 못했습니다.";
            msg.className = "damagochi-message error";
            box.className = "damagochi-stage";
            talk.textContent = "다음에 다시 함께해요.";
            return;
        }

        if(result.data.name !== undefined) {
            document.getElementById("damagochi-name").textContent = result.data.name;
            document.getElementById("damagochi-name-input").value = result.data.name;
        }

        document.getElementById("damagochi-level").textContent = "Lv. " + result.data.level;
        document.getElementById("damagochi-exp").textContent = result.data.exp + " / 100 EXP";
        document.getElementById("damagochi-exp-bar").value = result.data.exp;
        document.getElementById("damagochi-exp-note").textContent = "다음 레벨까지 " + (100 - result.data.exp) + " EXP 남았어요.";
        point.textContent = result.data.point + " P";

        box.className += " is-rewarding";
        expText.textContent = "+10 EXP";

        if(type === "feed") {
            talk.textContent = "냠냠! 정말 맛있어요.";
            msg.textContent = "먹이기 완료! +10 EXP · -100 P";
        } else {
            talk.textContent = "보송보송! 기분이 좋아요.";
            msg.textContent = "씻기 완료! +10 EXP · -100 P";
        }

        if(result.data.leveledUp) {
            box.className += " is-leveling";
            expText.textContent = "레벨업! +10 EXP";
            msg.textContent += " · Lv. " + result.data.level + " 레벨업!";
        }

        setTimeout(function () {
            box.className = "damagochi-stage";
        }, 1600);
    } catch (e) {
        console.log("[FETCH ERROR] " +e);

        msg.textContent = "요청 결과를 확인하지 못했습니다. 다시 불러와 상태를 확인해주세요.";
        msg.className = "damagochi-message error";
        document.getElementById("damagochi-retry").hidden = false;
        box.className = "damagochi-stage";
        talk.textContent = "다음에 다시 함께해요.";
    }
}

async function changeDamagochiName(e) {
    e.preventDefault();

    const input = document.getElementById("damagochi-name-input");
    const msg = document.getElementById("damagochi-message");
    const petName = input.value.trim();

    if(!petName || [...petName].length > 30) {
        msg.textContent = "다마고치 이름은 1~30자로 입력해주세요.";
        msg.className = "damagochi-message error";
        return;
    }

    msg.textContent = "이름을 변경하고 있어요.";
    msg.className = "damagochi-message";

    try {
        const res = await fetch("/damagochi/name", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                name: petName
            })
        });

        const result = await res.json();

        if(!res.ok) {
            if(res.status === 401) {
                document.getElementById("damagochi-empty").hidden = true;
                document.getElementById("damagochi-retry").hidden = true;
                document.getElementById("damagochi-login").hidden = false;
            } else if(res.status === 404) {
                document.getElementById("damagochi-retry").hidden = false;
            }

            if(result.data && result.data.point !== undefined) {
                document.getElementById("user-point").textContent = result.data.point + " P";
            }

            msg.textContent = result.message || "요청을 처리하지 못했습니다.";
            msg.className = "damagochi-message error";
            return;
        }

        document.getElementById("damagochi-name").textContent = petName;
        input.value = petName;
        msg.textContent = "친구의 이름을 변경했어요.";
    } catch (e) {
        console.log("[FETCH ERROR] " +e);

        msg.textContent = "이름 변경 결과를 확인하지 못했습니다. 다시 불러와 확인해주세요.";
        msg.className = "damagochi-message error";
        document.getElementById("damagochi-retry").hidden = false;
    }
}
