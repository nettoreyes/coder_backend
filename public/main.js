const socket = io();
const mensajes = document.querySelector('#misMensajes');
const productosTabla = document.querySelector('#tablaProductos');
const lblUsuario = document.querySelector('#lblusuario');
const lblUsuarioLogout = document.querySelector('#lblUsuarioLogout');



let cookieUsuario = document.cookie.replace(/(?:(?:^|.*;\s*)userApp\s*\=\s*([^;]*).*$)|^.*$/, "$1"); //para obtener solo la cookie userApp
cookieUsuario = cookieUsuario.replaceAll('%20', ' '); // para quitar caracteres %20 por espacio


if( lblUsuario  ){        
    lblUsuario.innerHTML = `Bienvenido ${ cookieUsuario }`;    
}

if( lblUsuarioLogout ){
    lblUsuarioLogout.innerHTML = `Hasta luego ${ cookieUsuario }`;    
}


//ingresar al chat
const ingresarChat = document.getElementById("btnIngresarChat");
if(ingresarChat){
    ingresarChat.addEventListener("click", () => { 
        var element = document.getElementById("zonaChat");
        element.classList.remove("d-none");
        document.getElementById('email').readOnly = true;
        ingresarChat.classList.add("d-none");
    });
}

//enviar mensaje
const input = document.getElementById("enviar_chat");
if(input){
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
}

//capturo el contenido del chat
socket.on("chat_server", data => {    
    if(mensajes){
        mensajes.innerHTML = '';
        if(data){
            data.forEach(item => {
                mensajes.innerHTML  += `<li><span class="text-primary"> ${ item.usuario } </span> <span class="text-muted fw-lighter">${ item.fecha }</span>  <span class="text-success fst-italic text-capitalize">${ item.texto }</span></li>`  
            });   
        }
    }
        
});

//guardo productos
const creaProducto = document.getElementById("btnGuardaProducto");
if(creaProducto){
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
}





//cargo productos
socket.on("productos_server", data => {    
    if(productosTabla){
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
    }

    
    // console.table(data);
});


const botonLogin = document.getElementById("btnLogin");
if(botonLogin){
    botonLogin.addEventListener("click", () => {

        const usuario = document.querySelector('#txtUsuario').value;
        const password = document.querySelector('#txtPassword').value;

        document.querySelector('#alerta').innerHTML = ``; //limpio la alerta
        
        const loginUsuario = {
            usuario,
            password
        };    

        fetch('/login',
        {   
            headers:{'content-type' : 'application/json'},
            method: 'POST',
            body : JSON.stringify(loginUsuario)
        }).then(resp => resp.json())
        .then( data => {  
            console.log( data );          
            if(data.usuario){             
                //document.cookie = "usuario: " + data.usuario;   

                window.location.href="http://localhost:8081/";                                
            }
            if(data.error)
                document.querySelector('#alerta').innerHTML = data.error;
            

        }).catch( console.warn );

    });
}

const botonRegistro = document.getElementById("btnRegistro");
if(botonRegistro){
    botonRegistro.addEventListener("click", () => {

        const usuario = document.querySelector('#txtUsuarioRegistro').value;
        const password = document.querySelector('#txtPasswordRegistro').value;
        document.querySelector('#alertaRegistro').innerHTML = ``; //limpio la alerta
        
        const loginUsuario = {
            usuario,
            password
        };    

        fetch('/registro',
        {   
            headers:{'content-type' : 'application/json'},
            method: 'POST',
            body : JSON.stringify(loginUsuario)
        }).then(resp => resp.json())
        .then( data => {            
            if(data.ok){             
                //document.cookie = "usuario: " + data.usuario;   
                document.querySelector('#alertaRegistro').innerHTML = data.ok;
                //window.location.href="http://localhost:8081/";                                
            }

        }).catch( console.warn );

    });
}




// const botonLogout = document.getElementById("btnLogout");

// if(botonLogout){
//     console.log('paso por aqui');
//     botonLogout.addEventListener("click", () => {        
//         fetch('/logout')
//         .then(resp => resp.json())
//         .then( data => {            
//             console.log( data );
//             window.location.href="http://localhost:8081/logout";   

//         }).catch( console.warn );

//     });
// }




