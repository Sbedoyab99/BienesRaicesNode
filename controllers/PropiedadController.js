import { validationResult, check } from 'express-validator'
import Precio from '../models/Precio.js'
import Categoria from '../models/Categoria.js'

const admin = (req, res) => {
  res.render('propiedades/admin', {
    pagina: 'Mis Propiedades',
    barra: true
  })
}

const crear = async (req, res) => {
  // Consultar Modelo de Precio y Categoria
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll()
  ])

  res.render('propiedades/crear', {
    pagina: 'Crear Propiedad',
    csrfToken: req.csrfToken(),
    barra: true,
    categorias,
    precios
  })
}

const guardar = async (req, res) => {
  // Validar los campos
  await check('titulo').notEmpty().withMessage('El Titulo del Anuncio es Obligatorio.').run(req)
  await check('descripcion').notEmpty().withMessage('La Descripción del Anuncio es Obligatoria.').run(req)
  await check('categoria').isNumeric().withMessage('La Categoria del Anuncio es Obligatoria.').run(req)
  await check('precio').isNumeric().withMessage('El Rango de Precio del Anuncio es Obligatorio.').run(req)
  await check('habitaciones').isNumeric().withMessage('El Numero de Habitaciones del Anuncio es Obligatorio.').run(req)
  await check('estacionamiento').isNumeric().withMessage('El Numero de Estacionamientos del Anuncio es Obligatorio.').run(req)
  await check('baños').isNumeric().withMessage('El Numero de Baños del Anuncio es Obligatorio.').run(req)
  await check('calle').notEmpty().withMessage('Ubica la Propiedad en el Mapa.').run(req)
  const resultado = validationResult(req)
  // Si hay errores:
  if (!resultado.isEmpty()) {
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll()
    ])
    // Renderizo los errores
    return res.render('propiedades/crear', {
      pagina: 'Iniciar Sesión',
      csrfToken: req.csrfToken(),
      barra: true,
      categorias,
      precios,
      errores: resultado.array()
    })
  }
}


export {
  admin,
  crear,
  guardar
}
