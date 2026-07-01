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
    // Controlador API para CRUD de productos.
    [Route("api/[controller]")]
    [ApiController]
    public class ProductosController : ControllerBase
    {
        // Contexto de base de datos.
        private readonly AppDbContext _context;

        // Inyecta el contexto al controlador.
        public ProductosController(AppDbContext context)
        {
            _context = context;
        }

        // Lista todos los productos.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Productos>>> GetProductos()
        {
            return await _context.Productos.ToListAsync();
        }

        // Busca un producto por ID.
        [HttpGet("{id}")]
        public async Task<ActionResult<Productos>> GetProductos(int id)
        {
            var productos = await _context.Productos.FindAsync(id);

            if (productos == null)
            {
                return NotFound();
            }

            return productos;
        }

        // Actualiza un producto existente.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProductos(int id, Productos productos)
        {
            // Verifica que el ID de URL y cuerpo coincidan.
            if (id != productos.ProductoID)
            {
                return BadRequest();
            }

            // Evita descripcion vacia o solo espacios.
            if (string.IsNullOrWhiteSpace(productos.Descripcion))
            {
                return BadRequest("La descripcion es obligatoria.");
            }

            // Marca el registro como modificado.
            _context.Entry(productos).State = EntityState.Modified;

            try
            {
                // Guarda cambios en BD.
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Si no existe, devuelve 404.
                if (!ProductosExists(id))
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

        // Crea un nuevo producto.
        [HttpPost]
        public async Task<ActionResult<Productos>> PostProductos(Productos productos)
        {
            // Evita descripcion vacia o solo espacios.
            if (string.IsNullOrWhiteSpace(productos.Descripcion))
            {
                return BadRequest("La descripcion es obligatoria.");
            }

            // Inserta y guarda en BD.
            _context.Productos.Add(productos);
            await _context.SaveChangesAsync();

            // Devuelve 201 con la ruta del recurso creado.
            return CreatedAtAction("GetProductos", new { id = productos.ProductoID }, productos);
        }

        // Elimina un producto por ID.
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProductos(int id)
        {
            var productos = await _context.Productos.FindAsync(id);
            if (productos == null)
            {
                return NotFound();
            }

            // Elimina y guarda en BD.
            _context.Productos.Remove(productos);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Comprueba existencia por ID.
        private bool ProductosExists(int id)
        {
            return _context.Productos.Any(e => e.ProductoID == id);
        }
    }
}
