import bcrypt from 'bcrypt'


const usuarios = [
  {
    nombre: 'Santigo',
    email: 'santiagobedoya@live.com',
    confirmado: 1,
    password: bcrypt.hashSync('santy2002', 10)
  },
  {
    nombre: 'Prueba',
    email: 'correo@correo.com',
    confirmado: 0,
    password: bcrypt.hashSync('santy2002', 10)
  }
]

export default usuarios
