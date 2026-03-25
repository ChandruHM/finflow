package com.finflow.repository;

import com.finflow.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {

    Page<Transaction> findByUserId(String userId, Pageable pageable);

    Page<Transaction> findByStatus(Transaction.TransactionStatus status, Pageable pageable);

    Page<Transaction> findByCategory(String category, Pageable pageable);

    List<Transaction> findByCreatedAtBetween(Instant from, Instant to);

    long countByStatus(Transaction.TransactionStatus status);

    @Aggregation(pipeline = {
        "{ $group: { _id: '$category', totalAmount: { $sum: '$amount' }, count: { $sum: 1 }, avgAmount: { $avg: '$amount' } } }",
        "{ $sort: { totalAmount: -1 } }"
    })
    List<Map<String, Object>> aggregateByCategory();

    @Aggregation(pipeline = {
        "{ $match: { createdAt: { $gte: ?0, $lte: ?1 } } }",
        "{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, dailyTotal: { $sum: '$amount' }, count: { $sum: 1 } } }",
        "{ $sort: { _id: 1 } }"
    })
    List<Map<String, Object>> dailySummary(Instant from, Instant to);
}
