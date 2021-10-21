const { Router } = require("express");
const { restart } = require("nodemon");
const router = Router();
const Contenedor = require('../clases/contenedor.js');
const contenedor = new Contenedor('./productos.txt');


const serverRouter = (app) => {
    
    app.use("/api", router);       

    router.get("/productos", async (req, res, next) => {        
        let respuesta = await contenedor.getAll();   
        res.json(respuesta);        
     });

     router.get("/productos/:id", async (req, res, next) => {           
        let id = parseInt(req.params.id);    
        
        let respuesta = await contenedor.getById(id); 
        res.json(respuesta);        
             
     });

     router.post('/productos', async (req, res) => {         
        let producto = req.body;
        
        let productos = await contenedor.getAll();   

        let ultimoID = 0;        
        //busco el ultimo id
        ultimoID = Math.max(...productos.map((i) => i.id));
        //le agrego1
        ultimoID++; 

        //se lo asigno al nuevo producto
        producto.id = ultimoID;
        productos.push(producto);
        await contenedor.save(productos);

         res.json(producto);
     });

     router.put('/productos', async (req, res) => {         
        //capturo al producto
        let producto = req.body;        

        //rescato todos los productos
        let productos = await contenedor.getAll();   

        //quito el producto con el mismo id
        let productosEditados = productos.filter(prod => prod.id !== producto.id );

        //agrego el producto editado
        productosEditados.push(producto);
        
        //guardo el nuevo listado
        await contenedor.save(productosEditados);

         res.json(producto);
     });

     router.delete('/productos/:id', async (req, res) => {         
        //capturo el id
        let id = parseInt(req.params.id);        

        //rescato todos los productos
        let productos = await contenedor.getAll();   

        //quito el producto con el mismo id
        let productosFiltrado = productos.filter(prod => prod.id !== id );

        //guardo el nuevo listado
        await contenedor.save(productosFiltrado);

         res.json({"ok":"producto eliminado"});
     });

}

module.exports = serverRouter;