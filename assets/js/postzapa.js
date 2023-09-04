// Obtén una referencia al botón de "Volver"
const goBackButton = document.getElementById("goBack");

// Manejador de eventos para desplazamiento de la página
window.addEventListener("scroll", () => {
  // Obtén la posición actual de desplazamiento vertical
  const scrollPosition = window.scrollY || document.documentElement.scrollTop;

  // Define la posición deseada para el botón
  const desiredPosition = 10; // Ajusta según sea necesario

  // Actualiza la posición del botón si es necesario
  if (scrollPosition >= desiredPosition) {
    goBackButton.style.top = "10";
  } else {
    goBackButton.style.top = `${desiredPosition - scrollPosition}px`;
  }
});
