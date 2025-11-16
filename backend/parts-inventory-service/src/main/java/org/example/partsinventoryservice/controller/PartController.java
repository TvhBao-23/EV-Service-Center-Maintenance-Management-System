package org.example.partsinventoryservice.controller;

import org.example.partsinventoryservice.entity.Part;
import org.example.partsinventoryservice.service.PartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
public class PartController {

    private final PartService partService;

    public PartController(PartService partService) {
        this.partService = partService;
    }

    @GetMapping
    public ResponseEntity<List<Part>> getAllParts() {
        return ResponseEntity.ok(partService.getAllParts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Part> getPartById(@PathVariable Long id) {
        return ResponseEntity.ok(partService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Part> createPart(@RequestBody Part part) {
        return ResponseEntity.ok(partService.create(part));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Part> updatePart(@PathVariable Long id, @RequestBody Part part) {
        return ResponseEntity.ok(partService.update(id, part));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePart(@PathVariable Long id) {
        partService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
