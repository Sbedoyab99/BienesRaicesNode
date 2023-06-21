import { check, validationResult } from 'express-validator'
import Usuario from '../models/Usuario.js'
import { generarId } from '../helpers/tokens.js'
import { emailRegistro } from '../helpers/email.js'

const formularioLogin = (req, res) => {
  res.render('auth/login', {
    pagina: 'Iniciar Sesión'
  })
}

const formularioRegistro = (req, res) => {
  console.log(req.csrfToken())
  res.render('auth/registro', {
    pagina: 'Crear Cuenta',
    csrfToken: req.csrfToken()
  })
}

const Registrar = async (req, res) => {
  const { nombre, email, password } = req.body
  // Validamos el fomrulario
  await check('nombre').notEmpty().withMessage('El Nombre es Obligatorio').run(req)
  await check('email').isEmail().withMessage('El formato de Email no es correcto').run(req)
  await check('password').isLength({ min: 8 }).withMessage('La Contraseña debe contener al menos 8 caracteres').run(req)
  await check('repetir_password').equals(req.body.password).withMessage('Las Contraseñas no coinciden. Intentalo de nuevo').run(req)
  const resultado = validationResult(req)
  // Si hay errores de validacion:
  if (!resultado.isEmpty()) {
    return res.render('auth/registro', {
      pagina: 'Crear Cuenta',
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      usuario: {
        nombre,
        email
      }
    })
  }
  // Verificar que el usuario no exista
  const existeUsuario = await Usuario.findOne({ where: { email } })
  // Si existe el usuario:
  if (existeUsuario) {
    return res.render('auth/registro', {
      pagina: 'Crear Cuenta',
      csrfToken: req.csrfToken(),
      errores: [{ msg: 'El Email ya esta en uso. Prueba con otro.' }],
      usuario: {
        nombre,
        email
      }
    })
  }
  // Almacenar el usuario
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId()
  })

  // Envia Email de confirmacion
  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token
  })

  // Mostrar mensaje de confirmacion
  res.render('templates/mensaje', {
    pagina: 'Cuenta Creada Correctamente',
    mensaje: 'Se ha enviado un Email de confirmacion a tu correo.'
  })
}

const formularioOlvidePassword = (req, res) => {
  res.render('auth/olvide-password', {
    pagina: 'Olvide mi Contraseña'
  })
}

const Confirmar = async (req, res) => {
  // Leo el token de la url
  const { token } = req.params
  // Verificar que el token sea valido
  const usuario = await Usuario.findOne({ where: { token } })
  // Si no hay un usuario:
  if (!usuario) {
    return res.render('auth/confirmar-cuenta', {
      pagina: 'Error al confirmar la cuenta',
      mensaje: 'Hubo un error al confirmar tu cuenta. Intentalo de nuevo.',
      error: true
    })
  }
  // Confirmar la cuenta
  usuario.token = null
  usuario.confirmado = true
  await usuario.save()
  return res.render('auth/confirmar-cuenta', {
    pagina: 'Cuenta Confirmada',
    mensaje: 'Tu Cuenta se ha Confirmado Correctamente.',
    error: false
  })
}

export {
  formularioLogin,
  formularioRegistro,
  formularioOlvidePassword,
  Registrar,
  Confirmar
}
