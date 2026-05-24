const emailInput = document.getElementById("email");
const message = document.getElementById("message");
const form = document.getElementById("myform");

emailInput.addEventListener("input", function () {
    console.log(emailInput.value);
});


emailInput.addEventListener("input", function () {
    message.textContent = emailInput.value;
});



