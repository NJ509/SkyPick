export async function loadPoint() {
    try {
        const response = await fetch("http://localhost:3000/point", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("포인트 조회 실패:", data.message);
            return;
        }

        document.querySelectorAll(".point").forEach(element => {
            element.textContent =
                `${Number(data.data.point).toLocaleString("ko-KR")} P`;
        });

    } catch (error) {
        console.error("포인트 조회 오류:", error);
    }
}