import express from 'express'
import {
  formularioLogin, formularioRegistro, formularioOlvidePassword, Registrar, Confirmar,
  resetPassword, comprobarToken, nuevoPassword, Autenticar, logout
} from '../controllers/UsuarioController.js'

const router = express.Router()

// Routing
// Formulario de login
router.get('/login', formularioLogin)
router.post('/login', Autenticar)
// Formulario de registro
router.get('/registro', formularioRegistro)
router.post('/registro', Registrar)
// Formulario de recuperar password
router.get('/olvide-password', formularioOlvidePassword)
router.post('/olvide-password', resetPassword)
// Pagina de Verificacion de cuenta
router.get('/confirmar/:token', Confirmar)
// Formulario de Reestablecer password
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoPassword)
// Cerrar sesion
router.post('/cerrar-sesion', logout)
export default router
