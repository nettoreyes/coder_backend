const db = require('../clases/db_mysql');
const tabla = 'productos';


const guardaProducto = ( producto ) => {
    return db(tabla).insert(producto);
}

const listaProductos = ( id = {} ) => {
    return db(tabla)
    .where(id)
    .select('id', 'title', 'thumbnail', 'price');
}

const creaTabla = () => {
    return db.schema.createTable(tabla, table => {
        table.increments('id').primary()
        table.string('title', 250)
        table.string('thumbnail', 250)
        table.decimal('price', 19,4).defaultTo(0)        
    });
}

module.exports = {
    guardaProducto,
    listaProductos,
    creaTabla
}