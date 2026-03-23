package com.analytics.model.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class KpiSnapshot {
    public long totalEvents;
    public long activeUsers;
    public BigDecimal latestRevenue;
    public long pageViews;
    public LocalDateTime timestamp;
}
