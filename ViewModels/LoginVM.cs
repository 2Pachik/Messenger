﻿using System.ComponentModel.DataAnnotations;

namespace WebApplication1.ViewModels
{
    public class LoginVM
    {
        [Required(ErrorMessage = "Email is required")]
        [DataType(DataType.EmailAddress)]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [DataType(DataType.Password)]
        public string? Password { get; set; }

        [Display(Name = "Remember me")]
        public bool RememberMe { get; set; }

        public string? UserName { get; set; }
    }
}
