const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");
const form = document.getElementById("myform");

//SUBMIT INSTANCES
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;
    
    if (email.length === 0) {
        emailInput.classList.add("input-error");
        message.textContent = "לא הוזנה כתובת אימייל";
        return;
    }
    //default browser email validity check
    if (!emailInput.validity.valid) {
        emailInput.classList.add("input-error");
        message.textContent = "נסו להשתמש בפורמט yourname@email.com";
        return;
    }
    
    if (password.length === 0) {
        passwordInput.classList.add("input-error");
        message.textContent = "לא הוזנה סיסמא";
        return;
    }
    if (password.length < 6) {
        passwordInput.classList.add("input-error");
        message.textContent = "הסיסמה חייבת להכיל לפחות 6 תווים";
        return;
    }

    window.location.href = "ProfilesScreen.html";

});

form.addEventListener("input", function (event) {
    emailInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
    message.textContent = "";
});


