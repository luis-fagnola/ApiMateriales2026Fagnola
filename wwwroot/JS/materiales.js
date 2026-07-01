const API_MATERIALES = "/api/Materiales";
const API_RUBROS_MATERIALES = "/api/Rubros";

// Referencias a elementos del formulario y tabla.
const formMaterial = document.getElementById("form-material");
const idMaterial = document.getElementById("material-id");
const descripcionMaterial = document.getElementById("descripcion");
const rubroMaterial = document.getElementById("rubro");
const precioCostoMaterial = document.getElementById("precio-costo");
const eliminadoMaterial = document.getElementById("eliminado");
const tablaMateriales = document.getElementById("tabla-materiales");
const mensajeMaterial = document.getElementById("mensaje-material");
const tituloFormMaterial = document.getElementById("titulo-form-material");
const btnNuevoMaterial = document.getElementById("btn-nuevo-material");
const modalMaterialEl = document.getElementById("modal-material");
const modalMaterial = new bootstrap.Modal(modalMaterialEl);

// Estado local para renderizar materiales y rubros.
let materiales = [];
let rubros = [];

// Carga inicial de rubros y materiales.
window.addEventListener("DOMContentLoaded", async () => {
    await cargarRubrosMateriales();
    await cargarMateriales();
});

btnNuevoMaterial.addEventListener("click", () => {
    // Abre modal para crear un material nuevo.
    limpiarFormularioMaterial();
    mostrarMensaje("");
    modalMaterial.show();
});

modalMaterialEl.addEventListener("hidden.bs.modal", () => {
    limpiarFormularioMaterial();
});

// Limpia error visual mientras el usuario corrige campos.
descripcionMaterial.addEventListener("input", () => {
    descripcionMaterial.classList.remove("is-invalid");
    if (mensajeMaterial.classList.contains("alert-danger")) {
        mostrarMensaje("");
    }
});

rubroMaterial.addEventListener("change", () => {
    rubroMaterial.classList.remove("is-invalid");
});

precioCostoMaterial.addEventListener("input", () => {
    precioCostoMaterial.classList.remove("is-invalid");
});

// Guarda: crea o actualiza segun haya ID.
formMaterial.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        materialID: Number(idMaterial.value || 0),
        descripcion: descripcionMaterial.value.trim(),
        rubroID: Number(rubroMaterial.value),
        precioCosto: Number(precioCostoMaterial.value),
        eliminado: eliminadoMaterial.checked
    };

    if (!validarDescripcionMaterial(payload.descripcion)) {
        return;
    }

    if (!validarRubroMaterial(payload.rubroID)) {
        return;
    }

    if (!validarPrecioMaterial(payload.precioCosto)) {
        return;
    }

    try {
        if (payload.materialID > 0) {
            const respuesta = await fetch(`${API_MATERIALES}/${payload.materialID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!respuesta.ok) {
                throw new Error("No se pudo actualizar el material.");
            }

            mostrarMensaje("Material actualizado correctamente.");
        } else {
            const respuesta = await fetch(API_MATERIALES, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!respuesta.ok) {
                throw new Error("No se pudo registrar el material.");
            }

            mostrarMensaje("Material registrado correctamente.");
        }

        modalMaterial.hide();
        limpiarFormularioMaterial();
        await cargarMateriales();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
});

async function cargarRubrosMateriales() {
    // Carga rubros para el combo del formulario.
    try {
        const respuesta = await fetch(API_RUBROS_MATERIALES);
        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el listado de rubros.");
        }

        rubros = await respuesta.json();
        renderOpcionesRubros();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

function renderOpcionesRubros() {
    // Dibuja opciones del select de rubros.
    rubroMaterial.innerHTML = "";

    const opcionDefault = document.createElement("option");
    opcionDefault.value = "";
    opcionDefault.textContent = "Seleccione un rubro";
    opcionDefault.disabled = true;
    opcionDefault.selected = true;
    rubroMaterial.appendChild(opcionDefault);

    for (const rubro of rubros) {
        const opcion = document.createElement("option");
        opcion.value = rubro.rubroID;
        opcion.textContent = `${rubro.rubroID} - ${rubro.descripcion ?? "Sin descripcion"}`;
        rubroMaterial.appendChild(opcion);
    }
}

async function cargarMateriales() {
    // Consulta el listado de materiales en la API.
    try {
        const respuesta = await fetch(API_MATERIALES);
        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el listado de materiales.");
        }

        materiales = await respuesta.json();
        renderMateriales();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

function renderMateriales() {
    // Dibuja filas de la tabla y muestra nombre de rubro.
    tablaMateriales.innerHTML = "";

    if (materiales.length === 0) {
        tablaMateriales.innerHTML = `<tr><td colspan="6">Sin datos cargados.</td></tr>`;
        return;
    }

    for (const material of materiales) {
        const rubro = rubros.find((r) => r.rubroID === material.rubroID);
        const nombreRubro = rubro ? rubro.descripcion : `Rubro #${material.rubroID}`;

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${material.materialID}</td>
            <td>${material.descripcion ?? ""}</td>
            <td>${nombreRubro}</td>
            <td>$ ${Number(material.precioCosto).toFixed(2)}</td>
            <td>${material.eliminado ? '<span class="badge text-bg-secondary">Eliminado</span>' : '<span class="badge text-bg-success">Activo</span>'}</td>
            <td class="text-end">
                <div class="d-inline-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary" data-editar="${material.materialID}">Editar</button>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-eliminar="${material.materialID}">Eliminar</button>
                </div>
            </td>
        `;
        tablaMateriales.appendChild(fila);
    }

    // Asigna acciones a botones de cada fila.
    tablaMateriales.querySelectorAll("button[data-editar]").forEach((btn) => {
        btn.addEventListener("click", () => iniciarEdicionMaterial(Number(btn.dataset.editar)));
    });

    tablaMateriales.querySelectorAll("button[data-eliminar]").forEach((btn) => {
        btn.addEventListener("click", () => eliminarMaterial(Number(btn.dataset.eliminar)));
    });
}

function iniciarEdicionMaterial(id) {
    // Carga en el modal los datos del material seleccionado.
    const material = materiales.find((m) => m.materialID === id);
    if (!material) return;

    idMaterial.value = material.materialID;
    descripcionMaterial.value = material.descripcion ?? "";
    rubroMaterial.value = String(material.rubroID);
    precioCostoMaterial.value = Number(material.precioCosto).toFixed(2);
    eliminadoMaterial.checked = !!material.eliminado;
    tituloFormMaterial.textContent = `Editando material #${material.materialID}`;
    descripcionMaterial.classList.remove("is-invalid");
    rubroMaterial.classList.remove("is-invalid");
    precioCostoMaterial.classList.remove("is-invalid");
    modalMaterial.show();
}

async function eliminarMaterial(id) {
    // Pide confirmacion y elimina por API.
    const confirmar = window.confirm(`Desea eliminar el material #${id}?`);
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_MATERIALES}/${id}`, { method: "DELETE" });
        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar el material.");
        }

        mostrarMensaje("Material eliminado correctamente.");
        if (Number(idMaterial.value) === id) {
            limpiarFormularioMaterial();
        }

        await cargarMateriales();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

function limpiarFormularioMaterial() {
    // Vuelve el formulario a estado inicial.
    formMaterial.reset();
    idMaterial.value = "";
    tituloFormMaterial.textContent = "Nuevo material";
    descripcionMaterial.classList.remove("is-invalid");
    rubroMaterial.classList.remove("is-invalid");
    precioCostoMaterial.classList.remove("is-invalid");
}

function mostrarMensaje(texto, esError = false) {
    // Muestra alerta de exito o error.
    mensajeMaterial.textContent = texto;
    mensajeMaterial.classList.remove("d-none", "alert-success", "alert-danger");
    if (!texto) {
        mensajeMaterial.classList.add("d-none");
        return;
    }

    mensajeMaterial.classList.add(esError ? "alert-danger" : "alert-success");
}

function validarDescripcionMaterial(descripcion) {
    // Valida descripcion obligatoria con minimo de caracteres.
    descripcionMaterial.classList.remove("is-invalid");

    if (!descripcion) {
        descripcionMaterial.classList.add("is-invalid");
        mostrarMensaje("La descripcion es obligatoria.", true);
        descripcionMaterial.focus();
        return false;
    }

    if (descripcion.length < 3) {
        descripcionMaterial.classList.add("is-invalid");
        mostrarMensaje("La descripcion debe tener al menos 3 caracteres.", true);
        descripcionMaterial.focus();
        return false;
    }

    return true;
}

function validarRubroMaterial(rubroID) {
    // Valida que exista un rubro seleccionado.
    rubroMaterial.classList.remove("is-invalid");

    if (!Number.isFinite(rubroID) || rubroID <= 0) {
        rubroMaterial.classList.add("is-invalid");
        mostrarMensaje("Debe seleccionar un rubro valido.", true);
        rubroMaterial.focus();
        return false;
    }

    return true;
}

function validarPrecioMaterial(precioCosto) {
    // Valida precio numerico mayor o igual a cero.
    precioCostoMaterial.classList.remove("is-invalid");

    if (!Number.isFinite(precioCosto) || precioCosto < 0) {
        precioCostoMaterial.classList.add("is-invalid");
        mostrarMensaje("El precio costo debe ser un numero mayor o igual a 0.", true);
        precioCostoMaterial.focus();
        return false;
    }

    return true;
}
