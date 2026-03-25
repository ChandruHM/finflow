package com.finflow.controller;

import com.finflow.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Audit Controller — The Java-Core Agent's HTTP interface.
 *
 * Called by the Node-Flow Agent (via tools.ts → callJavaAuditAgent)
 * after every expense is saved to MongoDB.
 *
 * Flow:
 *   Node saves expense → calls POST /api/v1/audit → Java scans history
 *   → returns warnings + insights + spending score → Node relays to UI
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:4000", "${app.frontend.url:}"})
public class AuditController {

    private final AuditService auditService;

    /**
     * POST /api/v1/audit
     *
     * Triggered by the Node-Flow Agent after saving an expense.
     * The Java-Core Agent analyzes the user's spending patterns and returns
     * warnings (e.g., "5 burgers this week → Health Warning") and insights.
     *
     * Request body:
     * {
     *   "userId": "user123",
     *   "category": "Food & Dining",
     *   "latestAmount": 12.00
     * }
     *
     * Response:
     * {
     *   "success": true,
     *   "data": {
     *     "warnings": ["⚠️ Health Warning: You've spent on 'Food' 5 times this week..."],
     *     "insights": ["This week: 8 expenses totaling $156.00"],
     *     "spendingScore": 72,
     *     "auditedBy": "java-core-agent"
     *   }
     * }
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> auditExpense(@RequestBody Map<String, Object> request) {
        String userId = (String) request.getOrDefault("userId", "default-user");
        String category = (String) request.getOrDefault("category", "Miscellaneous");
        BigDecimal latestAmount = new BigDecimal(
            request.getOrDefault("latestAmount", 0).toString()
        );

        log.info("Java-Core Agent: Audit request — user={}, category={}, amount={}",
                userId, category, latestAmount);

        Map<String, Object> auditResult = auditService.auditUserSpending(
                userId, category, latestAmount
        );

        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", auditResult
        ));
    }

    /**
     * GET /api/v1/audit/status
     *
     * Health check for the Java-Core Agent audit subsystem.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuditStatus() {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", Map.of(
                "agent", "Java-Core Agent (Audit)",
                "status", "active",
                "capabilities", java.util.List.of(
                    "Spending pattern analysis",
                    "Category frequency warnings",
                    "Weekly budget tracking",
                    "Health score computation",
                    "BigDecimal financial precision"
                ),
                "thresholds", Map.of(
                    "repeatCategoryPerWeek", 5,
                    "highSingleExpense", "$100",
                    "weeklyBudgetLimit", "$500"
                )
            )
        ));
    }
}
