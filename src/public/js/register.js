//_______________________________//
//         ELEMENTS              //
//_______________________________//
const nameInput     = document.getElementById("name");
const emailInput    = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message       = document.getElementById("message");
const form          = document.getElementById("myform");


//_______________________________//
//             API               //
//_______________________________//
function register(name, email, password) {
    fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = "/profiles";
        } else {
            showError(data.message, emailInput);
        }
    });
}


//_______________________________//
//           FUNCTIONS           //
//_______________________________//
function showError(msg, field) {
    message.textContent = msg;
    field.classList.add("input-error");
}


//_______________________________//
//         EVENT LISTENERS       //
//_______________________________//
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value;
    const password = passwordInput.value;

    if (name.length === 0)          return showError("יש למלא שם", nameInput);
    if (name.length > 25)           return showError("השם חייב להכיל עד 25 תווים", nameInput);
    if (email.length === 0)         return showError("לא הוזנה כתובת אימייל", emailInput);
    if (!emailInput.validity.valid) return showError("נסו להשתמש בפורמט yourname@email.com", emailInput);
    if (password.length === 0)      return showError("לא הוזנה סיסמא", passwordInput);
    if (password.length < 6)        return showError("הסיסמה חייבת להכיל לפחות 6 תווים", passwordInput);

    register(name, email, password);
});

// clear errors while typing
form.addEventListener("input", function () {
    nameInput.classList.remove("input-error");
    emailInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
    message.textContent = "";
});