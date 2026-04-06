const app = require('./app');
const PORT = process.env.PORT || 3000;
console.log(`El puerto configurado es ${PORT}`);

app.listen(PORT, () => {
    console.log(`Servidor: http://localhost:${PORT}`);
});