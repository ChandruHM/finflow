package com.finflow.service;

import com.finflow.model.Expense;
import com.finflow.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * AuditService — The brain of the Java-Core Agent.
 *
 * WHY JAVA for this?
 * ──────────────────
 * 1. Type safety with BigDecimal — no floating point errors on financial data
 * 2. Superior throughput with Spring's async thread pool for large record volumes
 * 3. Robust aggregation via MongoDB's pipeline (native driver outperforms Mongoose)
 * 4. JVM's GC handles memory-intensive batch scans better than Node's event loop
 *
 * This service scans the user's expense history and generates:
 * - Spending pattern warnings (e.g., "5 burgers this week → Health Warning")
 * - Category-level insights
 * - A spending health score (0-100)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final ExpenseRepository expenseRepository;

    // Thresholds for generating warnings
    private static final int REPEAT_CATEGORY_THRESHOLD = 5;      // 5+ in same category per week
    private static final BigDecimal HIGH_SINGLE_EXPENSE = new BigDecimal("100");  // Single expense > $100
    private static final BigDecimal WEEKLY_BUDGET_LIMIT = new BigDecimal("500");  // Weekly total > $500

    /**
     * Run a full audit for a user after a new expense is saved.
     *
     * @param userId   The user whose spending to audit
     * @param category The category of the latest expense
     * @param latestAmount The amount just spent
     * @return Audit result with warnings, insights, and health score
     */
    public Map<String, Object> auditUserSpending(String userId, String category, BigDecimal latestAmount) {
        log.info("Java-Core Agent: Starting audit for user={}, category={}, amount={}",
                userId, category, latestAmount);

        Instant oneWeekAgo = Instant.now().minus(7, ChronoUnit.DAYS);

        // Fetch recent expenses in this category
        long categoryCount = expenseRepository.countByUserIdAndCategoryAndCreatedAtAfter(
                userId, category, oneWeekAgo
        );

        // Fetch all recent expenses for total calculation
        List<Expense> weeklyExpenses = expenseRepository.findByUserIdAndCreatedAtAfter(
                userId, oneWeekAgo
        );

        // Calculate weekly total
        BigDecimal weeklyTotal = weeklyExpenses.stream()
                .filter(e -> e.getAmount() != null)
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Generate warnings
        List<String> warnings = new ArrayList<>();
        List<String> insights = new ArrayList<>();

        // ─── Warning: Repeated category spending ────────────
        if (categoryCount >= REPEAT_CATEGORY_THRESHOLD) {
            warnings.add(String.format(
                "⚠️ Health Warning: You've spent on '%s' %d times this week. Consider moderating.",
                category, categoryCount
            ));

            // Special health-related warnings for food
            if (category.equalsIgnoreCase("Food & Dining")) {
                warnings.add("🍔 Frequent dining out detected. Consider meal prepping to save money and eat healthier.");
            }
        }

        // ─── Warning: High single expense ───────────────────
        if (latestAmount.compareTo(HIGH_SINGLE_EXPENSE) > 0) {
            warnings.add(String.format(
                "💰 High expense alert: $%s is above your typical spending in '%s'.",
                latestAmount.toPlainString(), category
            ));
        }

        // ─── Warning: Weekly budget exceeded ────────────────
        if (weeklyTotal.compareTo(WEEKLY_BUDGET_LIMIT) > 0) {
            warnings.add(String.format(
                "📊 Budget alert: Weekly spending ($%s) has exceeded the $%s guideline.",
                weeklyTotal.toPlainString(), WEEKLY_BUDGET_LIMIT.toPlainString()
            ));
        }

        // ─── Insights ───────────────────────────────────────
        insights.add(String.format("This week: %d expenses totaling $%s",
                weeklyExpenses.size(), weeklyTotal.toPlainString()));

        insights.add(String.format("'%s' category: %d expense(s) this week", category, categoryCount));

        if (categoryCount > 1 && categoryCount < REPEAT_CATEGORY_THRESHOLD) {
            insights.add(String.format("You're averaging %d '%s' expenses per week — within normal range.",
                    categoryCount, category));
        }

        // ─── Calculate Spending Health Score ─────────────────
        int spendingScore = calculateHealthScore(warnings.size(), weeklyTotal, weeklyExpenses.size());

        insights.add(String.format("Spending health score: %d/100", spendingScore));

        log.info("Java-Core Agent: Audit complete — {} warnings, score={}/100",
                warnings.size(), spendingScore);

        return Map.of(
            "warnings", warnings,
            "insights", insights,
            "spendingScore", spendingScore,
            "weeklyTotal", weeklyTotal,
            "weeklyExpenseCount", weeklyExpenses.size(),
            "categoryFrequency", categoryCount,
            "auditedBy", "java-core-agent",
            "auditTimestamp", Instant.now().toString()
        );
    }

    /**
     * Scoring algorithm — higher is healthier spending behavior.
     *
     * Starts at 100 and deducts for:
     * - Each warning generated (-10)
     * - Exceeding weekly budget (-15)
     * - Too many expenses in a week (-5 per excess)
     */
    private int calculateHealthScore(int warningCount, BigDecimal weeklyTotal, int expenseCount) {
        int score = 100;

        score -= warningCount * 10;

        if (weeklyTotal.compareTo(WEEKLY_BUDGET_LIMIT) > 0) {
            score -= 15;
        }

        if (expenseCount > 20) {
            score -= (expenseCount - 20) * 5;
        }

        return Math.max(0, Math.min(100, score));
    }
}
