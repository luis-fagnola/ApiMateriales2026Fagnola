using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiMateriales2026Fagnola.Models;

public class Materiales
{
    [Key]
    public int MaterialID { get; set; }

    [Required]
    [StringLength(120, MinimumLength = 3)]
    [RegularExpression(@"^.*\S.*$", ErrorMessage = "La descripcion es obligatoria.")]
    public string Descripcion { get; set; } = string.Empty;

    [Required]
    public int RubroID { get; set; }

    [Required]
    
    public decimal? PrecioCosto { get; set; }

    [Required]
    public bool Eliminado { get; set; } = false;
}
