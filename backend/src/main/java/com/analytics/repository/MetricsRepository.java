package com.analytics.repository;

import com.analytics.model.entity.Metric;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MetricsRepository extends JpaRepository<Metric, Long> {

    @Query("SELECT AVG(m.value) FROM Metric m WHERE m.recordedAt BETWEEN :from AND :to")
    BigDecimal findAvgValueBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT SUM(m.value) FROM Metric m WHERE m.metricKey = :key AND m.recordedAt BETWEEN :from AND :to")
    BigDecimal sumByKeyAndPeriod(@Param("key") String key, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT m FROM Metric m WHERE m.metricKey = :key AND m.recordedAt BETWEEN :from AND :to ORDER BY m.recordedAt ASC")
    List<Metric> findByKeyAndPeriodOrdered(@Param("key") String key, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT m FROM Metric m WHERE m.metricKey = :key ORDER BY m.recordedAt DESC")
    List<Metric> findLatestByKey(@Param("key") String key, Pageable pageable);
}
