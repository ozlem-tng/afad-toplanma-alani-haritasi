using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("islem_gecmisi")]
public class ActivityLog
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("toplanma_alani_id")]
    public int? GatheringAreaId { get; set; }

    [Column("aday_nokta_id")]
    public int? CandidatePointId { get; set; }

    [Column("kullanici_id")]
    public int? UserId { get; set; }

    [Required]
    [Column("islem_turu")]
    public string ActionType { get; set; } = string.Empty;

    [Column("eski_degerler", TypeName = "jsonb")]
    public string? OldValues { get; set; }

    [Column("yeni_degerler", TypeName = "jsonb")]
    public string? NewValues { get; set; }

    [Column("islem_tarihi")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ToplanmaAlani? GatheringArea { get; set; }
    public CandidatePoint? CandidatePoint { get; set; }
}
