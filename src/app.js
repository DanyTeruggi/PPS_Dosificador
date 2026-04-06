const express = require('express');
const routes = require('./routes');
const app = express();


const bodyParser=require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('¡Bienvenido a mi API DOSIFICADOR!');  
});

module.exports = app;