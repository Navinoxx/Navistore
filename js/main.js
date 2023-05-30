'use strict'

const lista = document.querySelector('.lista')
const aside = document.querySelector('.aside')
const filtro = document.querySelector('.filtro')
const buscador = document.querySelector('.buscador')
const verMas = document.querySelector('.view-more')
const badge = document.querySelector('.badge')
const svgCarrito = document.querySelector('#svg-carrito')
const svgFavoritos = document.querySelector('#svg-favoritos')
const templateProductos = document.querySelector('.template-productos').content
const templateDetalles = document.querySelector('.template-detalles').content
const templateCarrito = document.querySelector('.template-carro').content
const templateAside = document.querySelector('.template-aside').content
const fragment = document.createDocumentFragment()

let carrito = []
let favoritos = []

document.addEventListener('DOMContentLoaded', (e) => {
    if(localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        badge.textContent = carrito.length
    }   
    if(localStorage.getItem('favoritos')) {
        favoritos = JSON.parse(localStorage.getItem('favoritos'))
    }
    aside.classList.add('d-none')
    setTimeout(() => {
        baseProducto();
    }, 2000);
})

filtro.addEventListener('click', (e) => {
    mostrarProductos(e)
})

buscador.addEventListener('submit', (e) => {
    e.preventDefault()
    searchInput()
})

lista.addEventListener('click', (e) => {
    viewMore(e)
    agregarCarrito(e)
    borrarCarrito(e)
    guardarFavoritos(e)
})

aside.addEventListener('click', (e) => {
    alert(e)
})

svgCarrito.addEventListener('click', () => {
    mostrarCarrito()
})

svgFavoritos.addEventListener('click', (e) => {
    mostrarFavoritos(e)
})

const mostrarProductos = async (e) => {
    try {
        const response = await fetch('https://dummyjson.com/products?limit=0')
        const data = await response.json()
    
        data.products.forEach(element => {
            const clone = templateProductos.cloneNode(true)
    
            if ((e.target.title === 'Todos') || (e.target.title === element.category) || (e.target.title === 'Destacados' && element.rating > 4.7) || (e.target.title === 'Lo mas buscado' && element.id < 11) || (e.target.title === 'Superofertas' && element.price < 30) || (e.target.title === 'Liquidaciones' && element.stock < 10)) {
                lista.innerHTML =  ""
                lista.innerHTML = `<h2 class="categoria">${e.target.title}</h2>`
                clone.querySelector('img').setAttribute('src', element.thumbnail)
                clone.querySelector('.view-more').setAttribute('data-id', element.id)
                clone.querySelector('.bi-heart-fill').setAttribute('data-id', element.id)
                clone.querySelector('.card-title').textContent = element.title
                clone.querySelector('.card-text').textContent = `Precio normal: $${element.price}`
                clone.querySelector('.ofert').textContent = `Precio oferta: $${Math.round(element.price - (element.price/100 * element.discountPercentage))}`

                const index = favoritos.findIndex(producto => producto.id == element.id)
    
                if (index !== -1) {
                    clone.querySelector('.bi-heart-fill').classList.add('text-imperial-red')
                }
                
                aside.classList.add('d-none')
                fragment.appendChild(clone)
            }      
        })
        lista.appendChild(fragment)
    } catch (error) {
        console.log(error);
    }
    e.stopPropagation()
}

const searchInput = async () => {
    try {
        const response = await fetch('https://dummyjson.com/products/search?q=' + input.value)
        const data = await response.json()
    
        lista.innerHTML = `<h2 class="categoria d-inline-block">Coincidencias para: ${input.value}</h2>`
        aside.classList.add('d-none')
        if (input.value === 0) {
            lista.innerHTML += `<div class="alert alert-secondary" role="alert">
            No se encontraron coincidencias</div>`
        } else {
            for (let i = 0; i < data.products.length; i++) {
                const element = data.products[i];
                const clone = templateProductos.cloneNode(true)
    
            if (input.value) {
                clone.querySelector('img').setAttribute('src', element.thumbnail)
                clone.querySelector('.view-more').setAttribute('data-id', element.id)
                clone.querySelector('.bi-heart-fill').setAttribute('data-id', element.id)
                clone.querySelector('.card-title').textContent = element.title
                clone.querySelector('.card-text').textContent = `Precio normal: $${element.price}`
                clone.querySelector('.ofert').textContent = `Precio oferta: $${Math.round(element.price - (element.price/100 * element.discountPercentage))}`
    
                fragment.appendChild(clone)       
            }}
        }        
        lista.appendChild(fragment)
        buscador.reset()
    } catch (error) {
        console.log(error)
    }

}   

const viewMore = async (e) => {
    try {
        const response = await fetch('https://dummyjson.com/products/' + e.target.dataset.id)
        const data = await response.json()
    
            const clone = templateDetalles.cloneNode(true)
    
            if (e.target.textContent === 'Ver mas') {
                lista.innerHTML = ""
                clone.querySelector('.agregar-carrito').setAttribute('data-id', data.id)
                clone.querySelector('.bi-heart-fill').setAttribute('data-id', data.id)
                clone.querySelector('.card-title').textContent = data.title
                clone.querySelector('.card-brand').textContent = "Marca: " + data.brand
                clone.querySelector('.card-description').textContent = "Descripción: " + data.description
                clone.querySelector('.card-text').textContent = `Precio normal: $${data.price}`
                clone.querySelector('.card-stock').textContent = `Unidades disponibles: ${data.stock}`
                clone.querySelector('.ofert').textContent = `Precio oferta: $${Math.round(data.price - (data.price/100 * data.discountPercentage))}`
    
                clone.querySelector('.img-1').setAttribute('src', data.images[0])
                clone.querySelector('.img-2').setAttribute('src', data.images[1])
                clone.querySelector('.img-3').setAttribute('src', data.images[2])
                clone.querySelector('.img-4').setAttribute('src', data.images[3])

                const index = favoritos.findIndex(producto => producto.id == data.id)
    
                if (index !== -1) {
                    clone.querySelector('.bi-heart-fill').classList.add('text-imperial-red')
                }
    
                fragment.appendChild(clone) 
                lista.appendChild(fragment)
            }
    } catch (error) {
        console.log(error);
    }
} 

const agregarCarrito = async (e) => {
    try {
        const response = await fetch('https://dummyjson.com/products/' + e.target.dataset.id)
        const data = await response.json()
        
        if(e.target.textContent === 'Agregar al carro') {  
            const id = data.id
            const title = data.title
            const stock = data.stock
            const price = Math.round(data.price - (data.price/100 * data.discountPercentage))
            const thumbnail = data.thumbnail
            const cantidad = document.querySelector('#input-cantidad').value
    
            const productoEnCarrito = carrito.find(producto => producto.id === id)
    
            if (productoEnCarrito) {
                const nuevaCantidad = parseInt(productoEnCarrito.cantidad) + parseInt(cantidad)
                if (nuevaCantidad > stock || cantidad < 1) {
                    Swal.fire({
                        icon: 'error',
                        title: 'La cantidad solicitada supera el stock disponible',
                        text: `Max disponible ${stock}`,
                    })
                } else {
                    productoEnCarrito.cantidad = nuevaCantidad
                    localStorage.setItem('carrito', JSON.stringify(carrito))
                    aside.classList.remove('d-none')
                    mostrarCarrito()
                }
            } else {
                if (cantidad > stock || cantidad < 1) {
                    Swal.fire({
                        icon: 'error',
                        title: 'La cantidad solicitada supera el stock disponible',
                        text: `Max disponible ${stock}`,
                    })
                } else {
                    carrito.push({
                        id,
                        title,
                        price,
                        stock,
                        thumbnail,
                        cantidad
                    })
                    localStorage.setItem('carrito', JSON.stringify(carrito))
                    aside.classList.remove('d-none')
                    mostrarCarrito()
                }    
            }
        }
    } catch (error) {
        console.log(error);
    }
    e.stopPropagation()
} 

const mostrarCarrito = () => {
    try {
        lista.innerHTML = ""

        if(carrito.length === 0) {
            badge.textContent = ""
            lista.innerHTML = `<h2 class="categoria">Tu pedido</h2>
                                <div class="alert alert-secondary" role="alert">
                                    Tu carrito esta vacio
                                </div>`
        } else {
            lista.innerHTML = `<div class="d-flex justify-content-between mb-3">
                                <h2 class="categoria">Tu pedido</h2>
                                <div class="btn-group" role="group" aria-label="Basic outlined example">
                                    <button id="volver" type="button" class="btn btn-outline-blue"><< Seguir comprando</button>
                                    <button id=vaciar type="button" class="btn btn-outline-imperial-red">Vaciar carrito</button>
                                </div>
                            </div>`
            for (let i = 0; i < carrito.length; i++) {
                const element = carrito[i]
                const clone = templateCarrito.cloneNode(true)
                badge.textContent = carrito.length

                clone.querySelector('img').setAttribute('src', element.thumbnail)
                clone.querySelector('.card-title').textContent = element.title
                clone.querySelector('.card-price').textContent = "$" + (element.price * element.cantidad)
                clone.querySelector('.card-cantidad').value = element.cantidad
                clone.querySelector('.bi-trash').setAttribute('data-id', element.id)

                fragment.appendChild(clone)       
            }
        }    
        lista.appendChild(fragment)
        totalCarrito()

    } catch (error) {
        console.log(error);
    }
}

const totalCarrito = () => {
    try {
        aside.innerHTML = ""
        aside.classList.remove("d-none")
        const clone = templateAside.cloneNode(true)
    
        const subtotal = carrito.reduce((acc, element) => acc + element.price * element.cantidad, 0)
        const envio = carrito.reduce((acc, element) => acc + 2 * element.cantidad, 0)
    
        const selectElement = clone.querySelector("#inputGroupSelect01")
        const ahorroElement = clone.querySelector("#ahorro")
        const totalElement = clone.querySelector("#total")
        const cuotasElement = clone.querySelector('#pago-cuotas')
    
        if (carrito.length > 0) {
            selectElement.addEventListener("change", (e) => {
                const selectedOption = parseInt(e.target.value, 10)
                let ahorro = 0
                let total = subtotal - ahorro + envio
        
                if (selectedOption == "0") {
                    cuotasElement.textContent = ""
                }    
                if (selectedOption == "1") {
                    ahorro = subtotal * 0.1
                    cuotasElement.textContent = `${selectedOption}  cuota de $ ${((total - ahorro) / selectedOption).toFixed(2)}`
                }
                if (selectedOption == "3" || selectedOption == "6" || selectedOption == "12") {
                    cuotasElement.textContent = `${selectedOption}  cuotas de $ ${(total / selectedOption).toFixed(2)}`
                }
        
                ahorroElement.value = "-$" + ahorro.toFixed(2)
                totalElement.value = "$" + (subtotal - ahorro + envio).toFixed(2)
            })
        }
    
        clone.querySelector("#subtotal").value = "$" + subtotal.toFixed(2)
        clone.querySelector("#envio").value = "$" + envio.toFixed(2)
        
        fragment.appendChild(clone)
        aside.appendChild(fragment)
        
    } catch (error) {
        console.log(error);
    }
}

const borrarCarrito = (e) => {
    try {
        if (e.target.id === 'vaciar') {
            carrito = []
            localStorage.clear()
            mostrarCarrito()
        } 

        if (e.target.id === 'volver') {
            baseProducto()
        } 

        if (e.target.classList.contains('bi-trash')) {
            const id = e.target.dataset.id
            carrito = carrito.filter(element => element.id != id)
            localStorage.setItem('carrito', JSON.stringify(carrito))
            mostrarCarrito()
        } 

    } catch (error) {
        console.log(error);
    }
    e.stopPropagation()
}

const guardarFavoritos = async (e) => {
    try {
        if (e.target.classList.contains('bi-heart-fill')) {
            const id = e.target.dataset.id
            const response = await fetch('https://dummyjson.com/products/' + id)
            const data = await response.json()
    
            e.target.classList.add('text-imperial-red') 
    
            const index = favoritos.findIndex(producto => producto.id == id)
    
            if (index !== -1) {
                favoritos.splice(index, 1)
                e.target.classList.remove('text-imperial-red') 
            } else {
                favoritos.push({
                    id: data.id,
                    title: data.title,
                    price: data.price,
                    discountPercentage: data.discountPercentage,
                    thumbnail: data.thumbnail
                })
            }
            localStorage.setItem('favoritos', JSON.stringify(favoritos))
            e.stopPropagation()
        }
    } catch (error) {
        console.log(error);
    }
}

const mostrarFavoritos = (e) => {
    try {
        if (e.target.classList.contains('bi-heart-fill')) {
            lista.innerHTML = `<h2 class="categoria">Favoritos</h2>`

            favoritos.forEach(element => {
                const clone = templateProductos.cloneNode(true)
                clone.querySelector('img').setAttribute('src', element.thumbnail)
                clone.querySelector('.view-more').setAttribute('data-id', element.id)
                clone.querySelector('.bi-heart-fill').setAttribute('data-id', element.id)
                clone.querySelector('.bi-heart-fill').classList.add('text-imperial-red')
                clone.querySelector('.card-title').textContent = element.title
                clone.querySelector('.card-text').textContent = `Precio normal: $${element.price}`
                clone.querySelector('.ofert').textContent = `Precio oferta: $${Math.round(element.price - (element.price/100 * element.discountPercentage))}`
                fragment.appendChild(clone)
            });

            lista.appendChild(fragment)
            aside.classList.add('d-none')
        }
    } catch (error) {
        console.log(error)
    }
}

const alert = (e) => {
    if (e.target.classList.contains('fin-compra') && carrito.length > 0) {
        Swal.fire({
            title: 'Proceso completado con exito!',
            text: 'Gracias por tu compra!',
            icon: 'success',
            showConfirmButton: false,
            timer: 2000
        })
        carrito = []
        localStorage.clear()
        mostrarCarrito()
    }
} 

const baseProducto = async () => {
    try {
        const response = await fetch('https://dummyjson.com/products?limit=0')
        const data = await response.json()
    
        data.products.forEach(element => {
            const clone = templateProductos.cloneNode(true)

                lista.innerHTML = `<h2 class="categoria">Todos</h2>`
                clone.querySelector('img').setAttribute('src', element.thumbnail)
                clone.querySelector('.view-more').setAttribute('data-id', element.id)
                clone.querySelector('.bi-heart-fill').setAttribute('data-id', element.id)
                clone.querySelector('.card-title').textContent = element.title
                clone.querySelector('.card-text').textContent = `Precio normal: $${element.price}`
                clone.querySelector('.ofert').textContent = `Precio oferta: $${Math.round(element.price - (element.price/100 * element.discountPercentage))}`

                const index = favoritos.findIndex(producto => producto.id == element.id)
    
                if (index !== -1) {
                    clone.querySelector('.bi-heart-fill').classList.add('text-imperial-red')
                }
                
                aside.classList.add('d-none')
                fragment.appendChild(clone)
        })  
        lista.appendChild(fragment)
    } catch (error) {
        
    }
}


