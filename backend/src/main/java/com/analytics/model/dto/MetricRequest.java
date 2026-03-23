package com.analytics.model.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.math.BigDecimal;
import java.util.Map;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MetricRequest {
    @NotBlank public String metricKey;
    public BigDecimal value;
    public Map<String,Object> tags;
}
