# FinanceTask: Implementation Task List

This document lists the specific engineering tasks required to implement the missing and partially implemented features identified in [implementation_gap_analysis.md](file:///d:/Chitrarth/Project%20P/FinanceTask/implementation_gap_analysis.md), aligning the project with the product requirements.

---

## 🗄️ 1. Backend & Database Tasks

### Schema Updates
- [x] **Add Categories Budget Limit**
  - Update table `categories` with a numeric `budget_limit` column (decimal/numeric type).
  - Configure foreign keys or validations if needed.
- [x] **Implement Historical Budget Settings snapshots**
  - Create table `budget_history` to store monthly budget setups:
    - Columns: `id` (UUID), `user_id` (UUID), `month_year` (date/timestamp), `monthly_salary` (decimal), `savings_target_percent` (decimal), `fixed_expenses` (jsonb), `variable_expenses` (jsonb), `created_at` (timestamp).
  - Write a Postgres function/trigger to append snapshot rows to `budget_history` whenever `budget_settings` is updated.
- [x] **Expand Tasks Schema**
  - Add `'Not Done'` to task status validation constraints.
  - Add text column `reason_not_done` to table `tasks`.
  - Add timestamp column `completion_time` to table `tasks`.
- [x] **Add Alarms & Notifications Sync Table**
  - Create table `notifications_history` to store alerts for sync across devices:
    - Columns: `id` (UUID), `user_id` (UUID), `task_id` (UUID, optional), `type` (text: alert, alarm, budget_warning), `title` (text), `message` (text), `created_at` (timestamp), `read_at` (timestamp), `expires_at` (timestamp).
  - Add table `push_tokens` to store FCM register endpoints:
    - Columns: `user_id` (UUID), `token` (text), `platform` (text: android, ios), `updated_at` (timestamp).

### Database Functions & Logic
- [x] **Enable Flexible Billing Cycles**
  - Update analytical RPC procedures (`get_monthly_metrics`, `get_category_distribution`, `get_spending_trend`) to accept a dynamic billing start date option instead of hardcoding month day-1 casting intervals.
- [x] **Smart Insights Persistence**
  - Update `get_smart_insights` to write triggered warnings (e.g. category > 80% usage) directly into `notifications_history` so they can be logged and checked for read statuses.

---

## 🎨 2. Titanium Industrial Modern Frontend Redesign

### Phase 1: Stitch Benchmarks & Modular UI Library
- [x] Generate Dark & Light theme concept screens in StitchMCP.
- [x] Configure dual-theme CSS engine in `index.css` (Google Fonts, Light & Dark variables, glassmorphic utilities).
- [x] Build atomic component library (`Button`, `Card`, `Badge`, `Input`, `Select`, `Modal`, `Logo`, `KpiWidget`).

### Phase 2: Navigation & Shell Architecture
- [x] Build liquid glass `Sidebar.tsx` with Framer Motion active route pills & savings KPI widget.
- [x] Build top header chrome `Header.tsx` with live search, currency picker, and user profile drawer.
- [x] Build animated `ThemeToggle.tsx` (Dark 🌙 <-> Light ☀️).
- [x] Build `CurrencySelector.tsx` synchronized with `DataContext`.

### Phase 3: Executive Dashboard Bento Grid
- [x] Reconstruct `Dashboard.tsx` into an asymmetric Bento grid with 4 `KpiWidget` cards, Spending Analysis chart, Daily Limit progress gauge, Recent Transactions list, Task Priority Queue, and floating `UndoToast`.

### Phase 4: Financial Analytics & Intelligence
- [x] Reconstruct `Analytics.tsx` with period selector chrome, Income vs Expense bar comparison, Category Donut chart, Weekly velocity trend area chart, and AI Smart Insights.

### Phase 5: Transactions Audit Ledger
- [x] Reconstruct `Transactions.tsx` with total credit/debit metric cards, category filter pills, search input, and high-contrast data table with single-click edit/delete triggers.

### Phase 6: Operations Kanban & Task Management
- [x] Reconstruct `Tasks.tsx` into a 4-column Operations Kanban ("To Do", "In Progress", "Completed", "Not Done") with drag-and-drop, "Reason Not Done" modal popup, and View switcher.

### Phase 7: Executive Reports & Export Engine
- [x] Reconstruct `Reports.tsx` into a print-ready executive statement compiler with analyst notes box, PDF export, and share controls.

---

## 📱 3. Mobile (React Native + Expo) Tasks

### 💸 Core Mobile Features
- [ ] **SMS Auto-Scraping Service (Critical Feature)**
  - Integrate native SMS reading libraries (e.g. React Native SMS events listeners, Android broadcast receivers).
  - Write parser utilities checking incoming bank shortcodes and debit keyword expressions ("debit", "paid", "transferred").
  - Create a local SQLite/AsyncStorage pending buffer queue to store incoming transaction values for user validation.
  - Build a "Pending Review" screen allowing user approvals/rejections before data syncs to Supabase.
- [ ] **Local Biometrics Integration**
  - Integrate `expo-local-authentication`.
  - Add face/fingerprint validation screen layers during app initialization, checking configuration options in the mobile profile screen.

### 📋 Interactive Task Enhancements
- [ ] **Mobile Swipe-Gesture Kanban Columns**
  - Implement a swipe-based pager component (e.g. `react-native-pager-view` or `ScrollView` pagination) to display columns horizontally with full-width columns.
  - Add headers indicating column positions (`1/4`, `2/4`, `3/4`, `4/4`).
  - Integrate long-press and drag triggers to re-categorize task cards across status columns.
- [ ] **Task Alarm & FCM Notifications Service**
  - Configure `expo-notifications` and map Firebase Cloud Messaging credentials.
  - Implement dynamic alarm schedules triggering full-screen alert sheets with custom alarm sounds, vibration profiles, and snooze selectors.
  - Create checks evaluating whether quiet hours configurations are enabled, silencing alerts during specified times.

### 📷 Data Synchronization
- [ ] **Camera Image Receipts Storage**
  - Setup a file upload pipeline to direct photos taken inside [AddTransactionModal.tsx](file:///d:/Chitrarth/Project%20P/FinanceTask/mobile/components/AddTransactionModal.tsx#L140-L185) straight to the Supabase receipts bucket, mapping their local paths to transaction records.
