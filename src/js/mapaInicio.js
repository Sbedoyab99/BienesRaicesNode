(function () {
  const lat = 6.239522
  const lng = -75.575589
  const mapa = L.map('mapa-inicio').setView([lat, lng], 11.5)
  const markers = new L.FeatureGroup().addTo(mapa)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapa)

  const obtenerPropiedades = async () => {
    try {
      const url = '/api/propiedades'
      const respuesta = await fetch(url)
      const propiedades = await respuesta.json()
      mostrarPropiedades(propiedades)
    } catch (error) {
      console.log(error)
    }
  }

  const mostrarPropiedades = propiedades => {
    propiedades.forEach(propiedad => {
      const marker = new L.marker([propiedad.lat, propiedad.lng], {
        autoPan: true
      })
        .addTo(mapa)
        .bindPopup(`
            <h1 class="text-xl font-extrabold uppercase my-5">${propiedad.titulo}</h1>
            <p class="text-gray-600 font-bold">${propiedad.precio.nombre}</p>
            <p class="text-indigo-600 font-bold">${propiedad.categoria.nombre}</p>
            <img src="/uploads/${propiedad.imagen}" alt="Imagen: ${propiedad.titulo}">
            <a href="/propiedad/${propiedad.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase">Ver Propiedad</a>
        `)

      markers.addLayer(marker)
    })
  }

  obtenerPropiedades()
})()
