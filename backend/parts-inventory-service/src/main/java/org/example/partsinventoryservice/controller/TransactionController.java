package org.example.partsinventoryservice.controller;

import org.example.partsinventoryservice.entity.PartTransaction;
import org.example.partsinventoryservice.entity.enum_.TransactionType;
import org.example.partsinventoryservice.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<List<PartTransaction>> getAll() {
        return ResponseEntity.ok(transactionService.getAll());
    }

    @GetMapping("/part/{partId}")
    public ResponseEntity<List<PartTransaction>> getByPart(@PathVariable Long partId) {
        return ResponseEntity.ok(transactionService.getByPart(partId));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<PartTransaction>> getByType(@PathVariable TransactionType type) {
        return ResponseEntity.ok(transactionService.getByType(type));
    }

    @PostMapping("/import")
    public ResponseEntity<PartTransaction> recordImport(
            @RequestParam Long partId,
            @RequestParam int quantity,
            @RequestParam Long staffId,
            @RequestParam(required = false, defaultValue = "Nhập kho thủ công") String note) {
        return ResponseEntity.ok(transactionService.recordImport(partId, quantity, staffId, note));
    }

    @PostMapping("/export")
    public ResponseEntity<PartTransaction> recordExport(
            @RequestParam Long partId,
            @RequestParam int quantity,
            @RequestParam Long staffId,
            @RequestParam(required = false) Long requestId,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false, defaultValue = "Xuất kho thủ công") String note) {
        return ResponseEntity.ok(transactionService.recordExportForRequest(partId, quantity, staffId, requestId, orderId, note));
    }
}
