package com.finflow.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Expense document — shared MongoDB schema between Node.js and Java services.
 *
 * The Node-Flow Agent writes to the "expenses" collection.
 * The Java-Core Agent reads from it for audit/analysis.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "expenses")
@CompoundIndex(name = "user_category_date_idx", def = "{'userId': 1, 'category': 1, 'createdAt': -1}")
@CompoundIndex(name = "user_date_idx", def = "{'userId': 1, 'createdAt': -1}")
@CompoundIndex(name = "category_amount_idx", def = "{'category': 1, 'amount': -1}")
public class Expense {

    @Id
    private String id;

    @Indexed
    private String userId;

    private BigDecimal amount;

    @Indexed
    private String category;

    private String description;

    private String currency;

    private String source;

    private String processedBy;

    @Indexed
    private String status;

    private List<String> tags;

    private Map<String, Object> metadata;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
