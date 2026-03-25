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
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "transactions")
@CompoundIndex(name = "status_date_idx", def = "{'status': 1, 'createdAt': -1}")
@CompoundIndex(name = "category_amount_idx", def = "{'category': 1, 'amount': -1}")
public class Transaction {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String category;

    private BigDecimal amount;

    private String currency;

    private String description;

    @Indexed
    private TransactionStatus status;

    private TransactionType type;

    private Map<String, Object> metadata;

    private String processedByAgent;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum TransactionStatus {
        PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
    }

    public enum TransactionType {
        CREDIT, DEBIT, TRANSFER, REFUND
    }
}
