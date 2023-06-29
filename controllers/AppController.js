import { Sequelize } from 'sequelize'
import { Precio, Categoria, Propiedad } from '../models/index.js'

const inicio = async (req, res) => {
  const [categorias, precios, casas, apartamentos] = await Promise.all([
    Categoria.findAll({ raw: true }),
    Precio.findAll({ raw: true }),
    Propiedad.findAll({
      limit: 3,
      where: {
        categoriaId: 1
      },
      include: [
        {
          model: Precio, as: 'precio'
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ]
    }),
    Propiedad.findAll({
      limit: 3,
      where: {
        categoriaId: 2
      },
      include: [
        {
          model: Precio, as: 'precio'
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ]
    })
  ])
  res.render('inicio', {
    pagina: 'Inicio',
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    casas,
    apartamentos
  })
}
const categoria = async (req, res) => {
  const { id } = req.params
  // Comprobar que existe el id
  const categoria = await Categoria.findByPk(id)
  if (!categoria) {
    res.redirect('/404')
  }
  // Obtener propiedades de esa categoria
  const propiedades = await Propiedad.findAll({
    where: {
      categoriaId: id
    },
    include: [
      { model: Precio, as: 'precio' }
    ]
  })
  res.render('categoria', {
    pagina: `${categoria.nombre}s en Venta`,
    csrfToken: req.csrfToken(),
    propiedades
  })
}
const noEncontrado = (req, res) => {
  res.render('404', {
    pagina: 'No Encontrado',
    csrfToken: req.csrfToken()
  })
}
const buscador = async (req, res) => {
  const { termino } = req.body
  // validar que termino no este vacio
  if (!termino.trim()) {
    return res.redirect('back')
  }
  // Consultar las propiedades
  const propiedades = await Propiedad.findAll({
    where: {
      titulo: {
        [Sequelize.Op.like]: `%${termino}%`
      }
    },
    include: [
      { model: Precio, as: 'precio' }
    ]
  })
  res.render('busqueda', {
    pagina: `Resultados de la busqueda: ${termino}`,
    csrfToken: req.csrfToken(),
    propiedades
  })
}


export {
  inicio,
  categoria,
  noEncontrado,
  buscador
}
