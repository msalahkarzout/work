package com.example.demo.controller;

import com.example.demo.model.Client;
import com.example.demo.repository.ClientRepository;
import com.example.demo.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")
public class ClientController {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<Client>> getAllClients() {
        return ResponseEntity.ok(clientRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        return clientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createClient(@Valid @RequestBody Client client, HttpServletRequest request) {
        if (client.getEmail() != null && clientRepository.existsByEmail(client.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        Client savedClient = clientRepository.save(client);

        // Log activity
        activityLogService.log("CREATE", "CLIENT", savedClient.getId(),
            String.format("Created client: %s, company: %s, email: %s",
                savedClient.getName(), savedClient.getCompanyName(), savedClient.getEmail()),
            request);

        return ResponseEntity.ok(savedClient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateClient(@PathVariable Long id, @Valid @RequestBody Client clientDetails, HttpServletRequest request) {
        return clientRepository.findById(id)
                .map(client -> {
                    if (clientDetails.getEmail() != null &&
                        !clientDetails.getEmail().equals(client.getEmail()) &&
                        clientRepository.existsByEmail(clientDetails.getEmail())) {
                        return ResponseEntity.badRequest().body("Email already exists");
                    }

                    client.setName(clientDetails.getName());
                    client.setCompanyName(clientDetails.getCompanyName());
                    client.setEmail(clientDetails.getEmail());
                    client.setPhone(clientDetails.getPhone());
                    client.setAddress(clientDetails.getAddress());
                    client.setCity(clientDetails.getCity());
                    client.setPostalCode(clientDetails.getPostalCode());
                    client.setCountry(clientDetails.getCountry());
                    client.setTaxNumber(clientDetails.getTaxNumber());
                    client.setNotes(clientDetails.getNotes());

                    Client savedClient = clientRepository.save(client);

                    // Log activity
                    activityLogService.log("UPDATE", "CLIENT", savedClient.getId(),
                        String.format("Updated client: %s, company: %s",
                            savedClient.getName(), savedClient.getCompanyName()),
                        request);

                    return ResponseEntity.ok(savedClient);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable Long id, HttpServletRequest request) {
        return clientRepository.findById(id)
                .map(client -> {
                    String clientName = client.getName();
                    String companyName = client.getCompanyName();
                    clientRepository.delete(client);

                    // Log activity
                    activityLogService.log("DELETE", "CLIENT", id,
                        String.format("Deleted client: %s, company: %s", clientName, companyName),
                        request);

                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Client>> searchClients(@RequestParam String query) {
        return ResponseEntity.ok(clientRepository.findAll());
    }
}
