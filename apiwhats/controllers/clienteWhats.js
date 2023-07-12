const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// Clientes ativos
const clientes = {};

// Função para iniciar um cliente
exports.iniciarCliente = (req, res) => {
  const idCliente = req.query.idCliente;

  // Se já existe um cliente ativo com o ID solicitado, retornamos um erro
  if (clientes[idCliente]) {
    return res
      .status(400)
      .json({ erro: `Cliente com id ${idCliente} já está ativo` });
  }

  // Criamos uma nova instância do cliente
  const cliente = new Client({
    authStrategy: new LocalAuth({
      clientId: idCliente,
    }),
    // proxyAuthentication: { username: 'username', password: 'password' },
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions'],
      headless: false,

    },
  });

  // Armazenamos o cliente na memória
  clientes[idCliente] = cliente;

  // Conectamos o cliente
  cliente
    .initialize()
    .then(() => {
      res.json({ sucesso: true });
    })
    .catch((erro) => {
      // Se houver um erro ao inicializar o cliente, registramos o erro e retornamos um erro 500
      console.log(erro);
      res.status(500).json({ erro: "Erro ao iniciar o cliente" });
    });

  cliente.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });
  cliente.on("authenticated", () => {
    console.log("AUTHENTICATED");
  });

  cliente.on("auth_failure", (msg) => {
    // Fired if session restore was unsuccessful
    console.error("AUTHENTICATION FAILURE", msg);
  });

  cliente.on("ready", () => {
    console.log("READY");
  });

  cliente.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});
};

// Função para fechar um cliente
exports.fecharCliente = (req, res) => {
  const idCliente = req.query.idCliente;
  const cliente = clientes[idCliente];

  // Verificamos se o cliente existe
  if (!cliente) {
    // Se o cliente não existir, retornamos um erro
    return res.status(400).json({
      erro: `Cliente com id ${idCliente} não está ativo`,
    });
  }

  // Desconectamos o cliente e removemos da memória
  cliente.destroy();
  delete clientes[idCliente];

  res.json({ sucesso: true });
};

// Função para obter o status da conexão de um cliente
exports.obterStatusCliente = (req, res) => {
  const idCliente = req.query.idCliente;
  const cliente = clientes[idCliente];

  // Verificamos se o cliente existe
  if (!cliente) {
    // Se o cliente não existir, retornamos um erro
    return res.status(400).json({
      erro: `Cliente com id ${idCliente} não está ativo`,
    });
  }

  // Verificamos o estado de conexão do cliente
  const status = cliente.state;

  res.json({ idCliente, status });
};

// Função para listar todos os contatos
exports.listarContatos = (req, res) => {
  const idCliente = req.query.idCliente;
  const cliente = clientes[idCliente];

  // Verificamos se o cliente existe
  if (!cliente) {
    // Se o cliente não existir, retornamos um erro
    return res.status(400).json({
      erro: `Cliente com id ${idCliente} não está ativo`,
    });
  }

  cliente
    .getContacts()
    .then((contatos) => {
      // Se conseguirmos obter os contatos, simplificamos a lista de contatos e retornamos
      const contatosSimplificados = contatos.map((contato) => {
        return {
          nome: contato.name,
          id: contato.id._serialized,
        };
      });
      res.json(contatosSimplificados);
    })
    .catch((erro) => {
      // Se houver um erro, registramos o erro e retornamos um erro 500
      console.error("Erro ao buscar contatos:", erro);
      res.status(500).json({ erro: "Erro ao buscar contatos" });
    });
};

// Função para listar todos os grupos
exports.listarGrupos = (req, res) => {
  const idCliente = req.query.idCliente;
  const cliente = clientes[idCliente];

  // Verificamos se o cliente existe
  if (!cliente) {
    // Se o cliente não existir, retornamos um erro
    return res.status(400).json({
      erro: `Cliente com id ${idCliente} não está ativo`,
    });
  }

  cliente
    .getChats()
    .then((chats) => {
      // Filtramos apenas os grupos
      const grupos = chats.filter((chat) => chat.isGroup);

      // Simplificamos a lista de grupos e retornamos
      const gruposSimplificados = grupos.map((grupo) => {
        return {
          nome: grupo.name,
          id: grupo.id._serialized,
        };
      });

      res.json(gruposSimplificados);
    })
    .catch((erro) => {
      // Se houver um erro, registramos o erro e retornamos um erro 500
      console.error("Erro ao buscar grupos:", erro);
      res.status(500).json({ erro: "Erro ao buscar grupos" });
    });
};

// Função para enviar uma mensagem
exports.enviarMensagem = (req, res) => {
  const idCliente = req.query.idCliente;
  const cliente = clientes[idCliente];

  // Verificamos se o cliente existe
  if (!cliente) {
    // Se o cliente não existir, retornamos um erro
    return res.status(400).json({
      erro: `Cliente com id ${idCliente} não está ativo`,
    });
  }

  const numero = req.query.numero;
  const mensagem = req.query.mensagem;

  // Verificamos se o número de caracteres do número é menor que 15
  // Se for menor, tratamos como um número de telefone
  // Se for maior, tratamos como um ID de grupo
  if (numero.length < 15) {
    cliente
      .sendMessage(numero + "@c.us", mensagem)
      .then(() => {
        // Se a mensagem for enviada com sucesso, retornamos sucesso: true
        res.json({ sucesso: true });
      })
      .catch((erro) => {
        // Se houver um erro, registramos o erro e retornamos um erro 500
        console.error("Erro ao enviar mensagem:", erro);
        res.status(500).json({ erro: "Erro ao enviar mensagem" });
      });
  } else {
    cliente
      .sendMessage(numero + "@g.us", mensagem)
      .then(() => {
        // Se a mensagem for enviada com sucesso, retornamos sucesso: true
        res.json({ sucesso: true });
      })
      .catch((erro) => {
        // Se houver um erro, registramos o erro e retornamos um erro 500
        console.error("Erro ao enviar mensagem:", erro);
        res.status(500).json({ erro: "Erro ao enviar mensagem" });
      });
  }
};

// Função para fechar todos os clientes
process.on("SIGINT", async () => {
  console.log("Desligando...");
  for (let idCliente in clientes) {
    const cliente = clientes[idCliente];
    if (cliente) {
     await cliente.destroy().then(() => {
        delete clientes[idCliente];
        console.log(`Cliente ${idCliente} fechado.`);
      });
    }
  }
  process.exit(0);
});
