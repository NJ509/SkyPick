const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

const script = document.createElement("script");
script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`;

// 지역별 대표 역
const stations = [
    { name: "서울역", region: "서울", lat: 37.55406888733184, lon: 126.97070335253385, nx: 61, ny: 127 },
    { name: "인천역", region: "인천", lat: 37.476166712082836, lon: 126.61682219568799, nx: 55, ny: 126 },
    { name: "수원역", region: "경기", lat: 37.2657903079673, lon: 127.000094700292, nx: 61, ny: 121 },
    { name: "춘천역", region: "강원", lat: 37.884512737384, lon: 127.716698593345, nx: 73, ny: 135 },
    { name: "청주역", region: "충북", lat: 36.6471521939553, lon: 127.392335249207, nx: 68, ny: 108 },
    { name: "천안역", region: "충남", lat: 36.80907913057255, lon: 127.14677293470254, nx: 64, ny: 111 },
    { name: "대전역", region: "대전", lat: 36.33229415139486, lon: 127.4346445159045, nx: 69, ny: 101 },
    { name: "전주역", region: "전북", lat: 35.8498531247183, lon: 127.16180338402, nx: 65, ny: 90 },
    { name: "목포역", region: "전남", lat: 34.79113445784631, lon: 126.38657548066539, nx: 51, ny: 67 },
    { name: "광주송정역", region: "광주", lat: 35.13766750683345, lon: 126.79080503506053, nx: 58, ny: 75 },
    { name: "포항역", region: "경북", lat: 36.07160517955013, lon: 129.34192815800867, nx: 103, ny: 96 },
    { name: "진주역", region: "경남", lat: 35.150713268353236, lon: 128.1179167693619, nx: 82, ny: 76 },
    { name: "동대구역", region: "대구", lat: 35.8793239931795, lon: 128.628393775388, nx: 90, ny: 92 },
    { name: "울산역", region: "울산", lat: 35.551427139940806, lon: 129.1385985245419, nx: 100, ny: 85 },
    { name: "부산역", region: "부산", lat: 35.11520340622514, lon: 129.04154985192403, nx: 98, ny: 75 }
];
let selectedRegion = null;

// 두 위치 사이의 거리 계산
function getDistance(lat1, lon1, lat2, lon2) {
    const toRadians = Math.PI / 180;
    const dLat = (lat2 - lat1) * toRadians;
    const dLon = (lon2 - lon1) * toRadians;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * toRadians) *
        Math.cos(lat2 * toRadians) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 가장 가까운 역 찾기
function findNearestStation(latitude, longitude) {
    let selectedRegion = null;
    let nearestStation = stations[0];

    let shortestDistance = getDistance(
        latitude, longitude,
        nearestStation.lat, nearestStation.lon
    );

    for (let i = 1; i < stations.length; i++) {
        const station = stations[i];

        const distance = getDistance(
            latitude, longitude,
            station.lat, station.lon
        );

        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestStation = station;
        }
    }

    return {
        name: nearestStation.name,
        region: nearestStation.region,
        lat: nearestStation.lat,
        lon: nearestStation.lon,
        nx: nearestStation.nx,
        ny: nearestStation.ny,
        distance: shortestDistance
    };
}

script.onload = () => {
    kakao.maps.load(() => {
        const container = document.getElementById("map");

        if (!container) {
            console.error("지도 요소를 찾을 수 없습니다.");
            return;
        }

        const options = {
            center: new kakao.maps.LatLng(36.0593, 127.88934),
            level: 12
        };

        const map = new kakao.maps.Map(container, options);
        const marker = new kakao.maps.Marker();

        // 지도 클릭 이벤트
        kakao.maps.event.addListener(map, "click", async function(mouseEvent) {
            const latlng = mouseEvent.latLng;
            const latitude = latlng.getLat();
            const longitude = latlng.getLng();

            // 가장 가까운 역 찾기
            const station = findNearestStation(latitude, longitude);

            selectedRegion = station.region;

            console.log("선택된 지역:", station.region);
            console.log("선택된 역:", station.name);

            // 지도 위 지역명 변경
            const mapRegion = document.getElementById("mapRegion");
            if (mapRegion) {
                mapRegion.textContent = station.region;
            }

            // 예측 지역 선택 상자 변경
            const regionSelect = document.getElementById("region");
            if (regionSelect) {
                regionSelect.value = station.region;
            }

            // 현재 날씨 영역의 지역명 변경
            const weatherRegion = document.getElementById("weatherRegion");
            if (weatherRegion) {
                weatherRegion.textContent = station.region;
            }

            // 마커를 선택된 역 위치에 표시
            marker.setPosition(
                new kakao.maps.LatLng(station.lat, station.lon)
            );
            marker.setMap(map);

            if (document.getElementById("weatherStatus")) {
                await loadWeather(station);
            }
        });

        // 예측 지역을 선택하면 지도 마커 이동
        const regionSelect = document.getElementById("region");

        if (regionSelect) {
            regionSelect.addEventListener("change", function () {
                const selectedRegion = regionSelect.value;

                for (let i = 0; i < stations.length; i++) {
                    const station = stations[i];

                    if (station.region === selectedRegion) {
                        const position = new kakao.maps.LatLng(
                            station.lat,
                            station.lon
                        );

                        // 마커 이동
                        marker.setPosition(position);
                        marker.setMap(map);

                        // 지도의 중심도 해당 위치로 이동
                        map.setCenter(position);

                        // 지도 위 지역 이름 변경
                        const mapRegion = document.getElementById("mapRegion");
                        if (mapRegion) {
                            mapRegion.textContent = station.region;
                        }

                        // 현재 날씨 영역의 지역 이름 변경
                        const weatherRegion = document.getElementById("weatherRegion");
                        if (weatherRegion) {
                            weatherRegion.textContent = station.region;
                        }

                        console.log("선택된 지역:", station.region);
                        console.log("선택된 역:", station.name);
                        loadWeather(station);
                        break;
                    }
                }
            });
        }
    });
};


// 기상청 단기예보 발표 시각 구하기
function getBaseDateTime() {
    const now = new Date();

    // 발표 지연을 고려해 1시간 전을 기준으로 계산
    now.setHours(now.getHours() - 1);

    const hours = [2, 5, 8, 11, 14, 17, 20, 23];
    let baseHour = 23;

    for (let i = 0; i < hours.length; i++) {
        if (now.getHours() >= hours[i]) {
            baseHour = hours[i];
        }
    }

    // 오전 2시보다 이르면 전날 23시 발표 자료 사용
    if (now.getHours() < 2) {
        now.setDate(now.getDate() - 1);
        baseHour = 23;
    }

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return {
        baseDate: `${year}${month}${day}`,
        baseTime: String(baseHour).padStart(2, "0") + "00"
    };
}

// 날씨 코드 해석
function getWeatherStatus(sky, pty) {
    if (pty === "1" || pty === "4") return "비";
    if (pty === "2" || pty === "3") return "비 또는 눈";
    if (pty === "5") return "빗방울";
    if (pty === "6" || pty === "7") return "눈 또는 빗방울";

    if (sky === "1") return "맑음";
    if (sky === "3") return "구름 많음";
    if (sky === "4") return "흐림";

    return "정보 없음";
}

// 선택한 지역의 날씨 조회
async function loadWeather(station) {
    const weatherStatus = document.getElementById("weatherStatus");
    weatherStatus.textContent = "날씨 조회 중...";

    try {
        // 1. 위도와 경도를 기상청 격자로 변환
        const nx = station.nx;
        const ny = station.ny;

        if (nx === null || ny === null) {
            throw new Error("격자 좌표를 읽을 수 없습니다.");
        }

        // 2. 날씨 API에 필요한 날짜와 발표 시각 구하기
        const base = getBaseDateTime();

        // 3. 기상청 단기예보 조회
        const weatherResponse = await fetch(
            `http://localhost:3000/api/weather?base_date=${base.baseDate}&base_time=${base.baseTime}&nx=${nx}&ny=${ny}`
        );

        if (!weatherResponse.ok) {
            throw new Error("날씨 API 요청에 실패했습니다.");
        }

        const data = await weatherResponse.json();

        if (
            !data.response ||
            !data.response.body ||
            !data.response.body.items
        ) {
            throw new Error("날씨 데이터가 없습니다. API 응답을 확인하세요.");
        }

        const items = data.response.body.items.item;

        if (!items || items.length === 0) {
            throw new Error("조회된 예보가 없습니다.");
        }

        // 4. 현재 시각 이후의 가장 가까운 기온 예보 시각 찾기
        const now = new Date();
        const currentDateTime =
            now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, "0") +
            String(now.getDate()).padStart(2, "0") +
            String(now.getHours()).padStart(2, "0") +
            "00";

        let target = null;

        for (let i = 0; i < items.length; i++) {
            if (
                items[i].category === "TMP" &&
                items[i].fcstDate + items[i].fcstTime >= currentDateTime
            ) {
                if (
                    target === null ||
                    items[i].fcstDate + items[i].fcstTime <
                    target.fcstDate + target.fcstTime
                ) {
                    target = items[i];
                }
            }
        }

        // 이후 예보가 없으면 가장 먼저 제공된 기온 사용
        if (target === null) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].category === "TMP") {
                    target = items[i];
                    break;
                }
            }
        }

        if (target === null) {
            throw new Error("기온 예보를 찾을 수 없습니다.");
        }

        // 5. 같은 예보 시각의 날씨 값 가져오기
        const weather = {};

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (
                item.fcstDate === target.fcstDate &&
                item.fcstTime === target.fcstTime
            ) {
                weather[item.category] = item.fcstValue;
            }
        }

        // 6. 화면에 날씨 표시
        document.getElementById("weatherRegion").textContent =
            station.region;

        document.getElementById("weatherDate").textContent =
            `${target.fcstDate.slice(0, 4)}.${target.fcstDate.slice(4, 6)}.${target.fcstDate.slice(6, 8)} ${target.fcstTime.slice(0, 2)}시 예보`;

        document.getElementById("temperature").textContent =
            weather.TMP !== undefined ? `${weather.TMP}°` : "--°";

        const status = getWeatherStatus(weather.SKY, weather.PTY);
        document.getElementById("weatherStatus").textContent = status;

        let icon = "🌤️";

        if (status === "맑음") icon = "☀️";
        else if (status === "흐림") icon = "☁️";
        else if (status.includes("비")) icon = "🌧️";
        else if (status.includes("눈")) icon = "🌨️";

        document.getElementById("weatherIcon").textContent = icon;

        document.getElementById("weatherPop").textContent =
            weather.POP !== undefined ? `${weather.POP}%` : "--";

        document.getElementById("weatherHumidity").textContent =
            weather.REH !== undefined ? `${weather.REH}%` : "--%";

        document.getElementById("weatherRain").textContent =
            weather.PCP !== undefined ? weather.PCP : "--";

        console.log("날씨 조회 성공:", station.region, weather);
    } catch (error) {
        console.error("날씨 조회 실패:", error);
        weatherStatus.textContent = "날씨를 불러오지 못했습니다.";
    }
}

document.head.appendChild(script);


//예측 시간 
const predictionTime = document.getElementById("prediction-time");

function setPredictionTime() {
    if (!predictionTime) return;

    const now = new Date();

    // 현재 시각 기준 2시간 뒤
    const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // 현재 시각 기준 48시간 뒤
    const maxTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // datetime-local에 맞는 형식으로 변환
    function formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hour}:${minute}`;
    }

    predictionTime.min = formatDateTime(minTime);
    predictionTime.max = formatDateTime(maxTime);

    // 기본값은 2시간 뒤
    predictionTime.value = formatDateTime(minTime);
}

setPredictionTime();

document.getElementById("complete-button").addEventListener("click", async () => {
    if (!selectedRegion) {
        alert("지역을 먼저 선택해주세요.");
        return;
    }

    const signupData = JSON.parse(sessionStorage.getItem("signupData"));

    if (!signupData) {
        alert("회원가입 정보가 없습니다.");
        location.href = "./signup.html";
        return;
    }

    try {
        // 회원가입 요청
        const signupResponse = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...signupData,
                map: selectedRegion
            })
        });

        const signupResult = await signupResponse.json();

        if (!signupResponse.ok) {
            alert(signupResult.message || "회원가입에 실패했습니다.");
            return;
        }

        // 회원가입 성공 후 자동 로그인
        const loginResponse = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                id: signupData.id,
                password: signupData.password
            })
        });

        const loginResult = await loginResponse.json();

        if (!loginResponse.ok) {
            alert("회원가입은 성공했지만 자동 로그인에 실패했습니다.");
            location.href = "./login.html";
            return;
        }

        sessionStorage.removeItem("signupData");

        alert("회원가입이 완료되었습니다!");
        location.href = "./home.html";

    } catch (error) {
        console.error("회원가입 오류:", error);
        alert("서버와 연결할 수 없습니다.");
    }
});