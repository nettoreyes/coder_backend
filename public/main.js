const socket = io();
const mensajes = document.querySelector('#misMensajes');
const productosTabla = document.querySelector('#tablaProductos');


//ingresar al chat
const ingresarChat = document.getElementById("btnIngresarChat");
ingresarChat.addEventListener("click", () => { 
    var element = document.getElementById("zonaChat");
    element.classList.remove("d-none");
    document.getElementById('email').readOnly = true;
    ingresarChat.classList.add("d-none");
});

//enviar mensaje
const input = document.getElementById("enviar_chat");
input.addEventListener("click", () => { 
    const usuario = document.getElementById("email").value;
    const texto =  document.getElementById("mensaje").value;          
    const fecha =  new Date().toLocaleString("es-CL");
    const item = {
        usuario,
        texto,
        fecha
    }
    socket.emit("input", item);  
    document.getElementById("mensaje").value = '';  
});

//capturo el contenido del chat
socket.on("chat_server", data => {    
    mensajes.innerHTML = '';
    if(data){
        data.forEach(item => {
            mensajes.innerHTML  += `<li><span class="text-primary"> ${ item.usuario } </span> <span class="text-muted fw-lighter">${ item.fecha }</span>  <span class="text-success fst-italic text-capitalize">${ item.texto }</span></li>`  
        });   
    }
        
});

//guardo productos
const creaProducto = document.getElementById("btnGuardaProducto");
creaProducto.addEventListener("click", () => {

    const title = document.querySelector('#title').value;
    const price = document.querySelector('#price').value;
    const thumbnail = document.querySelector('#thumbnail').value;

    const nuevoProducto = {
        title,
        price,
        thumbnail
    };    

    fetch('/',
    {   
        headers:{'content-type' : 'application/json'},
        method: 'POST',
        body : JSON.stringify(nuevoProducto)
    }).then(resp => resp.json())
    .then( data => {
        console.log(data)
        document.querySelector('#title').value = '';
        document.querySelector('#price').value = '';
        document.querySelector('#thumbnail').value = '';
    }).catch( console.warn );

});



//cargo productos
socket.on("productos_server", data => {    
    productosTabla.innerHTML = ``;

    if(data){
        data.forEach(element => {
            productosTabla.innerHTML += `<tr>
                <th scope="row">${ element.id }</th>
                <td>${ element.title }</td>
                <td>${ element.price }</td>
                <td><img src="${ element.thumbnail }" class="img-thumbnail" width="100" height="50"></td>
            </tr>`
        });
    }
    else{
        productosTabla.innerHTML += `<tr>
                <th class="text-center text-danger" colspan="4">No hay Productos!!!</th>                
            </tr>`
    }

    
    // console.table(data);
});



