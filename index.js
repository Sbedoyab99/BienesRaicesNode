import express from 'express'
import usuarioRoutes from './routes/usuarioRoutes.js'
import db from './config/db.js'

// Crear App
const app = express()

// Conexion a la db
try {
  await db.authenticate()
  console.log('conectado a la db')
} catch (error) {
  console.log(error)
}

// Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')

// Carpeta Publica
app.use(express.static('public'))

// Routing
app.use('/auth', usuarioRoutes)

// Definir puerto y arrancar proyecto
const port = 3000
app.listen(port, () => {
  console.log(`El servidor se esta ejecutando en (http://localhost:${port})`)
})
