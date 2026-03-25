package com.finflow.service;

import com.finflow.model.Transaction;
import com.finflow.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public Transaction createTransaction(Transaction transaction) {
        transaction.setStatus(Transaction.TransactionStatus.PENDING);
        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction created: {} [{}]", saved.getId(), saved.getType());
        return saved;
    }

    public Page<Transaction> getTransactions(int page, int size, String sortBy) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        return transactionRepository.findAll(pageRequest);
    }

    public Transaction getTransactionById(String id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + id));
    }

    public Page<Transaction> getTransactionsByUserId(String userId, int page, int size) {
        return transactionRepository.findByUserId(userId, PageRequest.of(page, size));
    }

    public Transaction updateStatus(String id, Transaction.TransactionStatus status) {
        Transaction transaction = getTransactionById(id);
        transaction.setStatus(status);
        log.info("Transaction {} status updated to {}", id, status);
        return transactionRepository.save(transaction);
    }

    @Async
    public CompletableFuture<Transaction> processTransactionAsync(Transaction transaction) {
        log.info("Async processing transaction: {}", transaction.getId());
        try {
            // Simulate heavy processing
            Thread.sleep(2000);
            transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
            transaction.setProcessedByAgent("java-core-agent");
            Transaction result = transactionRepository.save(transaction);
            log.info("Transaction {} processed successfully", result.getId());
            return CompletableFuture.completedFuture(result);
        } catch (Exception e) {
            log.error("Failed to process transaction {}: {}", transaction.getId(), e.getMessage());
            transaction.setStatus(Transaction.TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            return CompletableFuture.failedFuture(e);
        }
    }

    public List<Map<String, Object>> getCategorySummary() {
        return transactionRepository.aggregateByCategory();
    }

    public List<Map<String, Object>> getDailySummary(Instant from, Instant to) {
        return transactionRepository.dailySummary(from, to);
    }

    public Map<String, Long> getStatusCounts() {
        return Map.of(
            "pending", transactionRepository.countByStatus(Transaction.TransactionStatus.PENDING),
            "processing", transactionRepository.countByStatus(Transaction.TransactionStatus.PROCESSING),
            "completed", transactionRepository.countByStatus(Transaction.TransactionStatus.COMPLETED),
            "failed", transactionRepository.countByStatus(Transaction.TransactionStatus.FAILED)
        );
    }
}
