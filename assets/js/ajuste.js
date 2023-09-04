
async function mostrarModal() {
  await fetch("/CheckUsername", {
    method: "GET"
  })
  .then((response) => response.json())
  .then((data) => {
    if (data.status) {
      var modalOverlay = document.getElementById('modal-overlay');
      var modalContent = document.getElementById('modal-content');
       modalOverlay.style.display = 'flex';
       modalContent.style.display = 'block';

       // Bloquear el desplazamiento del cuerpo (scroll)
       document.body.style.overflow = 'hidden';
    } else {
      const diffDays = data.diffDays;
        let p_el = document.querySelector(".username-not-available")
        p_el.innerHTML = `<p class="username-not-available">No podes cambiar el usuario, faltan ${diffDays} dias</p>`
    }
  })
}


  function cerrarModal() {
    var modalOverlay = document.getElementById('modal-overlay');
    var modalContent = document.getElementById('modal-content');
    modalOverlay.style.display = 'none';
    modalContent.style.display = 'none';

    // Habilitar el desplazamiento del cuerpo (scroll)
    document.body.style.overflow = 'auto';
  }
  function mostrarModalToken() {
    var modalOverlay = document.getElementById('tokenModal');
    var modalContent = document.getElementById('modal-content-token');
    modalOverlay.style.display = 'flex';
    modalContent.style.display = 'block';

    // Bloquear el desplazamiento del cuerpo (scroll)
    document.body.style.overflow = 'hidden';

    fetch("/GenerarToken", {
      method: "POST",
    })
    .then((response) => response.json())
    .then((data) => {
      //Se recibio el token
      const token = data.token;
      const expirationDate = data.expirationDate
      let checkTokenBtn = document.getElementById("verifyTokenButton")
      checkTokenBtn.addEventListener("click", event => {
          // Obtener la hora actual en milisegundos
          const horaActual = Date.now();
          // Convertir la fecha almacenada en la base de datos a milisegundos
          const fechaDBMilisegundos = new Date(expirationDate).getTime();

          // Verificar si la hora actual en milisegundos es menor que la fecha almacenada en la base de datos
          if (horaActual < fechaDBMilisegundos) {
            // La hora actual es menor, el token es válido
            if (document.getElementById("tokenInput").value == token) {
              //Cambiar contraseña
              cerrarModalToken();
              mostrarModalPassword();
            } else {
              document.getElementById("token-error").style.display = "block"
            }
          } else {
            // La hora actual es mayor o igual, el token ha expirado
            console.log('El token ha expirado');
          }
        })
      })
    .catch((error) => {
      console.log("Error al generar token!")
    })
  }

  function cerrarModalToken() {
    var modalOverlay = document.getElementById('tokenModal');
    var modalContent = document.getElementById('modal-content-token');
    modalOverlay.style.display = 'none';
    modalContent.style.display = 'none';

    // Habilitar el desplazamiento del cuerpo (scroll)
    document.body.style.overflow = 'auto';
  }

  function mostrarModalPassword() {
    var modalOverlay = document.getElementById('passwordModal');
    var modalContent = document.getElementById('modal-content-password');
    modalOverlay.style.display = 'flex';
    modalContent.style.display = 'block';

    // Bloquear el desplazamiento del cuerpo (scroll)
    document.body.style.overflow = 'hidden';
  }

  function cerrarModalPassword() {
    var modalOverlay = document.getElementById('passwordModal');
    var modalContent = document.getElementById('modal-content-password');
    modalOverlay.style.display = 'none';
    modalContent.style.display = 'none';

    // Habilitar el desplazamiento del cuerpo (scroll)
    document.body.style.overflow = 'auto';
  }
  

  function cambiarNombreUsuario() {
    const Username = document.getElementById("name").value;
    var nuevoNombre = document.getElementById('nuevo-nombre').value;
    let input = document.getElementById("name").value = nuevoNombre
    const data = {
        newUsername: nuevoNombre
    };
    //cerrarModal();  
    fetch("/changeusername", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
            cerrarModal();
        })
        .catch((error) => {
          console.error("Error al realizar la solicitud:", error);
        });
    }

function GenerarTokenNuevo() {
  fetch("/GenerarToken", {
    method: "POST",
  })
  .then((response) => response.json())
  .then((data) => {
    //Se recibio el token
    const token = data.token;
    let checkTokenBtn = document.getElementById("verifyTokenButton")
    checkTokenBtn.addEventListener("click", event => {
      const sql = 'SELECT Fecha FROM Tokens WHERE token = ?'
      db.query(sql, [token], async (err, result) => {
        if (err) {
          console.log("Error al buscar la caducidad del token")
          return
        }
        FechaDB = result[0].fecha;
        // Obtener la hora actual en milisegundos
        const horaActual = Date.now();

        // Convertir la fecha almacenada en la base de datos a milisegundos
        const fechaDBMilisegundos = new Date(fechaDB).getTime();
        // Verificar si la hora actual en milisegundos es menor que la fecha almacenada en la base de datos
        if (horaActual < fechaDBMilisegundos) {
          // La hora actual es menor, el token es válido
          //Generar cuadro para cambiar contraseña
        } else {
          // La hora actual es mayor o igual, el token ha expirado
          console.log('El token ha expirado');
        }
      })
    })

  })
  .catch((error) => {
    console.log("Error al generar token!")
  })
}


let changepasswordBtn = document.getElementById("changePasswordBtn");
changepasswordBtn.addEventListener("click", e =>{
  let newpass = document.getElementById("passwordInput").value;
  let renewpass = document.getElementById("confirmPasswordInput").value;
  if (newpass != renewpass) {
    document.getElementById("error-pass").style.display = "block";
  } else {
    fetch("/changepassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({password: newpass, repassword: renewpass}),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      let div_el = document.querySelector(".password-container")
      let status_p = document.createElement("p")
      cerrarModalPassword()
      if (data.status === 200) {  
        status_p.innerHTML = "<p>Contraseña actualizada!</p>"
        status_p.style = "color: green; fontweight: 500;"
        div_el.appendChild(status_p)
      } else {
        status_p.innerHTML = "<p>Error al cambiar la contraseña!</p>"
        status_p.style = "color: red; fontweight: 500;"
        div_el.appendChild(status_p)
      }
    })
    .catch((error) => {
      console.log("Error al cambiar contraseña", error)
    })
  }
})
