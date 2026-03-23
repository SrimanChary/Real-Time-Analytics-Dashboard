package com.analytics.model.dto;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDto {
    public UUID id;
    public String username;
    public String email;
    public String role;
    public LocalDateTime createdAt;
}
