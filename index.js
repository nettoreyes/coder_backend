const express = require("express"); 
const cors = require("cors");
const faker = require('faker');
const { normalize, denormalize, schema } = require('normalizr');
faker.locale = "es_MX";

const db_contenedorArchivo = require('./clases/contenedor');
const contenedorArchivo = new  db_contenedorArchivo("mensajes.txt");


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
        let listaMensajes = await contenedorArchivo.getAll();  
        if(listaMensajes == false)
            listaMensajes = [];

        const mensajes = normalizaMensaje(listaMensajes)
        //const respuesta = desNormalizaMensaje(mensajes);

        io.sockets.emit("chat_server", mensajes); 
    }catch(errorMensaje){       
        console.log("error:", errorMensaje); 
        // if(errorMensaje.code === 'SQLITE_ERROR'){
        //     await db_contenedor_mensajes.creaTabla();

        //     listaMensajes = [];
        //     io.sockets.emit("chat_server", listaMensajes); 
        // }
    }
    
    socket.on("notificacion", data => {
        console.log("Respuesta ", data);
    })

    socket.on("input", async data => {
        listaMensajes = await contenedorArchivo.getAll();  
        if(!listaMensajes)
            listaMensajes = [];


        data.id = listaMensajes.length + 1;
        listaMensajes.push(data);

        await contenedorArchivo.save(listaMensajes);

        const mensajes = normalizaMensaje(listaMensajes)

        io.sockets.emit("chat_server", mensajes); //notifica a todos 
    })  

    
});

const normalizaMensaje = (mensajes) => {
    // defino el esquema de los autores
    const authorSchema  = new schema.Entity("author", {}, { idAttribute:"email" });

    const messageSchema = new schema.Entity('post', {author: authorSchema}, {idAttribute: 'id'});

    const chatSchema = new schema.Entity('posts', { mensajes: [messageSchema] }, {idAttribute: 'id'});

    const normalizedData = normalize({id: 'mismensajes', mensajes}, chatSchema);

    // console.log(JSON.stringify(normalizedData, null, 3));

    return normalizedData;
}

//prueba para desnormalizar
const desNormalizaMensaje = (mensajes) => {
    
    console.log("********************DESNORMALIZA*********************")

    const authorSchema  = new schema.Entity("author");
    const messageSchema = new schema.Entity('post', {author: authorSchema});
    const chatSchema = new schema.Entity('posts', { mensajes: [messageSchema] });   


    const desnormalizedData = denormalize(mensajes.result, chatSchema ,mensajes.entities);

    console.log(JSON.stringify(desnormalizedData, null, 3));

    return desnormalizedData;
}

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







