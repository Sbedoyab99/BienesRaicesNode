import express from 'express'
import {
  formularioLogin, formularioRegistro, formularioOlvidePassword, Registrar, Confirmar,
  resetPassword, comprobarToken, nuevoPassword, Autenticar
} from '../controllers/UsuarioController.js'

const router = express.Router()

// Routing
router.get('/login', formularioLogin)
router.post('/login', Autenticar)
router.get('/registro', formularioRegistro)
router.post('/registro', Registrar)
router.get('/olvide-password', formularioOlvidePassword)
router.post('/olvide-password', resetPassword)
router.get('/confirmar/:token', Confirmar)
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoPassword)

export default router
