import express from 'express'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import appRoutes from './routes/appRoutes.js'
import APIRoutes from './routes/APIRoutes.js'
import db from './config/db.js'

// Crear App
const app = express()

// Habilitar lectura de datos de formulario
app.use(express.urlencoded({ extended: true }))

// Habilitar Cookie Parser
app.use(cookieParser())

// Habilitar CSRF
app.use(csrf({ cookie: true }))

// Conexion a la db
try {
  await db.authenticate()
  db.sync()
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
app.use('/', propiedadesRoutes)
app.use('/', appRoutes)
app.use('/api', APIRoutes)

// Definir puerto y arrancar proyecto
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`El servidor se esta ejecutando en (http://localhost:${port})`)
})
