const express = require("express"); 
const cors = require("cors");
const Contenedor = require('./clases/contenedor');
const contenedor = new Contenedor('./productos.txt');
const contenedorChat = new Contenedor('./mensajes.txt');

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
    let productos_socket = await contenedor.getAll(); 
    socket.emit("productos_server", productos_socket);

    let listaMensajes = await contenedorChat.getAll(); 
    if(listaMensajes == false)
        listaMensajes = [];
    io.sockets.emit("chat_server", listaMensajes); 
    
    socket.on("notificacion", data => {
        console.log("Respuesta ", data);
    })

    socket.on("input", async data => {
        listaMensajes = await contenedorChat.getAll(); 
        if(!listaMensajes)
            listaMensajes = [];

        listaMensajes.push(data);
        await contenedorChat.save(listaMensajes);
        io.sockets.emit("chat_server", listaMensajes); //notifica a todos 
    })

    socket.on("productos_cliente", async data => {        
        productos_socket = await contenedor.getAll(); 
        io.sockets.emit("productos_server", productos_socket); 
    })

    
});

async function CargaProductos(){
    let productos_socket = await contenedor.getAll(); 
    io.sockets.emit("productos_server", productos_socket);
}

app.get("/", async (req, res, next) => {    
    res.render("formulario");   
});

app.post('/', async (req, res) => {         
    let producto = req.body;
    
    let productos = await contenedor.getAll(); 
    

    let ultimoID = 0;        
    if(productos){
        //busco el ultimo id
        ultimoID = Math.max(...productos.map((i) => i.id));
        //le agrego1
        ultimoID++; 
    }else{
        ultimoID=1;
        console.log(producto);
        productos = [];
    }

    //se lo asigno al nuevo producto
    producto.id = ultimoID;
    productos.push(producto);
    await contenedor.save(productos);

    CargaProductos();
    res.json(producto);
     //res.redirect('/');
});

httpServer.listen(PORT, () => {
    console.log("Conectado al servidor, puerto ", PORT);
})







