const express = require("express"); 
const cors = require("cors");

const dotenv = require('dotenv');
dotenv.config();



const cluster = require('cluster');


const config = require('./config.js');
const parseArgs = require('minimist');

const cookieParser = require('cookie-parser');
const session = require('express-session');

const MongoStore = require('connect-mongo');
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }

const db_contenedor = require('./clases/db_contenedor');
const db_contenedor_mensajes = require('./clases/db_contenedorMensajes');
const db_contenedor_mongo = require('./clases/db_contenedor_mongo');

const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const { Server: IOServer, Socket } = require("socket.io");
const { Server: HttpServer } = require('http');

const DatabaseMongoDB = require('./clases/DatabaseMongoDB');
const conexionMongoDB = new DatabaseMongoDB();


//configuro los valores por defecto del puerto en caso que no lo envien
const options = { default: { PORT: 8080 } }
const args = parseArgs(process.argv.slice(2), options);

const { fork } = require('child_process');


console.log(args)

//para pasar el puerto 
// node index.js --PORT 8081
const PORT = args.PORT;
const MODO = args.MODO ? args.MODO : "FORK";




console.log(MODO)

conexionMongoDB.abrirConexionBD();


const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);


const handlebars = require("express-handlebars");
app.engine(
    'hbs',
    handlebars({
        extname: '.hbs',
        defaultLayout: 'index.hbs',
        layoutsDir: __dirname + "/views/handlebars/layouts"
    })
);

app.set("view engine", "hbs");
app.set("views", "./views/handlebars");
app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(express.static('./public'));
app.use(cookieParser());



app.use(session({
        store: MongoStore.create({            
            mongoUrl: process.env.DB_MONGO,
            mongoOptions: advancedOptions
        }),
        secret: 'secreto',
        resave: false,
        saveUninitialized: false
    }
))

// inicializamos passport
app.use(passport.initialize());
app.use(passport.session());



passport.use('login', new LocalStrategy({passReqToCallback: true}, async function (req, username, password, done) {    
    //busco al usuario por el nombre    
    let usuario = await db_contenedor_mongo.buscaUsuario(username);
    
        if (!usuario) {
            console.log('usuario no encontrado con el nombre:', username);
            return done(null, false, console.log('mensaje', 'usuario no encontrado'));
        } else {
            //comparto la contraseña con la registrada
            const claveOK = bcrypt.compareSync(password, usuario.clave);
            //if (!isValidPassword(usuario, password)) {
            if(!claveOK){
                console.log('contraseña invalida');
                return done(null, false, console.log('mensaje', 'contraseña invalida'));
            } else {
                return done(null, usuario);
            }
        }
    })
);

passport.use('signup', new LocalStrategy({passReqToCallback: true}, async function (req, username, password, done) {

    let usuario = await db_contenedor_mongo.buscaUsuario(username);

    if (usuario) {
        console.log('usuario ya existe');
        return done(null, false, console.log('mensaje', 'usuario ya existe'));
    } else {        

        let clave = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);

        
        
        const respuesta = await db_contenedor_mongo.guardaUsuario( { nombre: username, clave } );

        console.log( respuesta );


        let newUser = {
            id: 1,
            username,
            clave
        };

        return done(null, newUser);
    }
})
);

passport.serializeUser(function (user, done) {
    //console.log( user )
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {    
    //let user = usuarios.find(u => u.id == id);
    //let user = await db_contenedor_mongo.buscaUsuario(username);
    let user = 'Pruebas';
    return done(null, user);
});


io.on('connection',  async socket => {
    console.log("Conectados por socket");
    try{
        let productos_socket = await db_contenedor.listaProductos(); 
        socket.emit("productos_server", productos_socket);
    }catch(error){        
        if(error.code === 'ER_NO_SUCH_TABLE')
            await db_contenedor.creaTabla();
        
    }

    try{
        let listaMensajes = await db_contenedor_mensajes.listaMensajes(); 
        if(listaMensajes == false)
            listaMensajes = [];
        io.sockets.emit("chat_server", listaMensajes); 
    }catch(errorMensaje){        
        if(errorMensaje.code === 'SQLITE_ERROR'){
            await db_contenedor_mensajes.creaTabla();

            listaMensajes = [];
            io.sockets.emit("chat_server", listaMensajes); 
        }
    }
    
    socket.on("notificacion", data => {
        console.log("Respuesta ", data);
    })

    socket.on("input", async data => {
        listaMensajes = await db_contenedor_mensajes.listaMensajes(); 
        if(!listaMensajes)
            listaMensajes = [];

        listaMensajes.push(data);
        await db_contenedor_mensajes.guardaMensaje(listaMensajes);
        io.sockets.emit("chat_server", listaMensajes); //notifica a todos 
    })

    socket.on("productos_cliente", async data => {        
        productos_socket = await db_contenedor.listaProductos(); 
        io.sockets.emit("productos_server", productos_socket); 
    })

    
});

async function CargaProductos(){
    let productos_socket = await db_contenedor.listaProductos(); 
    io.sockets.emit("productos_server", productos_socket);
}

app.get("/", async (req, res, next) => {    
    
     const usuario = req.session.usuario;

    if(usuario){
        return res.render("formulario");
    }

    res.redirect('/login');   
});

app.get("/login", async (req, res, next) => {   
    if(req.session.usuario){        
        return res.render("formulario", {'usuario': req.session.usuario });
    }
    res.render("login");   
});

app.get("/registro", async (req, res, next) => {   
    if(req.session.usuario){        
        return res.render("formulario", {'usuario': req.session.usuario });
    }
    res.render("registro");   
});

app.post('/', async(req, res) => {    
    try{     
        let producto = req.body;           
        await db_contenedor.guardaProducto(producto);    
        CargaProductos();
        console.log("producto guardado")
        res.status(200).json({ ok : 'producto creado'  });
    }catch(error){
        res.status(400).json({ error : error.message  });
    }
     //res.redirect('/');
});


app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin' }), (req, res) => {
    //console.log('login', req.body);        
    //res.send(req.body);
    let { username } = req.body; 
    req.session.usuario = username; 
    return res.cookie('userApp', username, { maxAge: 600000 }).json({'usuario': req.session.usuario });
});


app.get('/faillogin', (req, res) => {
    res.status(400).send({ error: 'usuario o contraseña invalida' });
});


app.post('/registro', passport.authenticate('signup', { failureRedirect: '/failsignup' }), (req, res) => {
    // res.send(req.body);
    res.status(200).json({ok: 'usuario registrado existosamente'});
});

app.get('/failsignup', (req, res) => {    
    res.status(200).json({ ok : 'Usuario ya existe'  });
});


app.get("/logout", (req, res, next) => {    
    
    req.session.destroy( err => {
        if( !err ){
            return res.render("logout")
        }
        else{
            return res.send({ status: 'Logout Error', body: err });
        }
    })

});



//***EJEMPLO DE COOKIES */
app.get("/set", async (req, res, next) => {    
    res.cookie('server', 'express').send('Cookie Set');
});

app.get("/get", async (req, res, next) => {    
    res.send(req.cookies.server);
});

app.get("/clr", async (req, res, next) => {    
    res.clearCookie('server').send('Cookie clear')
});


//************DESAFIO OBJETO PROCESS  yservidor con balance de carga*/
app.get("/info", (req, res, next) => {   
    
    let numCpu =  require('os').cpus().length;   


    const objetoProcess = {
            'sistema operativo':process.platform,
            'version de node' :process.version,
            'uso de memoria' : process.memoryUsage(),
            'directorio actual del proceso' : process.cwd(),
            'id del proceso' : process.pid,
            'titulo del proceso' : process.title,            
            'Modo' : MODO,
            'Numero de CPUS' : numCpu
        };
    
    
    res.json(objetoProcess);
});

app.get("/randoms", (req, res, next) => {   

    const procesoFork = fork('./calculo.js');
    
    let cant = req.query.cant;
   
    if(cant === undefined)
        cant = 100000000;    
   
    procesoFork.on('message', msg => {
        //console.log('mensaje del hijo: ', msg);        
        res.json(msg);
    });

    //console.log('inicio padre: ');
    procesoFork.send(cant);
    
});

//************DESAFIO OBJETO PROCESS */



httpServer.listen(PORT, () => {
    console.log("Desafio Objeto Process");
    console.log("Conectado al servidor, puerto ", PORT);
})








