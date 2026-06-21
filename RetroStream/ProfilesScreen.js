const nameSections = document.querySelectorAll(".name-section");

nameSections.forEach(function (section) {
    const nameText = section.querySelector(".name");
    const editButton = section.querySelector(".edit-btn");
    const input = section.querySelector(".name-input");  //השמת אלמנטים
    
    //EDIT BUTTON CLICK FOCUSES NAME CHANGE
    editButton.addEventListener("click", function () {
        section.classList.add("editing");
        input.value = nameText.textContent.trim();
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    });
    //NAME CHANGE COMPLETION
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            const newName = input.value.trim();
            nameText.textContent = newName || nameText.textContent.trim(); 
            section.classList.remove("editing");
        }
    });
    //MINIMIZE FOCUS BY CLICKING ELSEWHERE
    input.addEventListener("blur", function () {
        section.classList.remove("editing");
    });
 });