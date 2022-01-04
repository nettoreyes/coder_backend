const mongoose = require('mongoose');
require("dotenv").config();

module.exports = class DatabaseMongoDB {

    async abrirConexionBD (){
         try{
             
            const URL = process.env.DB_MONGO;
 
             let rta = await mongoose.connect(URL, {
                 useNewUrlParser: true,
                 useUnifiedTopology: true
             });
             console.log("Conectado a MongoDB");
 
         }catch( error ){
             console.log("Error conectar a MongoDB: ", error);
         }
     }
 };