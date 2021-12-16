const socket = io();
const mensajes = document.querySelector('#misMensajes');


//ingresar al chat
const ingresarChat = document.getElementById("btnIngresarChat");
ingresarChat.addEventListener("click", () => { 
    var element = document.getElementById("zonaChat");
    element.classList.remove("d-none");
    document.getElementById('id').readOnly = true;
    ingresarChat.classList.add("d-none");
});

//enviar mensaje
const input = document.getElementById("enviar_chat");
input.addEventListener("click", () => {   

    const email = document.getElementById("id").value;
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const edad = document.getElementById("edad").value;
    const alias = document.getElementById("alias").value;
    const avatar = document.getElementById("avatar").value;
    const text = document.getElementById("mensaje").value;
    // const fecha =  new Date().toLocaleString("es-CL");

    const item = {
        id: 0,
        author:{
            email,
            nombre,
            apellido,
            edad,
            alias,
            avatar
        },
        text
    };

    socket.emit("input", item);  
    document.getElementById("mensaje").value = '';  
});

//capturo el contenido del chat
socket.on("chat_server", data => {    
    mensajes.innerHTML = '';
    
    const authorSchema  = new normalizr.schema.Entity("author");
    const messageSchema = new normalizr.schema.Entity('post', {author: authorSchema});
    const chatSchema = new normalizr.schema.Entity('posts', { mensajes: [messageSchema] }); 
    const respuesta = normalizr.denormalize(data.result, chatSchema ,data.entities);

    // console.log(JSON.stringify(respuesta.mensajes, null, 3));
    const mensajeRespuesta = respuesta.mensajes;

    if(mensajeRespuesta){
        mensajeRespuesta.forEach(item => {
            mensajes.innerHTML  += `<li><span class="text-primary"> ${ item.author.nombre } </span>   <span class="text-success fst-italic text-capitalize">${ item.text }</span></li>`  
        });   
    }
        
});



