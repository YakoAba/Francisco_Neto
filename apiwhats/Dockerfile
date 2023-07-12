# Puxe a imagem base do Node
FROM node:20

# Criar diretório de trabalho no container
WORKDIR /app

# Atualizar os pacotes do sistema operacional
RUN apt-get update -y

# Instalar dependências necessárias para o Google Chrome e Puppeteer
RUN apt-get install -y  xorg  --no-install-recommends

# Adicionar a chave pública do Google para autenticação
RUN curl -sSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google.gpg

# Adicionar o repositório do Google Chrome ao APT
RUN echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Instalar o Google Chrome
RUN apt-get update && apt-get install -y \
  google-chrome-stable \
  --no-install-recommends

# Limpar o cache APT
RUN apt-get purge --auto-remove -y && rm -rf /var/lib/apt/lists/*

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências do projeto
#RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Expor a porta que o app usa
EXPOSE 3000

# Comando para iniciar o app
CMD ["node","app"]
