const fs = require('fs'); 

module.exports = class Contenedor {
    
    constructor (nombreArchivo){
        this.nombreArchivo=nombreArchivo;        
    }

    async save(producto){
        try{            
            let productoString = JSON.stringify(producto);
            await fs.promises.writeFile(`./${this.nombreArchivo}`, productoString, 'utf-8');
            console.log('************ Guardado***************');
        }
        catch(err){
            console.log('**********Error al guardar : ', err );
        }
    }

    async getById(id){       
        try{              
            const contenido = await fs.promises.readFile(`./${this.nombreArchivo}`, 'utf-8');
            let productos = JSON.parse(contenido);                      
            let producto = productos.filter(x => x.id === id);      
            const valor = Object.keys(producto);        
            if(valor[0] == 0)
                return producto;
            else
                return { 'error': 'producto no entontrado'};
        }
        catch(err){
            console.log('Error al leer archivo productos: ', err );
        }    
    }

    async getAll(){
        try{
            const contenido = await fs.promises.readFile(`./${this.nombreArchivo}`, 'utf-8');
            if(contenido)
                return JSON.parse(contenido);    
            else
                return null;       
        }
        catch(err){
            console.log('Error al leer archivo : ', err ); 
            return null;                            
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

