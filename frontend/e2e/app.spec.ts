import { test, expect } from '@playwright/test';

test.describe('FinanceTask Titanium E2E Test Suite', () => {
  test('1. Landing Page renders branding and CTA buttons', async ({ page }) => {
    await page.goto('/#/');
    await expect(page.locator('body')).toContainText('FinanceTask');
    await expect(page.locator('body')).toContainText('Master Your Cash Flow');
    await expect(page.locator('body')).toContainText('Start Free Workspace');
  });

  test('2. Login Portal renders inputs & triggers', async ({ page }) => {
    await page.goto('/#/login');
    await expect(page.locator('body')).toContainText('Welcome Back');
    await expect(page.locator('body')).toContainText('Email Address');
  });

  test('3. Signup Portal renders registration form', async ({ page }) => {
    await page.goto('/#/signup');
    await expect(page.locator('body')).toContainText('Create Workspace Account');
    await expect(page.locator('body')).toContainText('Full Name');
  });

  test('4. Executive Dashboard Bento Grid loads properly', async ({ page }) => {
    await page.goto('/#/app');
    await expect(page.locator('body')).toContainText('Executive Overview');
    await expect(page.locator('body')).toContainText('Monthly Income');
    await expect(page.locator('body')).toContainText('Fixed Expenses');
    await expect(page.locator('body')).toContainText('Pocket Money Pool');
  });

  test('5. Financial Intelligence Analytics loads charts', async ({ page }) => {
    await page.goto('/#/app/analytics');
    await expect(page.locator('body')).toContainText('Financial Intelligence');
    await expect(page.locator('body')).toContainText('Total Spent');
    await expect(page.locator('body')).toContainText('Avg Daily Burn');
  });

  test('6. Transactions Audit Ledger displays data table & search filters', async ({ page }) => {
    await page.goto('/#/app/transactions');
    await expect(page.locator('body')).toContainText('Transactions Ledger');
    await expect(page.locator('body')).toContainText('Total Credit Income');
    await expect(page.locator('body')).toContainText('Total Debit Expenses');
  });

  test('7. Operations Kanban renders 4 status columns', async ({ page }) => {
    await page.goto('/#/app/tasks');
    await expect(page.locator('body')).toContainText('Task Operations Kanban');
    await expect(page.locator('body')).toContainText('To Do');
    await expect(page.locator('body')).toContainText('In Progress');
    await expect(page.locator('body')).toContainText('Completed');
    await expect(page.locator('body')).toContainText('Not Done');
  });

  test('8. Executive Reports Compiler loads report paper and notes', async ({ page }) => {
    await page.goto('/#/app/reports');
    await expect(page.locator('body')).toContainText('Executive Report Compiler');
    await expect(page.locator('body')).toContainText('Executive Notes & Analysis');
  });

  test('9. Control Panel Settings renders tabs and inputs', async ({ page }) => {
    await page.goto('/#/app/settings');
    await expect(page.locator('body')).toContainText('System Control & Settings');
    await expect(page.locator('body')).toContainText('Profile');
    await expect(page.locator('body')).toContainText('Budget Config');
    await expect(page.locator('body')).toContainText('Categories');
  });

  test('10. P2P Encrypted Transfer Hub renders room generator', async ({ page }) => {
    await page.goto('/#/app/p2p');
    await expect(page.locator('body')).toContainText('Toffee P2P Encrypted Transfer');
    await expect(page.locator('body')).toContainText('Send File');
    await expect(page.locator('body')).toContainText('Receive File');
  });

  test('11. AI Smart Notes workspace renders grid cards', async ({ page }) => {
    await page.goto('/#/app/notes');
    await expect(page.locator('body')).toContainText('AI-Powered Smart Notes');
  });
});
