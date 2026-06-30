//_______________________________//
//         DOM ELEMENTS          //
//_______________________________//
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");
const form = document.getElementById("myform");

//_______________________________//
//            API                //
//_______________________________//

function login(email,password){
    fetch("/login", {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email,password })        
    })
    .then(res=> res.json())
    .then(data=> {
        if (data.success){
            window.location.href= "/profiles";
        } else{
            message.textContent = data.message;
        }
    });
}

//_______________________________//
//          FUNCTIONS            //
//_______________________________//

function showError(msg, field) {
    message.textContent = msg;
    field.classList.add("input-error");
}

//_______________________________//
//          LISTENERS            //
//_______________________________//

//SUBMIT INSTANCES
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;
    //ERRORS
    if (email.length === 0) {
        return showError("לא הוזנה כתובת אימייל", emailInput);
    }
    if (!emailInput.validity.valid) {
        return showError("נסו להשתמש בפורמט yourname@email.com", emailInput);
    }
    if (password.length === 0) {
        return showError("לא הוזנה סיסמא", passwordInput);
    }
    if (password.length < 6) {
        return showError("הסיסמה חייבת להכיל לפחות 6 תווים", passwordInput);
    }
    //SERVER REQUEST
    login(email, password);
});

//CLEAR ERRORS WHILE TYPING
form.addEventListener("input", function (event) {
    emailInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
    message.textContent = "";
});


