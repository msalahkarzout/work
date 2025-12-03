package com.example.demo.repository;

import com.example.demo.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findAllByOrderByCreatedAtDesc();

    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<ActivityLog> findByUsernameOrderByCreatedAtDesc(String username);

    List<ActivityLog> findByEntityTypeOrderByCreatedAtDesc(String entityType);

    List<ActivityLog> findByActionOrderByCreatedAtDesc(String action);

    @Query("SELECT a FROM ActivityLog a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    List<ActivityLog> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM ActivityLog a WHERE " +
           "(:username IS NULL OR a.username = :username) AND " +
           "(:entityType IS NULL OR a.entityType = :entityType) AND " +
           "(:action IS NULL OR a.action = :action) " +
           "ORDER BY a.createdAt DESC")
    List<ActivityLog> findByFilters(
        @Param("username") String username,
        @Param("entityType") String entityType,
        @Param("action") String action
    );

    @Query("SELECT DISTINCT a.username FROM ActivityLog a ORDER BY a.username")
    List<String> findDistinctUsernames();

    @Query("SELECT DISTINCT a.entityType FROM ActivityLog a ORDER BY a.entityType")
    List<String> findDistinctEntityTypes();

    @Query("SELECT DISTINCT a.action FROM ActivityLog a ORDER BY a.action")
    List<String> findDistinctActions();
}
