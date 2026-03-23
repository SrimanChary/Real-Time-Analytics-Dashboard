package com.analytics.model.dto;
import lombok.*;
import java.math.BigDecimal;
import java.util.Map;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class KpiResponse {
    public long totalEvents;
    public long activeUsers;
    public BigDecimal totalRevenue;
    public BigDecimal avgMetricValue;
    public long pageViews;
    public Map<String,Object> period;
}
