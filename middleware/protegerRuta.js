import jwt from 'jsonwebtoken'
import { Usuario } from '../models/index.js'

const protegerRuta = async (req, res, next) => {
  // Verificar si hay un token
  const { _token } = req.cookies
  // Si no hay un token:
  if (!_token) {
    return res.redirect('/auth/login')
  }
  // Comprobar el token
  try {
    // Verifico el token con la palabra secreta
    const decoded = jwt.verify(_token, process.env.JWT_SECRET)
    const usuario = await Usuario.scope('excludeAttr').findByPk(decoded.id)
    // Almacenar el usuario en el req
    if (usuario) {
      req.usuario = usuario
      // Entramos a la pagina
      return next()
    // Si no hay usuario:
    } else {
      // Redireccionamos
      return res.redirect('/auth/login')
    }
  } catch (error) {
    return res.clearCookie('_token').redirect('/auth/login')
  }
}

export default protegerRuta
