import { exit } from 'node:process'
import db from '../config/db.js'
import categorias from './categorias.js'
import precios from './precios.js'
import { Categoria, Precio } from '../models/index.js'

const importarDatos = async () => {
  try {
    await db.authenticate()
    await db.sync()
    await Promise.all([
      Categoria.bulkCreate(categorias),
      Precio.bulkCreate(precios)
    ])
    console.log('Datos Importados Correctamente')
    exit()
  } catch (error) {
    console.log(error)
    exit(1)
  }
}

if (process.argv[2] === '-i') {
  importarDatos()
}

const eliminarDatos = async () => {
  try {
    await Promise.all([
      Categoria.destroy({ where: {}, truncate: true }),
      Precio.destroy({ where: {}, truncate: true })
      // await db.sync({ force: true }) **Usar cuando son muchas tablas
    ])
    console.log('Datos Eliminados Correctamente')
    exit()
  } catch (error) {
    console.log(error)
    exit(1)
  }
}

if (process.argv[2] === '-e') {
  eliminarDatos()
}
