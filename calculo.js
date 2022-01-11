console.log('proceso hijo')

process.on('message', msg => {
    console.log('mensaje del padre: ', msg);
    let respuesta = calculo( msg );
    
    process.send( respuesta );
    process.exit();
})

const calculo = ( cantidad ) => {
    
    const respuesta = [];

    for (let index = 0; index < cantidad; index++) {               
        
        let numero =  Math.floor(Math.random() * 1000) + 1;        
        let existe = false;        
         
        //aca verifico si ya existe el numero , en caso de existir lo incremento su cantidad
        respuesta.forEach(valor => {
            if(valor.clave === numero){
                valor.cantidad++;
                existe = true;                
                return;
            }
        });
        
        
        if(!existe){
            const item = { clave: numero, cantidad: 1 };
            respuesta.push( item );
        }
    }   

    return respuesta;
      
}