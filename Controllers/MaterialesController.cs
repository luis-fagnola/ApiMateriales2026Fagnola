using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiMateriales2026Fagnola.Models;

namespace ApiMateriales2026Fagnola.Controllers
{
    // Controlador API para CRUD de materiales.
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialesController : ControllerBase
    {
        // Contexto de base de datos.
        private readonly AppDbContext _context;

        // Inyecta el contexto al controlador.
        public MaterialesController(AppDbContext context)
        {
            _context = context;
        }

        // Lista todos los materiales.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Materiales>>> GetMateriales()
        {
            return await _context.Materiales.ToListAsync();
        }

        // Busca un material por ID.
        [HttpGet("{id}")]
        public async Task<ActionResult<Materiales>> GetMateriales(int id)
        {
            var materiales = await _context.Materiales.FindAsync(id);

            if (materiales == null)
            {
                return NotFound();
            }

            return materiales;
        }

        // Actualiza un material existente.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMateriales(int id, Materiales materiales)
        {
            // Verifica que el ID de URL y cuerpo coincidan.
            if (id != materiales.MaterialID)
            {
                return BadRequest();
            }

            // Evita descripcion vacia o solo espacios.
            if (string.IsNullOrWhiteSpace(materiales.Descripcion))
            {
                return BadRequest("La descripcion es obligatoria.");
            }

            // Valida rubro existente antes de guardar cambios.
            var rubroExiste = await _context.Rubros.AnyAsync(r => r.RubroID == materiales.RubroID);
            if (!rubroExiste)
            {
                return BadRequest("El rubro indicado no existe.");
            }

            // Marca el registro como modificado.
            _context.Entry(materiales).State = EntityState.Modified;

            try
            {
                // Guarda cambios en BD.
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Si no existe, devuelve 404.
                if (!MaterialesExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // Crea un nuevo material.
        [HttpPost]
        public async Task<ActionResult<Materiales>> PostMateriales(Materiales materiales)
        {
            // Evita descripcion vacia o solo espacios.
            if (string.IsNullOrWhiteSpace(materiales.Descripcion))
            {
                return BadRequest("La descripcion es obligatoria.");
            }

            // Valida rubro existente antes del alta.
            var rubroExiste = await _context.Rubros.AnyAsync(r => r.RubroID == materiales.RubroID);
            if (!rubroExiste)
            {
                return BadRequest("El rubro indicado no existe.");
            }

            // Inserta y guarda en BD.
            _context.Materiales.Add(materiales);
            await _context.SaveChangesAsync();

            // Devuelve 201 con la ruta del recurso creado.
            return CreatedAtAction("GetMateriales", new { id = materiales.MaterialID }, materiales);
        }

        // Elimina un material por ID.
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMateriales(int id)
        {
            var materiales = await _context.Materiales.FindAsync(id);
            if (materiales == null)
            {
                return NotFound();
            }

            // Elimina y guarda en BD.
            _context.Materiales.Remove(materiales);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Comprueba existencia por ID.
        private bool MaterialesExists(int id)
        {
            return _context.Materiales.Any(e => e.MaterialID == id);
        }
    }
}
