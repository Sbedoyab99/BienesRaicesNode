import express from 'express'
import usuarioRoutes from './routes/usuarioRoutes.js'

// Crear App
const app = express()

// Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')

// Routing
app.use('/auth', usuarioRoutes)

// Definir puerto y arrancar proyecto
const port = 3000
app.listen(port, () => {
  console.log(`El servidor se esta ejecutando en (http://localhost:${port})`)
})
