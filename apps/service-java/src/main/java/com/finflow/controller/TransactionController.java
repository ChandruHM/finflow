package com.finflow.controller;

import com.finflow.model.Transaction;
import com.finflow.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "${app.frontend.url:}"})
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createTransaction(@Valid @RequestBody Transaction transaction) {
        Transaction created = transactionService.createTransaction(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "success", true,
            "data", created
        ));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        Page<Transaction> transactions = transactionService.getTransactions(page, size, sortBy);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", transactions.getContent(),
            "pagination", Map.of(
                "page", transactions.getNumber(),
                "size", transactions.getSize(),
                "total", transactions.getTotalElements(),
                "pages", transactions.getTotalPages()
            )
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTransactionById(@PathVariable String id) {
        Transaction transaction = transactionService.getTransactionById(id);
        return ResponseEntity.ok(Map.of("success", true, "data", transaction));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getTransactionsByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Transaction> transactions = transactionService.getTransactionsByUserId(userId, page, size);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", transactions.getContent(),
            "pagination", Map.of(
                "page", transactions.getNumber(),
                "total", transactions.getTotalElements()
            )
        ));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        Transaction.TransactionStatus status =
            Transaction.TransactionStatus.valueOf(body.get("status").toUpperCase());
        Transaction updated = transactionService.updateStatus(id, status);
        return ResponseEntity.ok(Map.of("success", true, "data", updated));
    }

    @PostMapping("/{id}/process")
    public ResponseEntity<Map<String, Object>> processTransaction(@PathVariable String id) {
        Transaction transaction = transactionService.getTransactionById(id);
        transactionService.processTransactionAsync(transaction);
        return ResponseEntity.accepted().body(Map.of(
            "success", true,
            "message", "Transaction queued for async processing by Java-Core Agent",
            "transactionId", id
        ));
    }

    @GetMapping("/summary/category")
    public ResponseEntity<Map<String, Object>> getCategorySummary() {
        List<Map<String, Object>> summary = transactionService.getCategorySummary();
        return ResponseEntity.ok(Map.of("success", true, "data", summary));
    }

    @GetMapping("/summary/daily")
    public ResponseEntity<Map<String, Object>> getDailySummary(
            @RequestParam String from,
            @RequestParam String to) {
        List<Map<String, Object>> summary =
            transactionService.getDailySummary(Instant.parse(from), Instant.parse(to));
        return ResponseEntity.ok(Map.of("success", true, "data", summary));
    }

    @GetMapping("/summary/status")
    public ResponseEntity<Map<String, Object>> getStatusSummary() {
        Map<String, Long> counts = transactionService.getStatusCounts();
        return ResponseEntity.ok(Map.of("success", true, "data", counts));
    }
}
