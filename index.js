let express = require("express");
const app = express();
let cors = require("cors");
const serverRoutes = require("./routes");
const path = require("path");
const PORT = 8080;

app.use("/view", express.static(path.join(__dirname, "public")));
app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended : true }));

//const contenedor = new Contenedor('productos.txt');

app.get("/", (req, res, next) => {
    res.send("Desafio API RESTful");
})

serverRoutes(app);

app.listen(PORT, () => {
    console.log("Conectado al servidor, puerto ", PORT);
})







