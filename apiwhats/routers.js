// Importando os módulos necessários
const express = require('express'); // Express é uma biblioteca para criar servidores HTTP
const router = express.Router(); // Router é uma função do Express para criar rotas

// Importando as funções dos controllers
const { 
    iniciarCliente, 
    obterStatusCliente, 
    listarContatos, 
    listarGrupos, 
    enviarMensagem,
    fecharCliente,
} = require('./controllers/clienteWhats');

// Definindo as rotas
router.get('/iniciarCliente', iniciarCliente);
router.get('/obterStatusCliente', obterStatusCliente);
router.get('/listarContatos', listarContatos);
router.get('/listarGrupos', listarGrupos);
router.get('/enviarMensagem', enviarMensagem);
router.get('/fecharCliente', fecharCliente);

// Exportando o roteador para que possa ser usado em outros arquivos
module.exports = router;
