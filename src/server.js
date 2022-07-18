require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const fileupload = require('express-fileupload');

const apiRouter = require('./routes/router');

// Criando o servidor
const server = express();
const PORT = process.env.PORT || 4000;


// Conectando ao banco de dados
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => {
      console.log(`Conectado ao banco de dados`);
      server.emit('dbConnected');
   })
   .catch(err => console.log("Erro: ", err));
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
   console.log(`Erro: ${err.message}`)
});

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(fileupload());

// vai armazenar os arquivos estáticos (css, js, imagens) na pasta public 
server.use(express.static(path.join(__dirname, '..', 'public')));

server.use(apiRouter);

server.on('dbConnected', () => {
   server.listen(process.env.PORT, () => {
      console.log(`Servidor rodando no http://localhost:${PORT}`);
   });
})

