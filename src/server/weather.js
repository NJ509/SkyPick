const KMA_URL =
  "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

async function getWeather(baseDate, baseTime, nx, ny) {
    const serviceKey = process.env.KMA_API_KEY;
    const url = new URL(KMA_URL);

    url.searchParams.set("serviceKey", serviceKey);
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("numOfRows", "1000");
    url.searchParams.set("dataType", "JSON");
    url.searchParams.set("base_date", baseDate);
    url.searchParams.set("base_time", baseTime);
    url.searchParams.set("nx", nx);
    url.searchParams.set("ny", ny);

    const response = await fetch(url);
    
    const data = await response.json();
    return data;
}

export { getWeather };