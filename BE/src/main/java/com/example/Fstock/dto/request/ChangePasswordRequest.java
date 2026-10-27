package com.example.Fstock.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangePasswordRequest {

    private String email;
    @NotBlank(message = "Password must not be blank")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[@#$%^&+=!.()+ =]).{8,}$",
            message = "Password must have at least 8 characters, one uppercase letter, and one special character")
    private String oldPassword;
    @NotBlank(message = "New password must not be blank")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[@#$%^&+=!.()+ =]).{8,}$",
            message = "Password must have at least 8 characters, one uppercase letter, and one special character")
    private String newPassword;
    @NotBlank(message = "Confirm password must not be blank")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[@#$%^&+=!.()+ =]).{8,}$",
            message = "Password must have at least 8 characters, one uppercase letter, and one special character")
    private String confirmPassword;

}
