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
    public ResponseEntity<List<PartTransaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @PostMapping
    public ResponseEntity<PartTransaction> recordTransaction(
            @RequestParam Long partId,
            @RequestParam TransactionType type,
            @RequestParam int quantity,
            @RequestParam String performedBy
    ) {
        return ResponseEntity.ok(transactionService.recordTransaction(partId, type, quantity, performedBy));
    }
}
