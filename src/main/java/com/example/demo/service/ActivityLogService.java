package com.example.demo.service;

import com.example.demo.entity.ActivityLog;
import com.example.demo.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public void log(String action, String entityType, Long entityId, String details, HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String username = "Anonymous";
        String userRole = "UNKNOWN";

        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            username = authentication.getName();
            userRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(", "));
        }

        String ipAddress = getClientIpAddress(request);

        ActivityLog log = new ActivityLog(username, userRole, action, entityType, entityId, details, ipAddress);
        activityLogRepository.save(log);
    }

    public void log(String action, String entityType, String details, HttpServletRequest request) {
        log(action, entityType, null, details, request);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader != null && !xForwardedForHeader.isEmpty()) {
            return xForwardedForHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAllByOrderByCreatedAtDesc();
    }

    public Page<ActivityLog> getLogsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public List<ActivityLog> getLogsByUsername(String username) {
        return activityLogRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    public List<ActivityLog> getLogsByEntityType(String entityType) {
        return activityLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType);
    }

    public List<ActivityLog> getLogsByAction(String action) {
        return activityLogRepository.findByActionOrderByCreatedAtDesc(action);
    }

    public List<ActivityLog> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return activityLogRepository.findByDateRange(startDate, endDate);
    }

    public List<ActivityLog> getLogsByFilters(String username, String entityType, String action) {
        return activityLogRepository.findByFilters(
            username != null && !username.isEmpty() ? username : null,
            entityType != null && !entityType.isEmpty() ? entityType : null,
            action != null && !action.isEmpty() ? action : null
        );
    }

    public List<String> getDistinctUsernames() {
        return activityLogRepository.findDistinctUsernames();
    }

    public List<String> getDistinctEntityTypes() {
        return activityLogRepository.findDistinctEntityTypes();
    }

    public List<String> getDistinctActions() {
        return activityLogRepository.findDistinctActions();
    }
}
