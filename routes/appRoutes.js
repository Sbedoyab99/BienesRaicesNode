import express from 'express'
import { inicio, categoria, noEncontrado, buscador } from '../controllers/AppController.js'

const router = express.Router()

// Pagina de inicio
router.get('/', inicio)
// Categorias
router.get('/categorias/:id', categoria)
// Pagina 404
router.get('/404', noEncontrado)
// Buscador
router.post('/buscador', buscador)
router.get('/buscador', inicio)

export default router
