// Importando os módulos necessários
const express = require("express"); // Express é uma biblioteca para criar servidores HTTP
const router = require("./routers"); // Importando as rotas definidas em api.js

// Configurando o servidor
const app = express(); // Cria um novo aplicativo Express
const porta = 4000; // Define a porta que o servidor irá escutar

// Definindo as rotas do servidor
app.use("/", router); // Configura o servidor para usar as rotas definidas em api.js

// Iniciando o servidor
app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});

