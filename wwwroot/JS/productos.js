const API_PRODUCTOS = "/api/Productos";

// Referencias a elementos del formulario y tabla.
const formProducto = document.getElementById("form-producto");
const idProducto = document.getElementById("producto-id");
const descripcionProducto = document.getElementById("descripcion");
const eliminadoProducto = document.getElementById("eliminado");
const tablaProductos = document.getElementById("tabla-productos");
const mensajeProducto = document.getElementById("mensaje-producto");
const tituloFormProducto = document.getElementById("titulo-form-producto");
const btnNuevoProducto = document.getElementById("btn-nuevo-producto");
const modalProductoEl = document.getElementById("modal-producto");
const modalProducto = new bootstrap.Modal(modalProductoEl);

// Estado local para renderizar la lista.
let productos = [];

// Carga inicial de registros.
window.addEventListener("DOMContentLoaded", async () => {
    await cargarProductos();
});

// Abre modal para crear un producto nuevo.
btnNuevoProducto.addEventListener("click", () => {
    limpiarFormularioProducto();
    mostrarMensaje("");
    modalProducto.show();
});

modalProductoEl.addEventListener("hidden.bs.modal", () => {
    limpiarFormularioProducto();
});

// Limpia error visual mientras el usuario escribe.
descripcionProducto.addEventListener("input", () => {
    descripcionProducto.classList.remove("is-invalid");
    if (mensajeProducto.classList.contains("alert-danger")) {
        mostrarMensaje("");
    }
});

// Guarda: crea o actualiza segun haya ID.
formProducto.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        productoID: Number(idProducto.value || 0),
        descripcion: descripcionProducto.value.trim(),
        eliminado: eliminadoProducto.checked
    };

    if (!validarDescripcion(payload.descripcion)) {
        return;
    }

    try {
        if (payload.productoID > 0) {
            const respuesta = await fetch(`${API_PRODUCTOS}/${payload.productoID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!respuesta.ok) {
                throw new Error("No se pudo actualizar el producto.");
            }

            mostrarMensaje("Producto actualizado correctamente.");
        } else {
            const respuesta = await fetch(API_PRODUCTOS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!respuesta.ok) {
                throw new Error("No se pudo registrar el producto.");
            }

            mostrarMensaje("Producto registrado correctamente.");
        }

        modalProducto.hide();
        limpiarFormularioProducto();
        await cargarProductos();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
});

async function cargarProductos() {
    // Consulta el listado de productos en la API.
    try {
        const respuesta = await fetch(API_PRODUCTOS);
        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el listado de productos.");
        }

        productos = await respuesta.json();
        renderProductos();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

function renderProductos() {
    // Dibuja filas de la tabla con los datos cargados.
    tablaProductos.innerHTML = "";

    if (productos.length === 0) {
        tablaProductos.innerHTML = `<tr><td colspan="4">Sin datos cargados.</td></tr>`;
        return;
    }

    for (const producto of productos) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${producto.productoID}</td>
            <td>${producto.descripcion ?? ""}</td>
            <td>${producto.eliminado ? '<span class="badge text-bg-secondary">Eliminado</span>' : '<span class="badge text-bg-success">Activo</span>'}</td>
            <td class="text-end">
                <div class="d-inline-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary" data-editar="${producto.productoID}">Editar</button>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-eliminar="${producto.productoID}">Eliminar</button>
                </div>
            </td>
        `;
        tablaProductos.appendChild(fila);
    }

    // Asigna acciones a botones de cada fila.
    tablaProductos.querySelectorAll("button[data-editar]").forEach((btn) => {
        btn.addEventListener("click", () => iniciarEdicionProducto(Number(btn.dataset.editar)));
    });

    tablaProductos.querySelectorAll("button[data-eliminar]").forEach((btn) => {
        btn.addEventListener("click", () => eliminarProducto(Number(btn.dataset.eliminar)));
    });
}

function iniciarEdicionProducto(id) {
    // Carga en el modal los datos del producto seleccionado.
    const producto = productos.find((p) => p.productoID === id);
    if (!producto) return;

    idProducto.value = producto.productoID;
    descripcionProducto.value = producto.descripcion ?? "";
    eliminadoProducto.checked = !!producto.eliminado;
    tituloFormProducto.textContent = `Editando producto #${producto.productoID}`;
    descripcionProducto.classList.remove("is-invalid");
    modalProducto.show();
}

async function eliminarProducto(id) {
    // Pide confirmacion y elimina por API.
    const confirmar = window.confirm(`Desea eliminar el producto #${id}?`);
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_PRODUCTOS}/${id}`, { method: "DELETE" });
        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar el producto.");
        }

        mostrarMensaje("Producto eliminado correctamente.");
        if (Number(idProducto.value) === id) {
            limpiarFormularioProducto();
        }

        await cargarProductos();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

function limpiarFormularioProducto() {
    // Vuelve el formulario a estado inicial.
    formProducto.reset();
    idProducto.value = "";
    tituloFormProducto.textContent = "Nuevo producto";
    descripcionProducto.classList.remove("is-invalid");
}

function mostrarMensaje(texto, esError = false) {
    // Muestra alerta de exito o error.
    mensajeProducto.textContent = texto;
    mensajeProducto.classList.remove("d-none", "alert-success", "alert-danger");
    if (!texto) {
        mensajeProducto.classList.add("d-none");
        return;
    }

    mensajeProducto.classList.add(esError ? "alert-danger" : "alert-success");
}

function validarDescripcion(descripcion) {
    // Valida campo obligatorio con minimo de caracteres.
    descripcionProducto.classList.remove("is-invalid");

    if (!descripcion) {
        descripcionProducto.classList.add("is-invalid");
        mostrarMensaje("La descripcion es obligatoria.", true);
        descripcionProducto.focus();
        return false;
    }

    if (descripcion.length < 3) {
        descripcionProducto.classList.add("is-invalid");
        mostrarMensaje("La descripcion debe tener al menos 3 caracteres.", true);
        descripcionProducto.focus();
        return false;
    }

    return true;
}
