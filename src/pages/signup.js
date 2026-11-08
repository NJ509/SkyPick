const signupForm = document.querySelector(".signup-form");

signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("signup-id").value.trim();
    const password = document.getElementById("signup-password").value;
    const passwordCheck = document.getElementById("signup-password-check").value;
    const name = document.getElementById("signup-nickname").value.trim();

    if (password !== passwordCheck) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    const signupData = {
        id,
        password,
        name
    };

    sessionStorage.setItem("signupData", JSON.stringify(signupData));

    location.href = "./mapSelect.html";
});