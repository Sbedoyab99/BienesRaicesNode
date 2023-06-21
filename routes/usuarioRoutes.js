import express from 'express'
import { formularioLogin, formularioRegistro } from '../controllers/UsuarioController.js'

const router = express.Router()

// Routing
router.get('/login', formularioLogin)
router.get('/registro', formularioRegistro)

export default router
