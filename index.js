const express = require("express"); 
const app = express();
const cors = require("cors");
const Contenedor = require('./clases/contenedor');
const contenedor = new Contenedor('./productos.txt');
const PORT = 8080;


//**********ZONA  handlebars************/

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

//**********FIN ZONA  handlebars************/


app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended : true }));

app.get("/", async (req, res, next) => {
    let respuesta = await contenedor.getAll();     
    let hayProductos = respuesta ? true : false;
    res.render("formulario", { productos : respuesta , hayProductos: hayProductos});     
    // res.render("formulario");
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

     res.redirect('/');
});

app.get("/productos", async (req, res, next) => {        
    let respuesta = await contenedor.getAll();     
    let hayProductos = respuesta ? true : false;
    res.render("lista", { productos : respuesta , hayProductos: hayProductos});           
 });


app.listen(PORT, () => {
    console.log("Conectado al servidor, puerto ", PORT);
})







