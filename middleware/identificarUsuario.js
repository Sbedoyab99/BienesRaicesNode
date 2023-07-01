import Jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'

const identificarUsuario = async (req, res, next) => {
  // identifiacar si hay token
  const token = req.cookies._token
  if (!token) {
    req.usuario = null
    return next()
  }
  // Comprobar el token
  try {
    // Verifico el token con la palabra secreta
    const decoded = Jwt.verify(token, process.env.JWT_SECRET)
    const usuario = await Usuario.scope('excludeAttr').findByPk(decoded.id)
    // Almacenar el usuario en el req
    if (usuario) {
      req.usuario = usuario
      // Entramos a la pagina
      return next()
    } else {
      return res.clearCookie('_token').redirect('/auth/login')
    }
  // Si no hay usuario:
  } catch (error) {
    console.log(error)
    return res.clearCookie('_token').redirect('/auth/login')
  }
}

export default identificarUsuario
