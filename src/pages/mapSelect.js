const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

const script = document.createElement("script");

script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`;

script.onload = () => {
    kakao.maps.load(() => {
        const container = document.getElementById("map");

        const options = {
            center: new kakao.maps.LatLng(36.0593, 127.88934),
            level: 12
        };
        const map = new kakao.maps.Map(container, options);


        const marker = new kakao.maps.Marker();
        kakao.maps.event.addListener(map, "click", function(mouseEvent) {
            const latlng = mouseEvent.latLng;

            marker.setPosition(latlng);
            marker.setMap(map);

            const latitude = latlng.getLat();
            const longitude = latlng.getLng();

            console.log("위도:", latitude);
            console.log("경도:", longitude);
        });
    });
};
document.head.appendChild(script);