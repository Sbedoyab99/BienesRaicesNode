const esVendedor = (usuarioId, propiedadUsuarioId) => {
  return usuarioId === propiedadUsuarioId
}

const formatearFecha = fecha => {
  const fechaFormateada = new Date(fecha).toISOString().slice(0, 10)
  const opciones = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return new Date(fechaFormateada).toLocaleDateString('es-ES', opciones)
}

export {
  esVendedor,
  formatearFecha
}
