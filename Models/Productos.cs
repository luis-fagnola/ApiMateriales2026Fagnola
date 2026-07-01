using System.ComponentModel.DataAnnotations;

namespace ApiMateriales2026Fagnola.Models;

public class Productos 
{
    [Key]
    public int ProductoID { get; set; }

    [Required]
    [StringLength(120, MinimumLength = 3)]
    [RegularExpression(@"^.*\S.*$", ErrorMessage = "La descripcion es obligatoria.")]
    public string Descripcion { get; set; } = string.Empty;

    [Required]
    public bool Eliminado { get; set; } = false;
}