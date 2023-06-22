import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from '../models/Usuario.js'
import { generarId } from '../helpers/tokens.js'
import { emailRegistro, emailRecuperar } from '../helpers/email.js'

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
    pagina: 'Olvide mi Contraseña',
    csrfToken: req.csrfToken()
  })
}

const resetPassword = async (req, res) => {
  // Validamos el fomrulario
  await check('email').isEmail().withMessage('El formato de Email no es correcto').run(req)
  const resultado = validationResult(req)
  // Si hay errores de validacion:
  if (!resultado.isEmpty()) {
    return res.render('auth/olvide-password', {
      pagina: 'Recupera tu Acceso a BienesRaices',
      csrfToken: req.csrfToken(),
      errores: resultado.array()
    })
  }
  const { email } = req.body
  // Buscar el Usuario
  const usuario = await Usuario.findOne({ where: { email } })
  // Si el correo no pertenece a ningun Usuario:
  if (!usuario) {
    return res.render('auth/olvide-password', {
      pagina: 'Recupera tu Acceso a BienesRaices',
      csrfToken: req.csrfToken(),
      errores: [{ msg: 'El Email no se encuentra registrado.' }]
    })
  }
  // Si la cuenta no ha sido confirmada:
  if (!usuario.confirmado) {
    return res.render('auth/olvide-password', {
      pagina: 'Recupera tu Acceso a BienesRaices',
      csrfToken: req.csrfToken(),
      errores: [{ msg: 'Tu Cuenta no ha sido confirmada aún.' }]
    })
  }
  // Generar un token de recuperacion
  usuario.token = generarId()
  await usuario.save()
  // Enviar un Email para recuperar la cuenta
  emailRecuperar({
    email: usuario.email,
    nombre: usuario.nombre,
    token: usuario.token
  })
  // Renderizar menzaje de confirmacion
  res.render('templates/mensaje', {
    pagina: 'Recupera tu Acceso a BienesRaices',
    mensaje: 'Se ha enviado un Email con las instrucciones a tu correo.'
  })
}

const comprobarToken = async (req, res) => {
  // Leo el token de la url
  const { token } = req.params
  // Verificar que el token sea valido
  const usuario = await Usuario.findOne({ where: { token } })
  // Si no hay un usuario:
  if (!usuario) {
    return res.render('auth/confirmar-cuenta', {
      pagina: 'Error al recuperar tu contraseña',
      mensaje: 'Hubo un error al validar tu informacion. Intentalo de nuevo.',
      error: true
    })
  }
  res.render('auth/reset-password', {
    pagina: 'Reestablecer tu Contraseña',
    csrfToken: req.csrfToken()
  })
}

const nuevoPassword = async (req, res) => {
  await check('password').isLength({ min: 8 }).withMessage('La Contraseña debe contener al menos 8 caracteres').run(req)
  await check('password2').equals(req.body.password).withMessage('Las Contraseñas no coinciden. Intentalo de nuevo').run(req)
  const resultado = validationResult(req)
  // Si hay errores de validacion:
  if (!resultado.isEmpty()) {
    return res.render('auth/reset-password', {
      pagina: 'Reestablecer tu Contraseña',
      csrfToken: req.csrfToken(),
      errores: resultado.array()
    })
  }
  // Leo el token de la url
  const { token } = req.params
  const { password } = req.body
  // Recuperar el usuario con el token
  const usuario = await Usuario.findOne({ where: { token } })
  // Hashear el password
  const salt = await bcrypt.genSalt(10)
  usuario.password = await bcrypt.hash(password, salt)
  // Actualizar la base de datos
  usuario.token = null
  await usuario.save()
  res.render('auth/confirmar-cuenta', {
    pagina: 'Contraseña Reestablecida',
    mensaje: 'Tu Contraseña se ha reestablecido correctamente.',
    error: false
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
  Confirmar,
  resetPassword,
  nuevoPassword,
  comprobarToken
}
