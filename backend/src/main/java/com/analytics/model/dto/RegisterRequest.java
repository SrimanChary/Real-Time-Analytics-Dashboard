package com.analytics.model.dto;
import jakarta.validation.constraints.*;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    @NotBlank @Size(min=3,max=50) public String username;
    @NotBlank @Email                public String email;
    @NotBlank @Size(min=6)          public String password;
}
