import express from 'express'
import { formularioLogin, formularioRegistro, formularioOlvidePassword, Registrar, Confirmar } from '../controllers/UsuarioController.js'

const router = express.Router()

// Routing
router.get('/login', formularioLogin)
router.get('/registro', formularioRegistro)
router.post('/registro', Registrar)
router.get('/olvide-password', formularioOlvidePassword)
router.get('/confirmar/:token', Confirmar)

export default router
