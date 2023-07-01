import Swal from 'sweetalert2'
(function () {
  const eliminarBotones = document.querySelectorAll('#eliminar')
  const token = document.querySelector('meta[name="csrf-token"').getAttribute('content')

  eliminarBotones.forEach(boton => {
    boton.addEventListener('click', mostrarPopup)
  })

  function mostrarPopup (e) {
    Swal.fire({
      title: '¿Estas Seguro?',
      text: 'No Podras revertir esta operacion',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Estoy seguro'
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarPropiedad(e)
      }
    })
  }

  async function eliminarPropiedad (e) {
    const { propiedadId: id } = e.target.dataset
    const url = `/propiedades/eliminar/${id}`
    try {
      const resultado = await fetch(url, {
        method: 'POST',
        headers: {
          'CSRF-Token': token
        }
      })
      const respuesta = resultado.json()
      if (respuesta) {
        Swal.fire(
          'Eliminado',
          'La propiedad ha sido eliminada.',
          'success'
        ).then(() => {
          window.location.reload()
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
})()
