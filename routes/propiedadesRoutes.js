import express from 'express'
import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, mostrarPropiedad, enviarMensaje, verMensajes } from '../controllers/PropiedadController.js'
import protegerRuta from '../middleware/protegerRuta.js'
import upload from '../middleware/subirArchivo.js'
import identificarUsuario from '../middleware/identificarUsuario.js'

const router = express.Router()

// Routing
// Dashboard mis propiedades
router.get('/mis-propiedades', protegerRuta, admin)
// Formulario de crear nueva propiedad
router.get('/propiedades/crear', protegerRuta, crear)
router.post('/propiedades/crear', protegerRuta, guardar)
// Formulario de agregar imagen a una propiedad
router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen)
router.post('/propiedades/agregar-imagen/:id', protegerRuta, upload.single('imagen'), almacenarImagen)
// Formulario Editar propiedad
router.get('/propiedades/editar/:id', protegerRuta, editar)
router.post('/propiedades/editar/:id', protegerRuta, guardarCambios)
// Eliminar Propiedad
router.post('/propiedades/eliminar/:id', protegerRuta, eliminar)

/** Area Publica */
router.get('/propiedad/:id', identificarUsuario, mostrarPropiedad)
router.post('/propiedad/:id', identificarUsuario, enviarMensaje)
router.get('/mensajes/:id', protegerRuta, verMensajes)

export default router
