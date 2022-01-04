const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
    nombre: {type: String, require: true},
    clave: {type: String, require: true}
})

//crea modelo
const Usuario = mongoose.model('Usuarios', UsuarioSchema);

module.exports = Usuario;