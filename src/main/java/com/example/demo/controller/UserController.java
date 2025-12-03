package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, HttpServletRequest request) {
        return userRepository.findById(id)
                .map(user -> {
                    String username = user.getUsername();
                    String email = user.getEmail();
                    userRepository.delete(user);

                    // Log activity
                    activityLogService.log("DELETE", "USER", id,
                        String.format("Deleted user: %s (%s)", username, email),
                        request);

                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id, HttpServletRequest request) {
        return userRepository.findById(id)
                .map(user -> {
                    boolean oldStatus = user.getEnabled();
                    user.setEnabled(!user.getEnabled());
                    User savedUser = userRepository.save(user);

                    // Log activity
                    activityLogService.log("STATUS_CHANGE", "USER", savedUser.getId(),
                        String.format("Changed user %s status from %s to %s",
                            savedUser.getUsername(), oldStatus ? "ACTIVE" : "INACTIVE", savedUser.getEnabled() ? "ACTIVE" : "INACTIVE"),
                        request);

                    return ResponseEntity.ok(savedUser);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
