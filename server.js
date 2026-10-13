// Punto de entrada y composition root. Es el ÚNICO archivo que conoce las
// implementaciones concretas (db.js y los repositorios) y las conecta:
//   pool -> repositorios -> citaService -> rutas
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');

const pool = require('./src/persistencia/db');
const { crearCitaRepository } = require('./src/persistencia/citaRepository');
const { crearProfesionalRepository } = require('./src/persistencia/profesionalRepository');
const { crearCitaService } = require('./src/aplicacion/citaService');
const { crearCitasRoutes } = require('./src/presentacion/citasRoutes');

// Ensamblaje de dependencias
const citaRepository = crearCitaRepository({ pool });
const profesionalRepository = crearProfesionalRepository({ pool });
const citaService = crearCitaService({ citaRepository, profesionalRepository });

const app = express();
app.disable('x-powered-by');
app.set('json spaces', 0);
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', crearCitasRoutes({ citaService }));

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`Cliente web: http://localhost:${PORT}`);
  });
}

module.exports = app;