using System.ComponentModel.DataAnnotations;

namespace TrekkingStore.API.Entities
{
    public class Address
    {
        public int Id { get; set; }

        public Guid UserId { get; set; }
        public AppUser? User { get; set; }

        [Required]
        [MaxLength(100)]
        public string ReceiverName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Province { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string District { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Ward { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string DetailAddress { get; set; } = string.Empty;

        public bool IsDefault { get; set; } = false;
    }
}

