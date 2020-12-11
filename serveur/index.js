const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const { ExpressPeerServer } = require('peer');

const port = process.env.PORT || '3000';

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/mypeer',
  proxied: true,
});

app.use(peerServer);

const DIST_DIR = path.join(__dirname, '../dist');
app.use(express.static(DIST_DIR));

app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/index.html`);
});

server.listen(port);
console.log(`Listening on: ${port}`);

peerServer.on('connection', (client) => {
  console.log(`connexion de ${client.id}!`);
});

peerServer.on('disconnect', (client) => {
  console.log(`deconnexion de ${client.id}`);
});
