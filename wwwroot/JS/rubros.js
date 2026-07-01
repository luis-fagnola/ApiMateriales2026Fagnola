const API_RUBROS = "/api/Rubros";

// Referencias a elementos del formulario y tabla.
const formRubro = document.getElementById("form-rubro");
const idRubro = document.getElementById("rubro-id");
const descripcionRubro = document.getElementById("descripcion");
const eliminadoRubro = document.getElementById("eliminado");
const tablaRubros = document.getElementById("tabla-rubros");
const mensajeRubro = document.getElementById("mensaje-rubro");
const tituloFormRubro = document.getElementById("titulo-form-rubro");
const btnNuevoRubro = document.getElementById("btn-nuevo-rubro");
const modalRubroEl = document.getElementById("modal-rubro");
const modalRubro = new bootstrap.Modal(modalRubroEl);

// Estado local para renderizar la lista.
let rubros = [];

// Carga inicial de registros.
window.addEventListener("DOMContentLoaded", async () => {
    await cargarRubros();
});

// Abre modal para crear un rubro nuevo.
btnNuevoRubro.addEventListener("click", () => {
    limpiarFormularioRubro();
    mostrarMensaje("");
    modalRubro.show();
});

modalRubroEl.addEventListener("hidden.bs.modal", () => {
    limpiarFormularioRubro();
});

// Limpia error visual mientras el usuario escribe.
descripcionRubro.addEventListener("input", () => {
    descripcionRubro.classList.remove("is-invalid");
    if (mensajeRubro.classList.contains("alert-danger")) {
        mostrarMensaje("");
    }
});

// Guarda: crea o actualiza segun haya ID.
formRubro.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        rubroID: Number(idRubro.value || 0),
        descripcion: descripcionRubro.value.trim(),
        eliminado: eliminadoRubro.checked
    };

    if (!validarDescripcion(payload.descripcion)) {
        return;
    }

    try {
        if (payload.rubroID > 0) {
            const respuesta = await fetch(`${API_RUBROS}/${payload.rubroID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!respuesta.ok) {
                throw new Error("No se pudo actualizar el rubro.");
            }

            mostrarMensaje("Rubro actualizado correctamente.");
        } else {
            const respuesta = await fetch(API_RUBROS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!respuesta.ok) {
                throw new Error("No se pudo registrar el rubro.");
            }

            mostrarMensaje("Rubro registrado correctamente.");
        }

        modalRubro.hide();
        limpiarFormularioRubro();
        await cargarRubros();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
});

async function cargarRubros() {
    // Consulta el listado de rubros en la API.
    try {
        const respuesta = await fetch(API_RUBROS);
        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el listado de rubros.");
        }

        rubros = await respuesta.json();
        renderRubros();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

function renderRubros() {
    // Dibuja filas de la tabla con los datos cargados.
    tablaRubros.innerHTML = "";

    if (rubros.length === 0) {
        tablaRubros.innerHTML = `<tr><td colspan="4">Sin datos cargados.</td></tr>`;
        return;
    }

    for (const rubro of rubros) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${rubro.rubroID}</td>
            <td>${rubro.descripcion ?? ""}</td>
            <td>${rubro.eliminado ? '<span class="badge text-bg-secondary">Eliminado</span>' : '<span class="badge text-bg-success">Activo</span>'}</td>
            <td class="text-end">
                <div class="d-inline-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary" data-editar="${rubro.rubroID}">Editar</button>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-eliminar="${rubro.rubroID}">Eliminar</button>
                </div>
            </td>
        `;
        tablaRubros.appendChild(fila);
    }

    // Asigna acciones a botones de cada fila.
    tablaRubros.querySelectorAll("button[data-editar]").forEach((btn) => {
        btn.addEventListener("click", () => iniciarEdicionRubro(Number(btn.dataset.editar)));
    });

    tablaRubros.querySelectorAll("button[data-eliminar]").forEach((btn) => {
        btn.addEventListener("click", () => eliminarRubro(Number(btn.dataset.eliminar)));
    });
}

function iniciarEdicionRubro(id) {
    // Carga en el modal los datos del rubro seleccionado.
    const rubro = rubros.find((r) => r.rubroID === id);
    if (!rubro) return;

    idRubro.value = rubro.rubroID;
    descripcionRubro.value = rubro.descripcion ?? "";
    eliminadoRubro.checked = !!rubro.eliminado;
    tituloFormRubro.textContent = `Editando rubro #${rubro.rubroID}`;
    descripcionRubro.classList.remove("is-invalid");
    modalRubro.show();
}

async function eliminarRubro(id) {
    // Pide confirmacion y elimina por API.
    const confirmar = window.confirm(`Desea eliminar el rubro #${id}?`);
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_RUBROS}/${id}`, { method: "DELETE" });
        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar el rubro.");
        }

        mostrarMensaje("Rubro eliminado correctamente.");
        if (Number(idRubro.value) === id) {
            limpiarFormularioRubro();
        }

        await cargarRubros();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

function limpiarFormularioRubro() {
    // Vuelve el formulario a estado inicial.
    formRubro.reset();
    idRubro.value = "";
    tituloFormRubro.textContent = "Nuevo rubro";
    descripcionRubro.classList.remove("is-invalid");
}

function mostrarMensaje(texto, esError = false) {
    // Muestra alerta de exito o error.
    mensajeRubro.textContent = texto;
    mensajeRubro.classList.remove("d-none", "alert-success", "alert-danger");
    if (!texto) {
        mensajeRubro.classList.add("d-none");
        return;
    }

    mensajeRubro.classList.add(esError ? "alert-danger" : "alert-success");
}

function validarDescripcion(descripcion) {
    // Valida campo obligatorio con minimo de caracteres.
    descripcionRubro.classList.remove("is-invalid");

    if (!descripcion) {
        descripcionRubro.classList.add("is-invalid");
        mostrarMensaje("La descripcion es obligatoria.", true);
        descripcionRubro.focus();
        return false;
    }

    if (descripcion.length < 3) {
        descripcionRubro.classList.add("is-invalid");
        mostrarMensaje("La descripcion debe tener al menos 3 caracteres.", true);
        descripcionRubro.focus();
        return false;
    }

    return true;
}
