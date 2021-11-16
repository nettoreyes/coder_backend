const db = require('../clases/db_sqlite3');
const tabla = 'mensaje';


const guardaMensaje = ( mensaje ) => {
    return db(tabla).insert(mensaje);
}

const listaMensajes = () => {
    return db(tabla)    
    .select('usuario', 'texto', 'fecha');
}

const creaTabla = () => {
    return db.schema.createTable(tabla, table => {
        table.increments('id').primary()
        table.string('usuario', 250)
        table.string('texto')
        table.date('fecha')
    });
}

module.exports = {
    guardaMensaje,
    listaMensajes,
    creaTabla
}