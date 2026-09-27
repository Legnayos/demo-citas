// Punto de entrada. La lógica vive en src/, una carpeta por capa;
// aquí solo se configura Express y se conecta la capa de presentación.
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const citasRoutes = require('./src/presentacion/citasRoutes');

const app = express();
app.disable('x-powered-by');
app.set('json spaces', 0);
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', citasRoutes);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`Cliente web: http://localhost:${PORT}`);
  });
}

module.exports = app;
