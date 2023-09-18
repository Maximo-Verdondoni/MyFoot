document.addEventListener('DOMContentLoaded', function() {
    function filtrarPublicaciones() {
        const talle = document.querySelector(".selected").value;
        const marca = document.getElementById('marca').value;
        const origen = document.getElementById('pais').value;
        const genero = document.getElementById('genero').value;
        const pie = document.getElementById('pie').value;
        const precioMin = document.getElementById('precio-min').value;
        const precioMax = document.getElementById('precio-max').value;






        // Realiza una nueva solicitud GET a la ruta de filtrado con los parámetros de los filtros
        fetch(`/filtrar-publicaciones?talle=${talle}&marca=${marca}&origen=${origen}&genero=${genero}&pie=${pie}&precioMin=${precioMin}&precioMax=${precioMax}`)
           .then(response => response.json())
           .then(data => {
            // Obtén el contenedor de tarjetas
            const contenedorTarjetas = document.getElementById('container-posts');
        
            // Vacía el contenedor de tarjetas
            contenedorTarjetas.innerHTML = '';

            if (data.length > 0) {
                 // Itera sobre las nuevas publicaciones y crea las tarjetas
                data.forEach(publicacion => {
                    const tarjeta = crearTarjeta(publicacion);
                    contenedorTarjetas.appendChild(tarjeta);
                });
            } else {
                contenedorTarjetas.innerHTML = '<p>No hay zapatillas con esas caracteristicas</p>'
            }
        
          })
           .catch(error => {
             console.error('Error al filtrar las publicaciones', error);
             // Manejo del error
           });
    }

    // Agrega un evento de cambio a cada filtro para que se ejecute la función de filtrado
    //document.getElementById('talle').addEventListener('change', filtrarPublicaciones);
    document.getElementById('marca').addEventListener('change', filtrarPublicaciones);
    document.getElementById('pais').addEventListener('change', filtrarPublicaciones);
    document.getElementById('genero').addEventListener('change', filtrarPublicaciones);
    document.getElementById('pie').addEventListener('change', filtrarPublicaciones);
    document.getElementById('precio-min').addEventListener('change', filtrarPublicaciones);
    document.getElementById('precio-max').addEventListener('change', filtrarPublicaciones);
    const botonestalle = document.querySelectorAll(".boton-talle")
    botonestalle.forEach(function(boton){
        boton.addEventListener("click", ()=> {
            botonestalle.forEach(function(boton){
                boton.classList.remove("selected")

            })
            boton.classList.add("selected")
            let talle = boton.value
            filtrarPublicaciones()

    
    
        })
    })
});

function crearTarjeta(publicacion) {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta');
  
    const imagen = document.createElement('img');
    imagen.src = publicacion.imagen_principal;
    imagen.alt = publicacion.name;
  
    const titulo = document.createElement('h2');
    titulo.textContent = publicacion.name;
  
    const precio = document.createElement('p');
    precio.textContent = `Precio: $${publicacion.precio}`;
  
    const enlace = document.createElement('a');
    enlace.href = `/publicacion/${publicacion.idpost}`;
    enlace.textContent = 'Ver';
  
    tarjeta.appendChild(imagen);
    tarjeta.appendChild(titulo);
    tarjeta.appendChild(precio);
    tarjeta.appendChild(enlace);
  
    return tarjeta;
  }
