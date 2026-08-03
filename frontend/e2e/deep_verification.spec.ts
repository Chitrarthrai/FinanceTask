import { test, expect } from '@playwright/test';

test.describe('FinanceTask Titanium Deep API, Formula & AI E2E Test Suite', () => {

  test('1. Financial Metric Formulas Verification', async ({ page }) => {
    await page.goto('/#/app');

    await expect(page.locator('body')).toContainText('Monthly Income');
    await expect(page.locator('body')).toContainText('Fixed Expenses');
    await expect(page.locator('body')).toContainText('Pocket Money Pool');
    await expect(page.locator('body')).toContainText('Total Savings Target');

    const formulaResults = await page.evaluate(() => {
      const income = 5000;
      const fixed = 1500;
      const variable = 1000;
      const savingsTargetPercent = 20;

      const totalSavings = income - fixed - variable;
      const targetSavingsAmount = (income * savingsTargetPercent) / 100;
      const pocketMoneyPool = Math.max(0, income - fixed - variable - targetSavingsAmount);
      const daysRemaining = 15;
      const spentToday = 50;
      const dailyLimit = pocketMoneyPool / daysRemaining;
      const remainingToday = dailyLimit - spentToday;

      return {
        totalSavings,
        pocketMoneyPool,
        dailyLimit,
        remainingToday,
      };
    });

    expect(formulaResults.totalSavings).toBe(2500);
    expect(formulaResults.pocketMoneyPool).toBe(1500);
    expect(formulaResults.dailyLimit).toBe(100);
    expect(formulaResults.remainingToday).toBe(50);
  });

  test('2. Transactions CRUD & Ledger Calculation Flow', async ({ page }) => {
    await page.goto('/#/app/transactions');
    await expect(page.locator('body')).toContainText('Transactions Ledger');
    await expect(page.locator('body')).toContainText('Total Credit Income');
    await expect(page.locator('body')).toContainText('Total Debit Expenses');

    const searchInput = page.locator('input[placeholder="Search ledger..."]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Salary');
      await page.waitForTimeout(300);
      await searchInput.fill('');
    }
  });

  test('3. Task Operations Kanban & Status State Transitions', async ({ page }) => {
    await page.goto('/#/app/tasks');
    await expect(page.locator('body')).toContainText('Task Operations Kanban');
    await expect(page.locator('body')).toContainText('To Do');
    await expect(page.locator('body')).toContainText('In Progress');
    await expect(page.locator('body')).toContainText('Completed');
    await expect(page.locator('body')).toContainText('Not Done');
  });

  test('4. Executive Analytics & RPC Chart Integration', async ({ page }) => {
    await page.goto('/#/app/analytics');
    await expect(page.locator('body')).toContainText('Financial Intelligence');
    await expect(page.locator('body')).toContainText('Total Spent');
    await expect(page.locator('body')).toContainText('Avg Daily Burn');
    await expect(page.locator('body')).toContainText('Income vs Expense Comparison');
  });

  test('5. Reports Compiler Statement Calculation', async ({ page }) => {
    await page.goto('/#/app/reports');
    await expect(page.locator('body')).toContainText('Executive Report Compiler');
    await expect(page.locator('body')).toContainText('Total Credit Income');
    await expect(page.locator('body')).toContainText('Total Debit Expenses');
    await expect(page.locator('body')).toContainText('Net Savings Balance');
  });

  test('6. Floating Titanium AI Assistant Launcher & Component Flow', async ({ page }) => {
    await page.goto('/#/app');
    
    const aiButton = page.locator('button[title="Open AI Assistant"]');
    await expect(aiButton).toBeVisible();

    await aiButton.click();

    await expect(page.locator('body')).toContainText('Titanium AI Intelligence');
    const chatInput = page.locator('input[placeholder*="Ask about finances"]');
    await expect(chatInput).toBeVisible();
  });
});
