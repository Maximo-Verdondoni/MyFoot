const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors')
const path = require('path')
const multer = require('multer');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const moment = require('moment');
require('dotenv').config();
const correo = require('./assets/js/correos.js');

const app = express();
const port = 3000;

app.use(cors())

app.use(session({
  secret: process.env.SESSION_SCRT,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));


// Crea la instancia de multer con la configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'assets/img/posts');
  },
  filename: function (req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    const imageName = `foto-${Date.now()}-${file.fieldname}${fileExtension}`;
    cb(null, imageName);
  }
});
const upload = multer({ storage });


// Configurar la conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, //Contraseña para el cole
  //password: process.env.DB_PASSWORD2, 
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

//Configurar nodemailer para el contacto:
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD
  }
});

// Configurar el middleware de body-parser para manejar solicitudes POST
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const checkServerRedirection = (req, res, next) => {
  if (req.headers.referer && !req.headers.referer.startsWith("http://localhost:3000") && !req.headers.referer.startsWith("http://192.168.0.102:3000") && !req.headers.referer.startsWith("http://127.0.0.1:3000")) {
    // La solicitud no se originó desde el servidor, redireccionar a otra página o mostrar un error
    res.redirect("/");
  } else {
    next();
  }
};

app.use('/assets', express.static(path.join(__dirname, "/assets")));
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

//RUTAS
//Presentación
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'presentacion.html');
  res.sendFile(filePath);
})
app.get("/forgot", (req, res) => {
  res.render("forgot")
})

app.get('/toRegister', (req, res) => {
  if (req.session.username) {
    res.redirect("/home")
  }
  const filePath = path.join(__dirname, 'register.html');
  res.sendFile(filePath);
})

app.get('/toLoginError', (req, res) => {
  if (req.session.username) {
    res.redirect("/home")
  }
  const filePath = path.join(__dirname, 'login-error.html');
  res.sendFile(filePath);
})

app.get('/toLogin', (req, res) => {
  if (req.session.username) {
    res.redirect("/home")
  }
  const filePath = path.join(__dirname, 'login.html');
  res.sendFile(filePath);
})

app.get("/ajustes", requireLogin, (req, res) => {
  res.render("ajuste.ejs", {username: req.session.username})
})

app.get('/sendPostPubli', requireLogin, (req, res) => {
  res.render("Postzapa.ejs", {username: req.session.username})
})

app.get('/logout', (req, res) => {
  // Eliminar la sesión y redirigir al inicio de sesión o a cualquier otra página
  req.session.destroy();
  res.redirect('/toLogin');
});

//Ruta que redirecciona al carrito pero obtiene los datos de cada post
app.get('/carrito', requireLogin, (req, res) => {
  let carrito = req.session.carrito || [];
  let carritoData = {};
  console.log(carrito);
  const sql = `SELECT idpost, name, imagen_principal, precio FROM posts WHERE idpost IN (${carrito.join(',')})`;
  if (carrito.length > 0) {
    db.query(sql, (error, results) => {
      if (error) {
        console.log(error)
      } else {
        results.forEach((post) => {
          carritoData[post.idpost] = {
            idpost: post.idpost,
            name: post.name,
            imagen_principal: post.imagen_principal,
            precio: post.precio
          }
        });
        res.render('carrito.ejs', { username: req.session.username, carrito: carritoData });
      }
    })
  } else {
      res.render('carrito.ejs', { username: req.session.username, carrito: carritoData });
  }
  
})

//Muestra los posts sin comprar siempre y cuando este loggeado
app.get('/home', requireLogin, (req, res) => {
  const getPublicacionesQuery = `
    SELECT p.idpost, p.name, p.imagen_principal, p.precio
    FROM posts AS p
    LEFT JOIN Compras AS c ON p.idpost = c.post_id
    WHERE c.id IS NULL
  `;
  db.query(getPublicacionesQuery, async (error, results) => {
    if (error) {
      console.error('Error al obtener las publicaciones:', error);
      res.status(500).send('Error al obtener las publicaciones');
      return;
    }

    res.render('home.ejs', { username: req.session.username, publicaciones: results });
  });
});

//FILTRO DE ZAPAS
app.get('/filtrar-publicaciones', async (req, res) => {
  try {
    const talle = req.query.talle;
    const marca = req.query.marca;
    const origen = req.query.origen;
    const genero = req.query.genero;
    const pie = req.query.pie;
    const precioMin = req.query.precioMin;
    const precioMax = req.query.precioMax;

    // Construye la consulta SQL dinámica según los filtros seleccionados
    let sql = 'SELECT * FROM posts LEFT JOIN Compras AS c ON posts.idpost = c.post_id WHERE 1=1';
    let params = [];

    if (talle && talle !== 'ALL') {
      sql += ' AND Talles_id = ?';
      params.push(talle);
    }

    if (marca && marca !== 'ALL') {
      sql += ' AND Marca_id = ?';
      params.push(marca);
    }

    if (origen && origen !== 'ALL') {
      sql += ' AND Pais_id = ?';
      params.push(origen);
    }

    if (genero && genero !== 'ALL') {
      sql += ' AND genero_id = ?';
      params.push(genero);
    }

    if (pie && pie !== 'ALL') {
      sql += ' AND pie_id = ?';
      params.push(pie);
    }

    if (precioMin) {
      sql += ' AND precio >= ?';
      params.push(precioMin);
    }

    if (precioMax) {
      sql += ' AND precio <= ?';
      params.push(precioMax);
    }

    sql += ' AND c.id IS NULL';

    // Ejecuta la consulta SQL con los parámetros
    db.query(sql, params, async (err, results) => {
      const rows = results; // Obtén todas las filas de resultados
      if (Array.isArray(rows)) {
        const publicaciones = rows.map(row => {
          // Construir el objeto de publicación con las propiedades necesarias
          return {
            idpost: row.idpost,
            name: row.name,
            imagen_principal: row.imagen_principal,
            precio: row.precio
          };
        });
        res.json(publicaciones); // Envía las publicaciones filtradas como respuesta JSON
      } else {
        res.json([]); // Envía un array vacío si no hay resultados
      }
    });
  
  } catch (error) {
    console.error('Error al filtrar las publicaciones', error);
    res.status(500).json({ error: 'Error al filtrar las publicaciones' });
  }
});

//Template para la publicación
app.get('/publicacion/:id', async (req, res) => {
  const postId = req.params.id;
  // fijarse que la publicacion no este comprada
  try {
    // Consultar la base de datos para obtener los datos de la publicación según el ID
    const sql = `SELECT p.idpost, p.name, p.imagen_principal, p.imagen2, p.imagen3, p.precio, p.descripcion, pais.pais AS pais, marca.marca as marca, pie.pie as pie, talle.talle as talle, genero.genero as genero, account.username as author
    FROM posts AS p
    JOIN paises AS pais ON p.Pais_id = pais.id
    JOIN marcas AS marca ON p.marca_id = marca.id
    JOIN pies AS pie ON p.pie_id = pie.id
    JOIN talles AS talle ON p.talles_id = talle.id
    JOIN accounts as account ON p.author_id = account.id
    JOIN generos AS genero ON p.genero_id = genero.id
    WHERE p.idpost = ?;`; 
    db.query(sql, [postId], (err, result) => {
      if (err)  {
        res.status(220).send(err)
      }
      if (result.length > 0) {
        const postData = result[0];
        console.log(postData)
        //Verificar que la publicacion no este comprada
        const secondQuery = `SELECT * FROM compras WHERE post_id = ?;`; 
        db.query(secondQuery, [postId], (error, secondResult) => {
          if (error) {
            console.error('Error al ejecutar la segunda consulta:', error);
            res.status(500).send('Error al obtener los datos de compras');
            return;
          }
          if (secondResult.length > 0) {
            //Verificar que el que este queriendola ver sea el comprador
            const username = req.session.username;
            // Obtener la ID del usuario según su nombre de usuario
            const getUserIdQuery = "SELECT id FROM accounts WHERE username = ?";
            db.query(getUserIdQuery, [username], async (error, results) => {
              if (error) {
                console.error('Error al obtener la ID del usuario:', error);
                res.status(500).send('Error al obtener la ID del usuario');
                return;
              }
              const userId = results[0].id;
              const checkCompraQuery = "SELECT post_id FROM compras where post_id = ? and buyer_id = ?"
              db.query(checkCompraQuery, [postId, userId], async (error, results) => {
                if (error) {
                  console.error('Error al obtener la ID del usuario:', error);
                  res.status(500).send('Error al obtener la ID del usuario');
                  return;
                }
                if (results.length > 0) {
                  //Publicacion comprada por el
                  res.render('publicacion', {postId, post: postData, buyed: true });
                } else {
                  res.redirect('/home') //Publicacion ya comprada
                }
              })
              
            });
          } else {
            // Renderizar la plantilla de la página de la publicación y pasar los datos de la publicación
            res.render('publicacion', {postId, post: postData, buyed: false });
            }
        });
      } else {
        res.status(404).render('404');
      }
    });
  } catch (err) {
    console.error('Error al obtener los datos de la publicación:', err);
    res.status(500).send('Error al obtener los datos de la publicación');
  }
});

//POSTS

// Ruta para el registro de usuario
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { username, email, password: hashedPassword };
      const sql = 'INSERT INTO accounts SET ?';
      db.query(sql, user, (err, result) => {
          if (err) {
              console.error('Error al registrar usuario:', err);
              res.status(500).send('Error al registrar usuario');
              return;
          }
          console.log('Usuario registrado con éxito:', result);
          res.send('Usuario registrado con éxito');
        });
    } catch (err) {
        console.error('Error al hashear la contraseña:', err);
        res.status(500).send('Error al hashear la contraseña');
    }
});

//Ruta para el inicio de sesión de usuario
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)
  const sql = 'SELECT * FROM accounts WHERE username = ?';
  db.query(sql,
     [username], 
     async (err, result, fields) => { 
    if (err) {
      console.error('Error al iniciar sesión:', err);
      res.status(500).send('Error al iniciar sesión');
      return;
    }
    if (result.length == 0) {
      console.log('Usuario no encontrado:', username);
      res.redirect('/toLoginError')
      return;
    }
    if (result.length > 0) {
        const hashedPassword = result[0].password;
        bcrypt.compare(password, hashedPassword, (err, result) => {
            if (err) throw err;
            if (result) {
                req.session.loggedin = true;
                req.session.username = username;
                console.log('Inicio de sesión exitoso para el usuario:', username);
                res.redirect('/home');
            } else {

                console.log('Contraseña incorrecta para el usuario:', username);
                res.redirect('/toLoginError')
                return 
            }
        });
    }
  });
});

  app.post('/uploadPost', requireLogin, upload.array('imagen'), (req, res, err) => {
        console.log(req.files)
        let imagen1Path = req.files[0].path;
        let imagen2Path = null;
        let imagen3Path = null
        if (req.files.length >= 2) {
          imagen2Path = req.files[1].path;
        } 
        if (req.files.length >= 3) {
          imagen3Path = req.files[2].path;
        }
          //Obtener la id del usuario en la bd
          // Consulta para obtener la ID del usuario logueado
          const accountQuery = 'SELECT id FROM accounts WHERE username = ?';
          db.query(accountQuery, [req.session.username], (error, results) => {
            if (error) {
              console.error(error);
            } else {
              if (results.length > 0) {
                let userId = results[0].id;
                // Guardar la información en la base de datos
                const post = { name: req.body.nombre, 
                  imagen_principal: imagen1Path, 
                  imagen2: imagen2Path,
                  imagen3: imagen3Path,
                  Precio: req.body.precio,
                  Descripcion: req.body.descripcion ? req.body.descripcion.replace(/\r?\n/g, '') : null,
                  Talles_id: req.body.talle,
                  Marca_id: req.body.marca,
                  Pais_id: req.body.origen,
                  author_id: userId,
                  Genero_id:  req.body.genero,
                  Pie_id: req.body.pie };
                const sql = 'INSERT INTO posts SET ?';
                db.query(sql, post, (err, result) => {
                  if (err) {
                      console.error('Error al registrar post:', err);
                      res.status(500).send('Error al registrar post');
                      return;
                  }
                  console.log('Post creado con éxito:', result);
                  const postId = result.insertId; 
                  console.log('Post creado con éxito:', result);
                  res.redirect(`/publicacion/${postId}`);
                });
              } 
              else {
                // No se encontró ningún usuario con el nombre de usuario proporcionado
                console.log('Usuario no encontrado');
                // Manejar el error o redirigir a una página de error
              }
            } 
          });
  });


//Agregar post al carrito si no existe
app.get("/checkout/:id", requireLogin, (req, res) => {
  const postId = req.params.id;
  let carrito = req.session.carrito || [];
  if (carrito.includes(postId)) {
    res.redirect("/carrito")
  } else  {
    carrito.push(postId);
  req.session.carrito = carrito;
  res.redirect('/carrito')
  }
});

//Eliminar post del carrito
app.post('/eliminar', requireLogin, (req, res) => {
  const postId = req.body.postId;
  let carrito = req.session.carrito || [];
  carrito = carrito.filter(id => id !== postId);
  req.session.carrito = carrito;
  res.redirect('/carrito');
});

//       COMPRA



//facturación
app.post('/facturacion', requireLogin, (req, res) => {
  let carrito = req.session.carrito || [];
  let carritoData = {};
  const sql = `SELECT idpost, name, imagen_principal, precio FROM posts WHERE idpost IN (${carrito.join(',')})`;
  if (carrito.length > 0) {
    db.query(sql, (error, results) => {
      if (error) {
        console.log(error)
      } else {
        results.forEach((post) => {
          carritoData[post.idpost] = {
            idpost: post.idpost,
            name: post.name,
            imagen_principal: post.imagen_principal,
            precio: post.precio
          }
        });
        res.render('facturacion.ejs', { username: req.session.username, carritoData: carritoData });
      }
    })
  } else {
      res.render('facturacion.ejs', { username: req.session.username, carritoData: carritoData });
  }
});

app.get('/descargar-factura/:carritoDataEncoded', (req, res) => {
  // Obtener los datos necesarios para generar la factura
  const carritoData = JSON.parse(decodeURIComponent(req.params.carritoDataEncoded));

  // Generar el documento PDF de la factura
  const doc = generarFacturaPDF(carritoData);

  // Establecer encabezado del PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="factura.pdf"');

  // Enviar el documento PDF al cliente
  doc.pipe(res);
  doc.end();
});

//Post facturacion pre pago confirmado
app.post('/procesar-pago', async (req, res) => {
  let dni = req.body.dni;
  let nombre = req.body.nombre;
  let apellido = req.body.apellidos;
  let direccion = req.body.direccion;
  let apartamento = req.body.apartamento == '' ? null : req.body.apartamento;
  let localidad = req.body.localidad;
  let provincia_id = req.body.provincia;
  let codigoPostal = req.body['codigo-postal'];
  let telefono = req.body.telefono;
  let total = req.body.total;
  let email = req.body.email;
  let metodoPago = req.body['metodo-pago'];
  let nombreTarjeta = req.body['nombre-tarjeta'];
  let tipoTarjeta_id = req.body['tarjetas-disponibles'];
  let dniTarjeta = req.body['dni-tarjeta'];
  let cuotas = req.body.cuotas;
  let numeroTarjeta = req.body['numero-tarjeta'];
  let fechaVencimiento = req.body['mm-aa'];
  let cvc = req.body.cvc;

  //Encriptacion siempre y cuando se pague con tarjeta
  if (metodoPago === 'tarjeta') {
    try {
      const hashedDireccion = await bcrypt.hash(direccion, 10);
      const hashedApartamento = apartamento ? await bcrypt.hash(apartamento, 10) : null;
      const hashedTelefono = await bcrypt.hash(telefono, 10);
      const hashedNombreTarjeta = await bcrypt.hash(nombreTarjeta, 10);
      const hashedDniTarjeta = await bcrypt.hash(dniTarjeta, 10);
      const hashedNumTarjeta = await bcrypt.hash(numeroTarjeta, 10);
      const hashedVencTarjeta = await bcrypt.hash(fechaVencimiento, 10);
      const hashedCvc = await bcrypt.hash(cvc, 10);
  
      // Aquí puedes hacer lo que necesites con las variables encriptadas
      // Por ejemplo, almacenarlas en la base de datos
      const query = `
       INSERT INTO Facturaciones (DNI, Nombre, Apellido, Email, Direccion, Apartamento, Codigo_postal,Localidad, Provincia_id, Telefono, TipoTarjeta_id, Nombre_tarjeta, dni_tarjeta, cuotas, num_tarjeta, Venc_tarjeta, CVC, Total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const values = [
          dni,
          nombre,
          apellido,
          email,
          hashedDireccion,
          hashedApartamento,
          codigoPostal,
          localidad,
          provincia_id,
          hashedTelefono,
          tipoTarjeta_id,
          hashedNombreTarjeta,
          hashedDniTarjeta,
          cuotas,
          hashedNumTarjeta,
          hashedVencTarjeta,
          hashedCvc,
          total];
      db.query(query, values, (error, results) => {
        if (error) {
          console.error('Error al ejecutar la consulta:', error);
          // Aquí puedes manejar el error de acuerdo a tus necesidades
          return;
        }
        registroId = results.insertId;
        console.log('Facturación registrada con éxito:', results);
        res.redirect('/confirmedbuy/' + registroId);
        });
    } catch (err) {
      console.error('Error al encriptar los datos de facturación:', err);
      res.status(500).send('Error al encriptar los datos de facturación');
    }
  } else {
    //Pago por transferencia
    const hashedDireccion = await bcrypt.hash(direccion, 10);
    const hashedApartamento = apartamento ? await bcrypt.hash(apartamento, 10) : null;
    const hashedTelefono = await bcrypt.hash(telefono, 10);
    const query = `
        INSERT INTO Facturaciones (DNI, Nombre, Apellido, Email, Direccion, Apartamento, Codigo_postal,Localidad, Provincia_id, Telefono, Total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
        dni,
        nombre,
        apellido,
        email,
        hashedDireccion,
        hashedApartamento,
        codigoPostal,
        localidad,
        provincia_id,
        hashedTelefono,
        total];
    db.query(query, values, (error, results) => {
      if (error) {
        console.error('Error al ejecutar la consulta:', error);
        // Aquí puedes manejar el error de acuerdo a tus necesidades
        return;
      }
      registroId = results.insertId;
      console.log('Facturación registrada con éxito:', results);
      res.redirect('/confirmedbuy/'+ registroId);
      });
  }
})

//Compra confirmada
app.get("/confirmedbuy/:registroId", requireLogin, (req, res) => {
  // Obtener los datos de la solicitud
  const carritoIds = req.session.carrito || [];
  const buyer = req.session.username;
  let buyer_id;
  const fechaCompra = obtenerFechaHoraActual();
  const numeroSeguimiento = generarNumeroSeguimiento();
  const facturacionId = req.params.registroId;
  const estadoId = 1;

  // Consultar la ID del comprador en la tabla accounts
  const sql = `
    SELECT id FROM accounts WHERE username = ?
  `;

db.query(sql, [buyer], (error, results) => {
  if (error) {
    console.error('Error al ejecutar la consulta:', error);
    return;
  }

  if (results.length === 0) {
    return;
  } 
  buyer_id = results[0].id;
  const query = `
    INSERT INTO Compras (post_id, buyer_id, estado_id, Facturacion_id, date_compra, Num_seguimiento)
    VALUES ?
  `;
  const values = carritoIds.map(postId => [postId, buyer_id, estadoId, facturacionId, fechaCompra, numeroSeguimiento]);

  db.query(query, [values], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error);
      // Manejar el error de acuerdo a tus necesidades
      return;
    }

  console.log('Datos de compra registrados con éxito:', results);
  // Redirigir o enviar una respuesta al cliente
  res.redirect('/purchasecomplete');
  });  
});
})

app.get("/bought", requireLogin, (req, res) => {
  const username = req.session.username;
  // Obtener la ID del usuario según su nombre de usuario
  const getUserIdQuery = "SELECT id FROM accounts WHERE username = ?";
  db.query(getUserIdQuery, [username], async (error, results) => {
    if (error) {
      console.error('Error al obtener la ID del usuario:', error);
      res.status(500).send('Error al obtener la ID del usuario');
      return;
    }
    const userId = results[0].id;
    // Obtener las compras y los datos de la compras del usuario según su ID
    const getComprasQuery = `
    SELECT c.id, c.post_id, e.estado,c.date_compra,c.num_seguimiento,p.name,p.imagen_principal,p.imagen2,p.imagen3,p.precio,p.descripcion, Talle.talle, marca.marca, Pais.pais, author_id, genero.genero, pie.pie
    FROM Compras AS c
    JOIN estados_compras AS e ON c.estado_id = e.id
    JOIN posts AS p ON c.post_id = p.idpost
    JOIN paises AS pais ON p.Pais_id = pais.id
    JOIN marcas AS marca ON p.marca_id = marca.id
    JOIN pies AS pie ON p.pie_id = pie.id
    JOIN talles AS talle ON p.talles_id = talle.id
    JOIN accounts as account ON p.author_id = account.id
    JOIN generos AS genero ON p.genero_id = genero.id
    WHERE c.buyer_id = ?`;
    db.query(getComprasQuery, [userId], async (error, compras) => {
      if (error) {
        console.error('Error al obtener las compras:', error);
        res.status(500).send('Error al obtener las compras');
        return;
      }
      // Renderizar la vista de "Mis compras" y pasar los datos de las compras y publicaciones
      res.render('mis_compras', {compras});
    });
  });
});

//AJUSTES DE CUENTA
app.get("/CheckUsername", requireLogin, (req, res) => {
  const sql = "SELECT Caducidad FROM logs_username WHERE User_id = (SELECT id FROM accounts WHERE username = ?) ORDER BY Caducidad DESC LIMIT 1"
  let fechaCaducidad;
  db.query(sql, [req.session.username], async(err, result)=> {
    if (err) {
      console.log("Error el obtener la caducidad")
    } if (result.length > 0) {
      fechaCaducidad = result[0].Caducidad
    } else {
      fechaCaducidad = null;
    }
  })
  db.query("SELECT NOW() AS CurrentTime", async (err, currentTimeResult) => {
    if (err) {
      console.log("Error al conseguir hora actual")
    } else {
      const horaActual = currentTimeResult[0].CurrentTime;
      if (fechaCaducidad != null) {
        if (horaActual < fechaCaducidad) {
          //Todavia faltan dias
          const diffDays = moment(fechaCaducidad).diff(moment(horaActual), "days")
          res.status(500).json({diffDays: diffDays});
        } else {
          res.status(200).json({status: 200})
        }
      } else {
        res.status(200).json({status: 200})
      }
    }
  })
})


app.post("/changeusername", requireLogin, (req, res) => {
  const {newUsername} = req.body;
  const sql1 = "INSERT INTO logs_username (User_id, Caducidad) SELECT id, date_add(current_date(), INTERVAL 14 DAY) FROM accounts WHERE username = ?;";
  db.query(sql1, req.session.username, async (err, result) => {
    if (err) {
      console.log(err)
      console.log("Error al registrar el cambio de usuario")
    }
  })
  const query = `UPDATE accounts SET username = "${newUsername}" WHERE username = "${req.session.username}"`;
  db.query(query, async (error, results) => {
    if (error) {
      // Error al ejecutar la consulta
      console.error('Error al actualizar el nombre de usuario:', error);
      res.status(500).json({ message: 'Error al actualizar el nombre de usuario' });
    } else {
      // Actualización exitosa
      req.session.username = newUsername;
      res.status(200).json({ message: 'Nombre de usuario actualizado exitosamente' });           
      }
  });
})

app.post("/GenerarToken", requireLogin, (req, res) => {
  const sql = "SELECT id, email FROM accounts WHERE username = ?"
  db.query(sql, [req.session.username], async (error, results) => {
    if(error) {
      console.log(error)
    }
    if (results.length > 0) {
      const user_id = results[0].id
      const email_user = results[0].email;
      const token = generarToken();
      // Obtener la fecha y hora actual
      const now = moment();
      // Obtener la fecha y hora de caducidad (5 minutos después)
      const expirationDate = now.add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');

      const sql = 'INSERT INTO tokens (user_id, token, fecha) VALUES (?, ?, ?)';
      db.query(sql, [user_id, token, expirationDate], (err, result) => {
        if (error) {
          console.error('Error al generar el token:', error);
          res.status(500).json({ error: 'Error al generar el token' });
        } else {
          // Enviar el token generado al cliente
          res.json({token, expirationDate});
          //Enviar correo con el token
          const mailOptions = {
            from: 'myfoot.site@gmail.com',
            to: email_user,
            subject: "Cambio de contraseña",
            html: correo.HTMLCorreoToken(token)
          };
  
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error al enviar el correo:', error);
              res.status(500).send('Error al enviar el correo');
            } else {
              console.log('Correo enviado:', info.response);
              res.send('¡Correo enviado correctamente!');
            }
          });
        }
      });
    } else {
      console.log("No se pudo obtener la id del usuario!")
    }
  })
})

app.post("/changepassword", requireLogin, async (req, res) => {
  const {password, repassword} = req.body;
  const username = req.session.username
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "UPDATE accounts SET password = ? WHERE username = ?;"
    db.query(sql, [hashedPassword, username], (err, result) => {
      if (err) {
        console.log(err)
        console.log("Error al actualizar la contraseña!")
        res.status(500).send("Hubo un error al actualizar la contraseña")
      } else {
        res.status(200).json({status: 200})
      }
    })
  } catch (err) {
    console.error('Error al hashear la contraseña:', err);
    res.status(500).send('Error al hashear la contraseña');
  }
});

// 1PASO Chequear que el email este asociado a una cuenta y mandar el correo
app.post("/check-reset-password", (req, res) => {
  const {email} = req.body;
  const sql = "SELECT id FROM accounts WHERE email = ?"
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.log("Error al buscar la cuenta con el correo")
      return
    }
    if (result.length > 0) {
      const user_id = result[0].id;
      const token = generarToken();
      // Obtener la fecha y hora actual
      const now = moment();
      // Obtener la fecha y hora de caducidad (5 minutos después)
      const expirationDate = now.add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');
      const sql = 'INSERT INTO tokens (user_id, token, fecha) VALUES (?, ?, ?)';
      db.query(sql, [user_id, token, expirationDate], async (err, result) => {
        if (err) {
          console.log("Error al guardar el token generado");
          return
        }
        const mailOptions = {
          from: 'myfoot.site@gmail.com',
          to: email,
          subject: "Restaurar Contraseña",
          html: correo.HTMLCorreoRestaurar(token)
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error al enviar el correo:', error);
            res.status(500).send('Error al enviar el correo');
          } else {
            console.log('Correo enviado:', info.response);
          }
        });
        res.redirect(`/check-token-password-view/${user_id}`)
      });
    } else {
      res.redirect("/check-token-password-view/0")
    }
   })
})


//2 Paso renderizar la view
app.get("/check-token-password-view/:id", checkServerRedirection, (req, res) => {
  res.render("forgotToken", {id: req.params.id})
})

// 3 Paso chequear token
app.post("/check-token-password/:id", (req, res) => {
  const user_id = req.params.id;
  const {token_input} = req.body;
  const sql = "SELECT token FROM tokens WHERE user_id = ? ORDER BY fecha DESC LIMIT 1;";
  db.query(sql, [user_id], async (err, result) => {
    if (err) {
      console.log(err)
      console.log("Error al buscar token para verificar")
      return
    }
    const tokenDB = result[0].token
    console.log(tokenDB)
    if (token_input == tokenDB) {
      res.redirect(`/change-restore-password/${user_id}`)
    } else {
      res.redirect(`/check-token-password-error/${user_id}`)
    }
  })
})

app.get("/check-token-password-error/:id", (req, res) => {
  res.render("forgotTokenError", {id: req.params.id})
})

app.get("/change-restore-password/:id", (req, res) => {
  res.render("forgotPassword", {id: req.params.id})
})

app.post("/restore-password/:id", checkServerRedirection, async (req, res) => {
  const {password, repassword} = req.body;
  const user_id = req.params.id;
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `UPDATE accounts SET password = ? WHERE id = ?`;
  db.query(query, [hashedPassword, user_id], (err, result)=> {
    if (err) {
      console.log(err);
      console.log("No se pudo guardar la contraseña nueva");
      return
    }
    res.redirect("/toLogin")
  })

})

//RUTA CONTACTO
app.post('/contacto', (req, res) => {
  const { name, email, subject, message } = req.body;

  const mailOptions = {
    from: 'myfoot.site@gmail.com',
    to: 'myfoot.site@gmail.com',
    subject: subject,
    html: correo.HTMLCorreo(name, email, subject, message)
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo:', error);
      res.status(500).send('Error al enviar el correo');
    } else {
      console.log('Correo enviado:', info.response);
      res.send('¡Correo enviado correctamente!');
    }
  });
});


//Funciones ADD-ONS
function requireLogin(req, res, next) {
  if (req.session.loggedin) {
    next();
  } else {
    res.redirect('/toLogin')
  }
}

function obtenerFechaHoraActual() {
  // Obtener la fecha y hora actual en formato DATETIME (YYYY-MM-DD HH:MM:SS)
  const fechaHora = new Date().toISOString().replace('T', ' ').split('.')[0];
  return fechaHora;
}

function generarNumeroSeguimiento() {
  // Generar un número de seguimiento aleatorio
  const numero = Math.floor(Math.random() * 1000000);
  return numero.toString().padStart(6, '0');
}

function generarFacturaPDF(carritoData) {
  const doc = new PDFDocument();

  doc.fontSize(20).text('Factura', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text('Productos:', { underline: true });
  doc.moveDown();

  for (const key in carritoData) {
    if (carritoData.hasOwnProperty(key)) {
      const producto = carritoData[key];
      const { name, precio } = producto;
      doc.fontSize(12).text(name + ': $' + precio);
    }
  }

  doc.moveDown();
  doc.fontSize(14).text(`Total: $${calcularPrecioTotal(carritoData)}`, { underline: true });

  return doc;
}

function calcularPrecioTotal(carritoData) {
  let total = 0;
  for (const key in carritoData) {
    if (carritoData.hasOwnProperty(key)) {
      const producto = carritoData[key]
      const { precio } = producto;
      total += precio;
    }
  } 
  return total
}

function generarToken() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = '0123456789';

  let token = '';
  for (let i = 0; i < 2; i++) {
    const letraAleatoria = letras.charAt(Math.floor(Math.random() * letras.length));
    token += letraAleatoria;
  }
  token += '-';

  for (let i = 0; i < 4; i++) {
    const numeroAleatorio = numeros.charAt(Math.floor(Math.random() * numeros.length));
    token += numeroAleatorio;
  }

  return token;
}


//CORREOS HTML

//checking user and email
app.post('/valid-user', (req, res) => {
  const { username } = req.body;
  const sql = 'SELECT * FROM accounts WHERE username = ?';
  db.query(sql, [username], (err, result) => {
    if (err) {
      console.error('Error al verificar usuario:', err);
      res.status(500).json({ error: 'Error al verificar usuario' });
    } else {
      if (result.length > 0) {
        res.status(200).json({ valid: false });
      } else {
        res.status(200).json({ valid: true });
      }
    }
  });
});

app.post('/valid-email', (req, res) => {
  const { email } = req.body;
  const sql = 'SELECT * FROM accounts WHERE email = ?';
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error('Error al verificar usuario:', err);
      res.status(500).json({ error: 'Error al verificar usuario' });
    } else {
      if (result.length > 0) {
        res.status(200).json({ valid: false });
      } else {
        res.status(200).json({ valid: true });
      }
    }
  });
});

// Manejo de página no encontrada (404)
app.use((req, res, next) => {
  res.status(404).render('404');
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos.');
});
// Iniciar el servidor
// Escucha en la dirección IP local y en localhost

// También puedes agregar una segunda instancia para localhost
app.listen(port, 'localhost', () => {
   console.log(`Servidor iniciado en http://localhost:${port}`);
});