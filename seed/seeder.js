import { exit } from 'node:process'
import db from '../config/db.js'
import categorias from './categorias.js'
import precios from './precios.js'
import Categoria from '../models/Categoria.js'
import Precio from '../models/Precio.js'

const importarDatos = async () => {
  try {
    await db.authenticate()
    await db.sync()
    await Promise.all([
      Categoria.bulkCreate(categorias),
      Precio.bulkCreate(precios)
    ]).then(console.log('Datos Importados Correctamente'))
    exit()
  } catch (error) {
    console.log(error)
    exit(1)
  }
}

if (process.argv[2] === '-i') {
  importarDatos()
}
