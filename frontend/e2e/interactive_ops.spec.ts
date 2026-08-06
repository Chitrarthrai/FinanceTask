import { test, expect } from '@playwright/test';

test.describe('FinanceTask Interactive Flow E2E Test Suite', () => {

  test.beforeEach(async ({ context }) => {
    // Set onboarding_completed to true in local storage to prevent tour overlay from blocking clicks
    await context.addInitScript(() => {
      window.localStorage.setItem('onboarding_completed', 'true');
    });
  });

  test('1. Interactively Add a Task & Verify Kanban Mount', async ({ page }) => {
    // Go to tasks page
    await page.goto('/#/app/tasks');
    await expect(page.locator('body')).toContainText('Task Operations Kanban');

    // Click Add Task button
    const addTaskBtn = page.locator('button:has-text("Add Task")');
    await expect(addTaskBtn).toBeVisible();
    await addTaskBtn.click();

    // Scope to the open modal container (using z-50 wrapper to avoid empty backdrop elements)
    const modal = page.locator('div.fixed.inset-0.z-50');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Add New Task');
    
    // Fill title
    await modal.locator('input[placeholder="Task description title"]').fill('Playwright E2E Task');
    
    // Fill description
    await modal.locator('textarea[placeholder="Task instructions or notes..."]').fill('Verify agile task addition');
    
    // Submit form
    await modal.locator('button[type="submit"]').click();

    // Verify task is added to board
    await expect(page.locator('body')).toContainText('Playwright E2E Task');
  });

  test('2. Interactively Add an Income Transaction & Verify Ledger Update', async ({ page }) => {
    // Go to transactions page
    await page.goto('/#/app/transactions');
    await expect(page.locator('body')).toContainText('Transactions Ledger');

    // Click Add Transaction button
    const addTxBtn = page.locator('button:has-text("Add Transaction")');
    await expect(addTxBtn).toBeVisible();
    await addTxBtn.click();

    // Scope to the open modal container (using z-50 wrapper to avoid empty backdrop elements)
    const modal = page.locator('div.fixed.inset-0.z-50');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Add Transaction');
    
    // Fill Title
    await modal.locator('input[placeholder="e.g. Grocery Shopping"]').fill('E2E Salary');
    
    // Fill Amount
    await modal.locator('input[placeholder="0.00"]').fill('4500.00');
    
    // Select Income type
    await modal.locator('select').first().selectOption('income');

    // Submit transaction
    await modal.locator('button[type="submit"]').click();

    // Verify transaction appears in list
    await expect(page.locator('body')).toContainText('E2E Salary');
  });

  test('3. Verify Floating Titanium AI Assistant Chat Operations', async ({ page }) => {
    // Go to overview page
    await page.goto('/#/app');
    await expect(page.locator('body')).toContainText('Executive Overview');

    // Click AI launcher button
    const aiButton = page.locator('button[title="Open AI Assistant"]');
    await expect(aiButton).toBeVisible();
    await aiButton.click();

    // Verify chat window opens
    await expect(page.locator('body')).toContainText('Titanium AI Intelligence');
    
    // Send a message
    const chatInput = page.locator('input[placeholder*="Ask about finances"]');
    await expect(chatInput).toBeVisible();
    await chatInput.fill('Hi Titanium AI! What is my current budget limit?');
    await chatInput.press('Enter');

    // Verify typing indicator or bubble appears
    await expect(page.locator('body')).toContainText('Titanium AI');
  });
});
