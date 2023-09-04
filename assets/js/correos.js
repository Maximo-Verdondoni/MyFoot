function HTMLCorreo(name, email, subject, msm) {
    const htmlContent = `
    <html>
      <head>
        <style>
  
        :root {
          --font-default: "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
          --font-primary: "Amatic SC", sans-serif;
          --font-secondary: "Inter", sans-serif;
          }
          * {
              font-family: var(--font-secondary);
              margin: 0;
          }
          .container {
            background-color: #fff;
            border: 3px solid #ff0055;
            border-radius: 10px;
            box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2); /* Sombra */
          }
  
          .logo {
              text-align: center;
              width: 100%;
              padding: 20px 0 20px 0px;
          }   
          .logo h1 {
            font-size: 28px;
            font-weight: 700;
            color: #000;
          }
  
          .logo span {
            color: #ff0055;
          }
  
          .info {
            height: auto;
            padding: 10px;
            background-color: #ccc;
            border-top: 4px solid rgba(179, 179, 179, 0.5);
          }
  
          .info .title {
            color: #000;
            font-weight: 400px;
            font-size: 18px;
            margin-top: 10px;
            margin-bottom: 5px;
          }
          .info .sub-title {
              font-size: 16px;
              margin-left: 5px;
              margin-bottom: 2px;
          }
          .info p {
            color: #ce126ab7;
            font-weight: 500;
            font-size: 14px;
          }
          .info .inp {
              font-family: var(--font-secondary);
              margin-left: 10px;
              margin-bottom: 5px;
              color: #000;
              font-weight: 500;
          }
  
          .footer {
              background-color: #ff0055;
              text-align: center;
              padding: 10px;
          }
          .footer p {
              color: #000000;
              font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>MyFoot<span>.</span></h1>
          </div>
          <div class="info">
            <p class="title"><strong>Hemos recibido tu correo con la siguiente información:</strong></p>
            <p class="sub-title"><strong>Nombre</strong></p>
            <p class="inp">${name}</p>
            <p class="sub-title"><strong>Correo</strong></p>
            <p class="inp">${email}</p>
            <p class="sub-title"><strong>Encabezado</strong></p>
            <p class="inp">${subject}</p>
            <p class="sub-title"><strong>Mensaje</strong></p>
            <p class="inp">${msm}</p>
          </div>
          <div class="footer">
              <p>Este correo es automático. No responder</p>
              <p>Si nunca nos contactaste, ignora este correo</p>
              <p>© Copyright MyFoot. All Rights Reserved</p>
          </div>
        </div>
      </body>
    </html>
  `;
  return htmlContent
  }

  function HTMLCorreoToken(token) {
    const htmlContent = `
    <html>
    <head>
      <style>
  
      :root {
        --font-default: "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        --font-primary: "Amatic SC", sans-serif;
        --font-secondary: "Inter", sans-serif;
        }
        * {
            font-family: var(--font-secondary);
            margin: 0;
        }
        .container {
          background-color: #fff;
          border: 3px solid #ff0055;
          border-radius: 10px;
          box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2); /* Sombra */
        }
  
        .logo {
            text-align: center;
            width: 100%;
            padding: 20px 0 20px 0px;
        }   
        .logo h1 {
          font-size: 28px;
          font-weight: 700;
          color: #000;
        }
  
        .logo span {
          color: #ff0055;
        }
  
        .info {
          height: auto;
          padding: 10px;
          background-color: #ccc;
          border-top: 4px solid rgba(179, 179, 179, 0.5);
        }
  
        .info-p {
          color: black;
          margin-bottom: 20px;
          margin-left: 15px;
        }
        .info .token-div .token {
          text-align: center;
          margin-top: 40px;
          margin-bottom: 30px;
          font-size: 30px;
          color: #bd003f;
        }
        .footer {
            background-color: #ff0055;
            text-align: center;
            padding: 10px;
        }
        .footer p {
            color: #000000;
            font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>MyFoot<span>.</span></h1>
        </div>
        <div class="info">
          <div class="info-p-div">
            <p class="info-p">Hola,</p>
            <p class="info-p">Si recibiste este correo es porque solicitaste el cambio de contraseña</p>
            <p class="info-p">Este es tu token:</p>
          </div>
          <div class="token-div">
            <h2 class="token">${token}</h2>
          </div>
        </div>
        <div class="footer">
            <p>Este correo es automático. No responder</p>
            <p>Si nunca nos contactaste, ignora este correo</p>
            <p>© Copyright MyFoot. All Rights Reserved</p>
        </div>
      </div>
    </body>
  </html>
    `
    return htmlContent
  }

function HTMLCorreoRestaurar(token) {
  const htmlContent = `
  <html>
  <head>
    <style>

    :root {
      --font-default: "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      --font-primary: "Amatic SC", sans-serif;
      --font-secondary: "Inter", sans-serif;
      }
      * {
          font-family: var(--font-secondary);
          margin: 0;
      }
      .container {
        background-color: #fff;
        border: 3px solid #ff0055;
        border-radius: 10px;
        box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2); /* Sombra */
        margin-left: 25%;
        margin-right: 25%;
        margin-top: 20px;
      }

      .logo {
          text-align: center;
          width: 100%;
          padding: 20px 0 20px 0px;
      }   
      .logo h1 {
        font-size: 28px;
        font-weight: 700;
        color: #000;
      }

      .logo span {
        color: #ff0055;
      }

      .info {
        height: auto;
        padding: 10px;
        background-color: #ccc;
        border-top: 4px solid rgba(179, 179, 179, 0.5);
      }

      .info-p {
        color: black;
        margin-bottom: 20px;
        margin-left: 15px;
      }
      .info .token-div .token {
        text-align: center;
        margin-top: 40px;
        margin-bottom: 30px;
        font-size: 30px;
        color: #bd003f;
      }
      .aviso {
        background-color: #ccc;
        color: red;
        text-align: center;
        padding-bottom: 10px;
      }
      .footer {
          background-color: #ff0055;
          text-align: center;
          padding: 10px;
      }
      .footer p {
          color: #000000;
          font-size: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <h1>MyFoot<span>.</span></h1>
      </div>
      <div class="info">
        <div class="info-p-div">
          <p class="info-p">Hola,</p>
          <p class="info-p">Si recibiste este correo es porque pediste <strong>restaurar</strong> tu contraseña</p>
          <p class="info-p">Este es tu token:</p>
        </div>
        <div class="token-div">
          <h2 class="token">${token}</h2>
        </div>
      </div>
      <div class="footer">
          <p>Este correo es automático. No responder</p>
          <p>Si nunca nos contactaste, cambia tu contraseña</p>
          <p>© Copyright MyFoot. All Rights Reserved</p>
      </div>
    </div>
  </body>
</html>
  `
  return htmlContent
}



  module.exports = {
    HTMLCorreo: HTMLCorreo,
    HTMLCorreoToken: HTMLCorreoToken,
    HTMLCorreoRestaurar: HTMLCorreoRestaurar
  };