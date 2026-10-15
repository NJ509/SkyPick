const GRID_URL =
    "https://apihub.kma.go.kr/api/typ01/cgi-bin/url/nph-dfs_xy_lonlat";

async function convertToGrid(lat, lon) {
    const authKey = process.env.KMA_APIHUB_KEY;

    const url = new URL(GRID_URL);

    url.searchParams.set("lon", lon);
    url.searchParams.set("lat", lat);
    url.searchParams.set("help", "0");
    url.searchParams.set("authKey", authKey);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Grid API error: ${response.status}`);
    }

    const text = await response.text();

    console.log("Grid API response:", text);

    return text;
} 

export { convertToGrid };