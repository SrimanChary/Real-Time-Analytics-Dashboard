package com.analytics.repository;

import com.analytics.model.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    long countByOccurredAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("SELECT COUNT(DISTINCT e.userId) FROM Event e WHERE e.occurredAt BETWEEN :from AND :to AND e.userId IS NOT NULL")
    long countDistinctUsersBetween(
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to);

    @Query("""
        SELECT e.eventType, COUNT(e) as cnt
        FROM Event e
        WHERE e.occurredAt BETWEEN :from AND :to
        GROUP BY e.eventType
        ORDER BY cnt DESC
        """)
    List<Object[]> countByEventTypeGrouped(
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to);

    List<Event> findTop20ByOrderByOccurredAtDesc();

    long countByOccurredAtAfter(LocalDateTime after);
}
