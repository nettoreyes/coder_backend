class Producto {
    static _id = 1;
    constructor(title, price, thumbnail){
        this.title = title;
        this.price = price,
        this.thumbnail = thumbnail,
        this.id =  Producto._id++
    }
}