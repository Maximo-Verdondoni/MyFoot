
let form = document.querySelector("form");
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const password = document.getElementById("password");
    const repassword = document.getElementById("repassword");

    if (password.value != repassword.value) {
      // Las contraseñas no coinciden, muestra un mensaje de error
      document.getElementById("error-p").style.display = "block";
      password.value = "";
      repassword.value = "";
      return;
    }
    // Las contraseñas coinciden, puedes enviar el formulario
    form.submit();
  });
