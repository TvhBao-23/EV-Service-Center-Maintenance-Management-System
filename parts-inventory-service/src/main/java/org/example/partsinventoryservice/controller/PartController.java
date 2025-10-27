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
        return ResponseEntity.ok(partService.getPartById(id));
    }

    @PostMapping
    public ResponseEntity<Part> addPart(@RequestBody Part part) {
        return ResponseEntity.ok(partService.addPart(part));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Part> updatePart(@PathVariable Long id, @RequestBody Part updatedPart) {
        return ResponseEntity.ok(partService.updatePart(id, updatedPart));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePart(@PathVariable Long id) {
        partService.deletePart(id);
        return ResponseEntity.noContent().build();
    }
}
