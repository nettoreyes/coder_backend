const fs = require('fs'); 

let express = require("express");
const app = express();
const PORT = 8080;


class Contenedor {
    
    constructor (nombreArchivo){
        this.nombreArchivo=nombreArchivo;        
    }

    async save(producto){
        try{            
            let productoString = JSON.stringify(producto);
            await fs.promises.writeFile(`./${this.nombreArchivo}`, productoString, 'utf-8');
            console.log('************Producto Guardado***************');
        }
        catch(err){
            console.log('**********Error al guardar producto: ', err );
        }
    }

    async getById(id){       
        try{
            const contenido = await fs.promises.readFile(`./${this.nombreArchivo}`, 'utf-8');
            let productos = JSON.parse(contenido);
            let producto = productos.filter(x => x.id === id);
            return producto ;
        }
        catch(err){
            console.log('Error al leer archivo productos: ', err );
        }    
    }

    async getAll(){
        try{
            const contenido = await fs.promises.readFile(`./${this.nombreArchivo}`, 'utf-8');
            return JSON.parse(contenido);           
        }
        catch(err){
            console.log('Error al leer archivo productos: ', err );
        }    
    }

    async deleteById(id){
        const contenido = await this.getAll();
        let productos = contenido.filter(x => x.id !== id);
        await this.save(productos);
    }

    async deleteAll(){
        try{                       
            //await fs.promises.unlink(`./${this.nombreArchivo}`); //elimina el archivo completo
            await fs.promises.writeFile(`./${this.nombreArchivo}`, '', 'utf-8'); //solo elimino los productos
            console.log('************Producto Eliminado***************');
        }
        catch(err){
            console.log('**********Error al eliminar producto: ', err );
        }
    }
}

class Producto {
    static _id = 1;
    constructor(title, price, thumbnail){
        this.title = title;
        this.price = price,
        this.thumbnail = thumbnail,
        this.id =  Producto._id++
    }
}


const contenedor = new Contenedor('productos.txt');

let pruebaGetAll  = async () => {     
    return await contenedor.getAll();
}

let pruebaGetById  = async (id) => {     
    return await contenedor.getById(id);
}


app.get("/", (req, res, next) => {
    res.send("Desafio Servidor con Express");
})

app.get("/productos", async (req, res, next) => {
    let respuesta = await pruebaGetAll();    
    res.send(respuesta);
})

app.get("/productosRandom", async (req, res, next) => {
    
    //selecciono una id random entre 0 al 3
    let idRandom = Math.floor(Math.random() * 4);

    //si la id es 0 la dejo en 1
    if(idRandom === 0)
        idRandom = 1;

    let respuesta = await pruebaGetById(idRandom); 
    res.send(respuesta);
})

app.listen(PORT, () => {
    console.log("Conectado al servidor, puerto ", PORT);
})







