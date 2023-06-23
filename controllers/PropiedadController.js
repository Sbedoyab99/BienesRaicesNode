import { validationResult, check } from 'express-validator'
import { Precio, Categoria, Propiedad } from '../models/index.js'

const admin = (req, res) => {
  res.render('propiedades/admin', {
    pagina: 'Mis Propiedades'
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
    precios,
    datos: []
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
      categorias,
      precios,
      errores: resultado.array(),
      datos: req.body
    })
  }
  // Crear una nueva propiedad
  const { titulo, descripcion, habitaciones, estacionamiento, baños, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body
  const { id: usuarioId } = req.usuario
  try {
    const propiedadGuardada = await Propiedad.create({
      titulo,
      descripcion,
      habitaciones,
      estacionamiento,
      baños,
      calle,
      lat,
      lng,
      precioId,
      categoriaId,
      usuarioId,
      imagen: ''
    })
    const { id } = propiedadGuardada
    res.redirect(`/propiedades/agregar-imagen/${id}`)
  } catch (error) {
    console.log(error)
  }
}

const agregarImagen = async (req, res) => {
  // Validar que la propiedad exista
  const { id } = req.params
  const propiedad = await Propiedad.findByPk(id)
  if (!propiedad) {
    return res.redirect('/mis-propiedades')
  }
  // Validar que no este publicada
  if (propiedad.publicado) {
    return res.redirect('/mis-propiedades')
  }
  // Validar que la propiedad pertenece al usuario que visita
  if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
    return res.redirect('/mis-propiedades')
  }

  res.render('propiedades/agregar-imagen', {
    pagina: `Agregar imagen: ${propiedad.titulo}`,
    csrfToken: req.csrfToken(),
    propiedad
  })
}

const almacenarImagen = async (req, res, next) => {
  // Validar que la propiedad exista
  const { id } = req.params
  const propiedad = await Propiedad.findByPk(id)
  console.log(req.params)
  if (!propiedad) {
    return res.redirect('/mis-propiedades')
  }
  // Validar que no este publicada
  if (propiedad.publicado) {
    return res.redirect('/mis-propiedades')
  }
  // Validar que la propiedad pertenece al usuario que visita
  if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
    return res.redirect('/mis-propiedades')
  }
  try {
    // Almacenar la imagen y publicar la propiedad
    propiedad.imagen = req.file.filename
    propiedad.publicado = 1
    await propiedad.save()
    next()
  } catch (error) {
    console.log(error)
  }
}

export {
  admin,
  crear,
  guardar,
  agregarImagen,
  almacenarImagen
}
