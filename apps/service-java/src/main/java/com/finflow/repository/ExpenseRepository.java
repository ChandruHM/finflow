package com.finflow.repository;

import com.finflow.model.Expense;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Repository
public interface ExpenseRepository extends MongoRepository<Expense, String> {

    List<Expense> findByUserIdAndCategoryAndCreatedAtAfter(
        String userId, String category, Instant after
    );

    List<Expense> findByUserIdAndCreatedAtAfter(String userId, Instant after);

    long countByUserIdAndCategoryAndCreatedAtAfter(
        String userId, String category, Instant after
    );

    /**
     * Aggregate spending by category for a given user.
     * Used by the Java-Core Agent during audits.
     */
    @Aggregation(pipeline = {
        "{ $match: { userId: ?0, status: 'confirmed', createdAt: { $gte: ?1 } } }",
        "{ $group: { _id: '$category', totalAmount: { $sum: '$amount' }, count: { $sum: 1 }, avgAmount: { $avg: '$amount' } } }",
        "{ $sort: { totalAmount: -1 } }"
    })
    List<Map<String, Object>> aggregateByUserAndPeriod(String userId, Instant from);

    /**
     * Daily spending trend for a user.
     */
    @Aggregation(pipeline = {
        "{ $match: { userId: ?0, status: 'confirmed', createdAt: { $gte: ?1, $lte: ?2 } } }",
        "{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, dailyTotal: { $sum: '$amount' }, count: { $sum: 1 } } }",
        "{ $sort: { _id: 1 } }"
    })
    List<Map<String, Object>> dailySpendingTrend(String userId, Instant from, Instant to);
}
