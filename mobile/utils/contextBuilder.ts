import {
  Transaction,
  BudgetSettings,
  FinancialMetrics,
  Task,
  Category,
} from "../types";

export const buildFinancialContext = (
  transactions: Transaction[],
  metrics: FinancialMetrics,
  budgetSettings: BudgetSettings,
  tasks: Task[] = [],
  categories: Category[] = [],
): string => {
  // --- 1. METRICS & ANALYSIS ---

  // Calculate average daily spending for the current month
  const today = new Date();
  const daysPassed = today.getDate();
  // metrics.spentToday is just for today. We need month-to-date average.

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const thisMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpentThisMonth = thisMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const realAvgDailySpend =
    daysPassed > 0 ? totalSpentThisMonth / daysPassed : 0;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const projectedMonthEndSpend = realAvgDailySpend * daysInMonth;

  const metricsSummary = `
    - Total Income (Month): $${metrics.totalIncome}
    - Total Spent (Month): $${totalSpentThisMonth.toFixed(2)}
    - Daily Limit: $${metrics.dailyLimit?.toFixed(2) || "N/A"}
    - Remaining Daily Limit: $${metrics.remainingToday.toFixed(2)}
    - Budget Health: ${metrics.budgetHealth}
    - Savings Goal: ${budgetSettings.savingsTargetPercent}% of income
    - Avg Daily Spend: $${realAvgDailySpend.toFixed(2)}
    - Projected Month-End Spend: $${projectedMonthEndSpend.toFixed(2)}
  `;

  // --- 2. CATEGORY BREAKDOWN (FULL) ---
  const expensesByCategory: Record<string, number> = {};
  thisMonthTransactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expensesByCategory[t.category] =
        (expensesByCategory[t.category] || 0) + t.amount;
    });

  const categoryBreakdown = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amount]) => {
      // Find category limit if available
      const limit = categories.find((c) => c.name === cat)?.budgetLimit || 0;
      const limitStr = limit > 0 ? ` / $${limit} limit` : "";
      return `- ${cat}: $${amount.toFixed(2)}${limitStr}`;
    })
    .join("\n");

  // --- 3. RECURRING BILL DETECTION (Simple Heuristic) ---
  const recurringCandidates: string[] = [];
  const freqMap: Record<string, number> = {};
  transactions.forEach((t) => {
    const key = `${t.title}-${t.amount}`;
    freqMap[key] = (freqMap[key] || 0) + 1;
  });
  Object.entries(freqMap).forEach(([key, count]) => {
    if (count >= 2) {
      const [title, amount] = key.split("-");
      recurringCandidates.push(`${title} ($${amount})`);
    }
  });
  const recurringSection = recurringCandidates.slice(0, 5).join(", ");

  // --- 4. TASKS & BILLS ---
  const pendingTasks = tasks
    .filter((t) => t.status !== "completed")
    .slice(0, 5) // Limit to top 5 pending
    .map(
      (t) =>
        `- [${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No Date"}] ${t.title} ($${t.amount || 0})`,
    )
    .join("\n");

  // --- 5. RECENT TRANSACTIONS ---
  const recentTransactions = transactions
    .slice(0, 10)
    .map(
      (t) =>
        `- ${new Date(t.date).toLocaleDateString()}: ${t.title} (${t.category}) - $${t.amount} [${t.type}]`,
    )
    .join("\n");

  // --- CONSTRUCT FINAL CONTEXT ---
  return `
    CURRENT DATE: ${today.toLocaleDateString()}
    
    💰 FINANCIAL SNAPSHOT (Current Month):
    ${metricsSummary}

    📊 SPENDING BY CATEGORY:
    ${categoryBreakdown || "No expenses yet this month."}

    📅 PENDING TASKS / BILLS:
    ${pendingTasks || "No pending tasks."}

    🔄 POTENTIAL RECURRING BILLS (Detected):
    ${recurringSection || "None detected yet."}

    📝 RECENT TRANSACTIONS (Last 10):
    ${recentTransactions}

    INSTRUCTIONS:
    - You are a smart, data-driven financial advisor.
    - Answer questions using the specific data provided above.
    - If the user asks about bills, check the "PENDING TASKS" section.
    - If the user asks about trends, reference "Projected Month-End Spend".
    - Be concise but helpful.
    - If data is missing (e.g., no budget limits), mention that.
  `;
};
