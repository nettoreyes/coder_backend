const express = require("express"); 
const cors = require("cors");

const dotenv = require('dotenv');
dotenv.config();

const cookieParser = require('cookie-parser');
const session = require('express-session');

const MongoStore = require('connect-mongo');
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }

const db_contenedor = require('./clases/db_contenedor');
const db_contenedor_mensajes = require('./clases/db_contenedorMensajes');

const { Server: IOServer, Socket } = require("socket.io");
const { Server: HttpServer } = require('http');

const PORT = 8081;





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

app.post('/login', async(req, res) => {    
    try{    

        let { usuario } = req.body;    

        if(usuario){
            req.session.usuario = usuario;                
            return res.cookie('userApp', usuario, { maxAge: 600000 }).json({'usuario': req.session.usuario });
        }
        
    }catch(error){
        res.status(400).json({ error : error.message  });
    }
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

httpServer.listen(PORT, () => {
    console.log("Desafio LogIn");
    console.log("Conectado al servidor, puerto ", PORT);
})







