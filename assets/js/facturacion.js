
// Mostrar u ocultar los campos de tarjeta según el método de pago seleccionado
let metodoPago = document.getElementById('metodo-pago');
let tarjetaCampos = document.getElementById('tarjeta-campos');
let tarjetaDiv = document.querySelector(".card-wrapper")
let tarjetaContainer = document.getElementById("facturacion-tarjeta-container")

metodoPago.addEventListener('change', () => {
  if (metodoPago.value === 'tarjeta') {
    tarjetaCampos.style.display = 'block';
    tarjetaDiv.style.display = "block";
    tarjetaContainer.style.border = "solid 2px var(--color-primary);"
  } else {
    tarjetaCampos.style.display = 'none';
    tarjetaDiv.style.display = "none"
    tarjetaContainer.style.border = "none"
  }
});

function validarFormulario() {
  // Obtener los valores ingresados en el formulario
  let correoElectronico = document.getElementById('email').value
  let metodoPago = document.getElementById('metodo-pago').value;

  // Validar formato de correo electrónico
  let correoElectronicoRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!correoElectronico.match(correoElectronicoRegex)) {
    alert('Por favor, ingrese un correo electrónico válido.');
    return false;
  }

  // Validar método de pago
  if (metodoPago === 'tarjeta') {
    let nombreTarjeta = document.getElementById('nombre-tarjeta').value;
    let numeroTarjeta = document.getElementById('numero-tarjeta').value;
    let fechaVencimiento = document.getElementById('mm-aa').value;
    let cvc = document.getElementById('cvc').value;
    let tipoTarjeta = document.getElementById('tarjetas-disponibles').value;

    //Validar Fecha de vencimiento

    // // Obtener la fecha actual
    // const fechaActual = new Date();
    // // Dividir el valor en mes (MM) y año (AA)
    // const partesFecha = fechaVencimiento.split('/');

    // // Verificar si se obtuvieron dos partes válidas (mes y año)
    // if (partesFecha.length === 2) {
    //   const mes = parseInt(partesFecha[0], 10); // Convertir a número base 10
    //   const ano = parseInt(partesFecha[1], 10); // Convertir a número base 10

    //   // Verificar si el mes es válido (entre 1 y 12) y el año es válido (mayor o igual al año actual)
    //   if (!isNaN(mes) && !isNaN(ano) && mes >= 1 && mes <= 12 && ano >= fechaActual.getFullYear() % 100) {
    //     // La fecha ingresada es válida
    //   } else {
    //     // La fecha ingresada no es válida
    //     alert("Ingrese una tarjeta que no haya caducado")
    //     return false
    //   }
    // } else {
    //   // El formato de fecha ingresado no es válido (no tiene dos partes separadas por '/')
    //   alert('El formato de fecha no es válido. Recuerde que es MM/AA');
    //   return false
    // }

    // Validar campos requeridos para el pago con tarjeta
    if (nombreTarjeta === '' || numeroTarjeta === '' || fechaVencimiento === '' || cvc === '') {
      alert('Por favor, complete todos los campos requeridos para el pago con tarjeta.');
      return false;
    }

    var numTarjeta = numeroTarjeta.replace(/\s+/g, '').replace(/-/g, '');
    // Validar si el número de tarjeta coincide con el tipo seleccionado
    if (tipoTarjeta === '1' && !esVisa(numTarjeta)) {
      alert('El número de tarjeta Visa es inválido');
      return false;
    }
    if (tipoTarjeta === '2' && !esVisaDebito(numTarjeta)) {
      alert('El número de tarjeta Visa es inválido');
      return false;
    }
    if (tipoTarjeta === '3' && !esMastercard(numTarjeta)) {
      alert('El número de tarjeta Mastercard es inválido');
      return false;
    }
    if (tipoTarjeta === '4' && !esMastercardDebito(numTarjeta)) {
      alert('El número de tarjeta Visa es inválido');
      return false;
    }

    if (!validarLuhn(numTarjeta)) {
      alert('El número de tarjeta es inválido')
      return false
    } 

  }
  // Si todas las validaciones pasan, se puede enviar el formulario
  return true;
}
//Funciones para validar
  function esVisa(numeroTarjeta) {
    // Expresión regular para validar el formato de los números de tarjeta Visa
    var visaPattern = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
    return visaPattern.test(numeroTarjeta);
  }

  function esMastercard(numeroTarjeta) {
    // Expresión regular para validar el formato de los números de tarjeta Mastercard
    var mastercardPattern = /^(?:5[1-5][0-9]{14})$/;
    return mastercardPattern.test(numeroTarjeta);
  }
  function esVisaDebito(numeroTarjeta) {
    // Expresión regular para validar el formato de los números de tarjeta Visa de débito
    var visaDebitoPattern = /^(?:4[0-9]{15}(?:[0-9]{3})?)$/;
    return visaDebitoPattern.test(numeroTarjeta);
  }

  function esMastercardDebito(numeroTarjeta) {
    // Expresión regular para validar el formato de los números de tarjeta Mastercard de débito
    var mastercardDebitoPattern = /^(?:5[1-5][0-9]{14})$/;
    return mastercardDebitoPattern.test(numeroTarjeta);
  }
  
  function validarLuhn(numeroTarjeta) {
    var sum = 0;
    var shouldDouble = false;

    // Iterar por cada dígito del número de tarjeta de derecha a izquierda
    for (var i = numeroTarjeta.length - 1; i >= 0; i--) {
      var digit = parseInt(numeroTarjeta.charAt(i));

      // Si el dígito debe duplicarse
      if (shouldDouble) {
        digit *= 2;

        // Si el resultado tiene dos dígitos, sumar los dígitos individuales
        if (digit > 9) {
          digit = digit.toString();
          digit = parseInt(digit.charAt(0)) + parseInt(digit.charAt(1));
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }
    // La suma total debe ser divisible por 10 para ser válido
    return sum % 10 === 0;
  }

const carritoDataElement = document.getElementById('carritoData');
const carritoData = JSON.parse(carritoDataElement.dataset.carritoData);
document.getElementById('btnDescargarFactura').addEventListener('click', function() {
  // Realizar una petición al servidor para descargar la factura
  const carritoDataEncoded = encodeURIComponent(JSON.stringify(carritoData));
  fetch(`/descargar-factura/${carritoDataEncoded}`)
    .then(function(response) {
      return response.blob();
    })
    .then(function(blob) {
      // Crear un enlace temporal para descargar el archivo
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'factura.pdf';
      link.click();
    });
});
