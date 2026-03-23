package com.analytics.model.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    public String token;
    public String username;
    public String email;
    public String role;
    public long expiresIn;
}
