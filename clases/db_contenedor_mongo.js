const mongoose = require('mongoose');
const UsuarioSchema = require('../schema/usuarioSchema');

const guardaUsuario = async ( usuario ) => {
    try{
        const usuarioBD = new UsuarioSchema( usuario );
        await usuarioBD.save();            
        return { 'ok' : 'registro guardado' };            
    }catch( error ){     
        console.log( error );
        return { 'error' : 'error al guardar en mongo' }
    }
}

const buscaUsuario = async ( nombre ) => {
    try{
    let usuario = await UsuarioSchema.find({ nombre: nombre });            
        return usuario[0];
    }catch( error ){
        console.log( error );
        return null;
    }
}

module.exports = {
    guardaUsuario,
    buscaUsuario
}