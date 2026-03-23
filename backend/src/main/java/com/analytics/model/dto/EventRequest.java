package com.analytics.model.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.Map;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EventRequest {
    @NotBlank public String eventType;
    public String source;
    public Map<String,Object> payload;
}
