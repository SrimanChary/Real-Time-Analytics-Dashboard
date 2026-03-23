package com.analytics.model.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TimeSeriesPoint {
    public String label;
    public BigDecimal value;
    public LocalDateTime timestamp;
}
