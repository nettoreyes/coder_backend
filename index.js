const express = require("express"); 
const cors = require("cors");
const faker = require('faker');
faker.locale = "es_MX";

const db_contenedor = require('./clases/db_contenedor');
const db_contenedor_mensajes = require('./clases/db_contenedorMensajes');

const { Server: IOServer, Socket } = require("socket.io");
const { Server: HttpServer } = require('http');

const PORT = 8080;

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

io.on('connection',  async socket => {
    console.log("Conectados por socket");
    try{
        let productos_socket = await db_contenedor.listaProductos(); 
        socket.emit("productos_server", productos_socket);
    }catch(error){
        //console.log("error ", error.code);
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
    res.render("formulario");   
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

app.get("/api/productos-test", async (req, res, next) => { 
    let productos = [{
        id: 1,
        title: faker.commerce.product,
        price: faker.commerce.price,
        thumbnail: faker.image.image
    },
    {
        id: 2,
        title: faker.commerce.product,
        price: faker.commerce.price,
        thumbnail: faker.image.fashion
    },
    {
        id: 3,
        title: faker.commerce.product,
        price: faker.commerce.price,
        thumbnail: faker.image.cats
    },
    {
        id: 4,
        title: faker.commerce.product,
        price: faker.commerce.price,
        thumbnail: faker.image.food
    },
    {
        id: 5,
        title: faker.commerce.product,
        price: faker.commerce.price,
        thumbnail: faker.image.animals
    }];
    res.render("lista", {hayProductos: true, productos: productos});      
 });


httpServer.listen(PORT, () => {
    console.log("Conectado al servidor, puerto ", PORT);
})







