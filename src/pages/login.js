const loginForm = document.querySelector(".login-form");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = document.getElementById("login-id").value.trim();
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                id: id,
                password: password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        alert("로그인에 성공했습니다.");
        location.href = "./home.html";

    } catch (error) {
        console.error("로그인 오류:", error);
        alert("서버와 연결할 수 없습니다.");
    }
});