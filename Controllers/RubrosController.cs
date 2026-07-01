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
    // Controlador API para CRUD de rubros.
    [Route("api/[controller]")]
    [ApiController]
    public class RubrosController : ControllerBase
    {
        // Contexto de base de datos.
        private readonly AppDbContext _context;

        // Inyecta el contexto al controlador.
        public RubrosController(AppDbContext context)
        {
            _context = context;
        }

        // Lista todos los rubros.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rubro>>> GetRubros()
        {
            return await _context.Rubros.ToListAsync();
        }

        // Busca un rubro por ID.
        [HttpGet("{id}")]
        public async Task<ActionResult<Rubro>> GetRubro(int id)
        {
            var rubro = await _context.Rubros.FindAsync(id);

            if (rubro == null)
            {
                return NotFound();
            }

            return rubro;
        }

        // Actualiza un rubro existente.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRubro(int id, Rubro rubro)
        {
            // Verifica que el ID de URL y cuerpo coincidan.
            if (id != rubro.RubroID)
            {
                return BadRequest();
            }

            // Evita descripcion vacia o solo espacios.
            if (string.IsNullOrWhiteSpace(rubro.Descripcion))
            {
                return BadRequest("La descripcion es obligatoria.");
            }

            // Marca el registro como modificado.
            _context.Entry(rubro).State = EntityState.Modified;

            try
            {
                // Guarda cambios en BD.
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Si no existe, devuelve 404.
                if (!RubroExists(id))
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

        // Crea un nuevo rubro.
        [HttpPost]
        public async Task<ActionResult<Rubro>> PostRubro(Rubro rubro)
        {
            // Evita descripcion vacia o solo espacios.
            if (string.IsNullOrWhiteSpace(rubro.Descripcion))
            {
                return BadRequest("La descripcion es obligatoria.");
            }

            // Inserta y guarda en BD.
            _context.Rubros.Add(rubro);
            await _context.SaveChangesAsync();

            // Devuelve 201 con la ruta del recurso creado.
            return CreatedAtAction("GetRubro", new { id = rubro.RubroID }, rubro);
        }

        // Elimina un rubro por ID.
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRubro(int id)
        {
            var rubro = await _context.Rubros.FindAsync(id);
            if (rubro == null)
            {
                return NotFound();
            }

            // Elimina y guarda en BD.
            _context.Rubros.Remove(rubro);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Comprueba existencia por ID.
        private bool RubroExists(int id)
        {
            return _context.Rubros.Any(e => e.RubroID == id);
        }
    }
}
