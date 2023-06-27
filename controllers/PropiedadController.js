import { unlink } from 'node:fs/promises'
import { validationResult, check } from 'express-validator'
import { Precio, Categoria, Propiedad } from '../models/index.js'

const admin = async (req, res) => {
  const { pagina: paginaActual } = req.query
  const expresion = /^[1-9]$/
  if (!expresion.test(paginaActual)) {
    res.redirect('/mis-propiedades?pagina=1')
  }
  try {
    const { id } = req.usuario
    const limit = 3
    const offset = ((paginaActual * limit) - limit)
    const [propiedades, total] = await Promise.all([
      Propiedad.findAll({
        limit,
        offset,
        where: {
          usuarioId: id
        },
        include: [
          { model: Categoria, as: 'categoria' },
          { model: Precio, as: 'precio' }
        ]
      }),
      Propiedad.count({
        where: { usuarioId: id }
      })
    ])

    res.render('propiedades/admin', {
      pagina: 'Mis Propiedades',
      csrfToken: req.csrfToken(),
      propiedades,
      paginas: Math.ceil(total / limit),
      paginaActual: Number(paginaActual),
      total,
      offset,
      limit
    })
  } catch (error) {
    console.log(error)
  }
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
    categorias,
    precios,
    datos: {}
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

const editar = async (req, res) => {
  // Extraer el id de la propiedad
  const { id } = req.params
  // Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id)
  // Si la propiedad no existe:
  if (!propiedad) {
    return res.redirect('/mis-propiedades')
  }
  // Revisar que quien visita la pagina fue el creador
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect('/mis-propiedades')
  }
  // Consultar Modelo de Precio y Categoria
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll()
  ])

  res.render('propiedades/editar', {
    pagina: `Editar Propiedad: ${propiedad.titulo}`,
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos: propiedad
  })
}

const guardarCambios = async (req, res) => {
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
    return res.render('propiedades/editar', {
      pagina: 'Editar Propiedad',
      csrfToken: req.csrfToken(),
      categorias,
      precios,
      errores: resultado.array(),
      datos: req.body
    })
  }
  // Extraer el id de la propiedad
  const { id } = req.params
  // Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id)
  // Si la propiedad no existe:
  if (!propiedad) {
    return res.redirect('/mis-propiedades')
  }
  // Revisar que quien visita la pagina fue el creador
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect('/mis-propiedades')
  }
  // Reescribir el objeto en la db
  try {
    const { titulo, descripcion, habitaciones, estacionamiento, baños, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body
    propiedad.set({
      titulo,
      descripcion,
      habitaciones,
      estacionamiento,
      baños,
      calle,
      lat,
      lng,
      precioId,
      categoriaId
    })
    await propiedad.save()
    res.redirect('/mis-propiedades')
  } catch (error) {
    console.log(error)
  }
}

const eliminar = async (req, res) => {
  // Extraer el id de la propiedad
  const { id } = req.params
  // Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id)
  // Si la propiedad no existe:
  if (!propiedad) {
    return res.redirect('/mis-propiedades')
  }
  // Revisar que quien visita la pagina fue el creador
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect('/mis-propiedades')
  }
  // Eliminar la imagen
  await unlink(`public/uploads/${propiedad.imagen}`)
  // Eliminar la propiedad
  await propiedad.destroy()
  res.redirect('/mis-propiedades')
}

const mostrarPropiedad = async (req, res) => {
  // Extraer el id de la propiedad
  const { id } = req.params
  // Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      { model: Precio, as: 'precio' },
      { model: Categoria, as: 'categoria' }
    ]
  })
  // Si la propiedad no existe:
  if (!propiedad) {
    return res.redirect('/404')
  }
  res.render('propiedades/mostrar', {
    propiedad,
    pagina: propiedad.titulo
  })
}

export {
  admin,
  crear,
  guardar,
  agregarImagen,
  almacenarImagen,
  editar,
  guardarCambios,
  eliminar,
  mostrarPropiedad
}
