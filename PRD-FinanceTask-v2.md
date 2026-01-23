# Product Requirements Document (PRD) - FinanceTask

## Integrated Money Management & Task Management Platform (Multi-Page Application)

**Document Version:** 2.0  
**Last Updated:** January 7, 2026  
**Status:** Updated with Multi-Page Architecture & Technology Stack  
**Project Type:** Multi-Page Web & Mobile Application

---

## 1. Executive Summary

FinanceTask is an integrated personal finance and task management platform designed to help individuals optimize their financial planning while organizing their daily activities. This is a **unified project** combining money management and task management that works across web (multi-page React application) and mobile (React Native) platforms.

### Key Characteristics

- **Multi-page web application** with dedicated pages for different functions
- **Overview/Dashboard page** with comprehensive KPIs and financial metrics
- **Unified project**: Money management + Task management integrated together
- **Cross-platform**: Website + Mobile application with real-time sync
- **Automated expense tracking** via bank SMS scraping (mobile)
- **Visual task management** with Kanban board and calendar views

### Vision Statement

Empower individuals to take control of their finances and productivity through an intuitive, integrated, multi-page platform that automates expense tracking and streamlines task management in one unified ecosystem.

### Product Goals

- Provide clear visibility into personal spending patterns and budget allocation through KPI-rich dashboard
- Enable automated expense tracking through bank message scraping (mobile)
- Facilitate efficient task management with visual workflow representation
- Create seamless experience across web pages and mobile platforms
- Build user trust through secure financial data handling
- Present financial data through professional charts and analytics

---

## 2. Platform Architecture Overview

### 2.1 Project Structure (UNIFIED - NOT SEPARATE)

This is **ONE project** with integrated features:

```
FinanceTask Project
├── Web Application (React.js + TypeScript)
│   ├── Multi-Page Architecture
│   │   ├── Dashboard/Overview Page (with KPIs)
│   │   ├── Money Management Pages
│   │   ├── Task Management Pages
│   │   ├── Settings Page
│   │   └── Reports Page
│   ├── State Management (React Hooks)
│   ├── UI Components (shadcn/ui)
│   └── Styling (Tailwind CSS)
│
├── Mobile Application (React Native)
│   ├── Money Management Features
│   ├── Task Management Features
│   ├── Bank SMS Integration
│   └── Calendar & Alerts
│
└── Backend/Database (Supabase)
    ├── PostgreSQL Database
    ├── Authentication
    ├── Real-time Sync
    └── Storage
```

### 2.2 Technology Stack

#### Web Application

| Layer                  | Technology                         | Purpose                         | Justification                                              |
| ---------------------- | ---------------------------------- | ------------------------------- | ---------------------------------------------------------- |
| **Framework**          | React.js + TypeScript              | Component-based UI              | Type safety, reusable components, large ecosystem          |
| **Styling**            | Tailwind CSS                       | Utility-first CSS               | Fast development, consistent design, responsive by default |
| **UI Components**      | shadcn/ui                          | Pre-built accessible components | Customizable, accessibility-first, beautiful defaults      |
| **Icons**              | Lucide React                       | Icon library                    | Consistent, lightweight, easy to customize                 |
| **Charts & Analytics** | Recharts                           | Financial data visualization    | React-based, responsive, interactive charts                |
| **State Management**   | React Hooks (useState, useContext) | Global state                    | Simpler than Redux, sufficient for this scope              |
| **Routing**            | React Router v6                    | Multi-page navigation           | Nested routes, lazy loading support                        |
| **API Client**         | Axios / Fetch API                  | Backend communication           | Promise-based, interceptors support                        |
| **Form Handling**      | React Hook Form                    | Form management                 | Lightweight, good performance, validation support          |
| **Deployment**         | Vercel                             | Hosting & deployment            | Optimized for Next.js/React, auto-scaling, fast CDN        |

#### Mobile Application

| Component           | Technology                    | Purpose                       |
| ------------------- | ----------------------------- | ----------------------------- | ----------------------------------------- |
| **Framework**       | React Native                  | iOS/Android native apps       | Code sharing with web, native performance |
| **Navigation**      | React Navigation              | Multi-screen navigation       | Bottom tabs, stack navigation, drawer     |
| **SMS Integration** | Native SMS API                | Bank message scraping         | Device-level SMS access                   |
| **Local Storage**   | AsyncStorage / SQLite         | Offline data persistence      | Fast, reliable local storage              |
| **Calendar**        | React Native Calendar         | Task scheduling visualization | Date picking, event display               |
| **Notifications**   | React Native Firebase         | Push notifications & alarms   | Cross-platform notifications              |
| **Deployment**      | Apple App Store / Google Play | Distribution                  | Native app stores                         |

#### Backend

| Component          | Technology            | Purpose                   |
| ------------------ | --------------------- | ------------------------- | ---------------------------------------- |
| **Database**       | Supabase (PostgreSQL) | Data storage              | Real-time capabilities, scalable, secure |
| **Authentication** | Supabase Auth         | User management           | Email/password, OAuth, MFA support       |
| **Real-time Sync** | Supabase Realtime     | Live updates              | WebSocket-based, cross-device sync       |
| **File Storage**   | Supabase Storage      | Receipt images, documents | Scalable file storage with CDN           |
| **Hosting**        | Supabase Cloud        | Backend infrastructure    | Managed service, auto-scaling            |

### 2.3 Key Differentiators

- **Unified Solution** - Single project combining finance + tasks (not separate apps)
- **Multi-page Architecture** - Dedicated pages for different functions with professional routing
- **Comprehensive Dashboard** - Overview page with real-time KPIs and financial metrics
- **Automated Expense Detection** - Mobile app automatically captures bank SMS messages
- **Intelligent Daily Pocket Money** - Dynamic distribution based on remaining days
- **Multi-Level Savings** - Structured emergency fund with clear access rules
- **Professional Analytics** - Recharts-based visualizations for spending analysis
- **Cross-Platform Sync** - Real-time sync between web and mobile

---

## 3. Web Application - Multi-Page Architecture

### 3.1 Page Structure & Navigation

The web application consists of the following main pages:

#### **Page Hierarchy:**

```
Root
├── Login / Auth Pages
├── Dashboard (Home) ← Overview Page with KPIs
├── Money Management
│   ├── /money/overview (Money Dashboard)
│   ├── /money/add-expense
│   ├── /money/transactions (Transaction History & Search)
│   ├── /money/categories (Expense Categories Management)
│   └── /money/analytics (Financial Reports & Charts)
├── Task Management
│   ├── /tasks/kanban (Kanban Board View)
│   ├── /tasks/calendar (Calendar View)
│   ├── /tasks/list (List View)
│   └── /tasks/create
├── Settings
│   ├── /settings/profile (User Profile)
│   ├── /settings/budget (Budget Configuration)
│   ├── /settings/preferences (App Preferences)
│   └── /settings/security (Security & Permissions)
├── Reports & Analytics
│   ├── /reports/monthly (Monthly Summary)
│   └── /reports/yearly (Yearly Summary)
└── 404 Not Found
```

### 3.2 Dashboard/Overview Page (Home Page) - KPI Focus

**This is the landing page after login. It shows comprehensive financial and task KPIs.**

#### **Page Purpose:**

- Quick overview of financial health
- Key performance indicators (KPIs) at a glance
- Recent activity summary
- Quick action buttons
- Task progress overview

#### **KPI Dashboard Components:**

**Financial KPIs Section:**

```
┌─ Monthly Overview (Top Cards) ─────────────────────┐
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ Monthly      │  │ Total Fixed  │  │ Variable │  │
│  │ Salary       │  │ Expenses     │  │ Expenses │  │
│  │ ₹75,000      │  │ ₹25,000      │  │ ₹5,000   │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ Monthly      │  │ Pocket Money │  │Emergency │  │
│  │ Savings      │  │ Pool         │  │ Savings  │  │
│  │ ₹10,000      │  │ ₹35,000      │  │ ₹5,000   │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└──────────────────────────────────────────────────────┘

┌─ Daily Pocket Money Status (Prominent) ─────────────┐
│                                                      │
│  Today's Allocation: ₹1,166.67                      │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 75%   │
│  Already Spent: ₹875.00 | Remaining: ₹291.67       │
│                                                      │
│  Days Remaining: 25 | Days Passed: 6                │
│                                                      │
│  [🚨 Alert] Slightly over budget. Use careful       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Key KPI Metrics Displayed:**

| KPI                           | Location      | Value Type | Update Rate |
| ----------------------------- | ------------- | ---------- | ----------- |
| Monthly Salary                | Card          | ₹ amount   | Static      |
| Total Fixed Expenses          | Card          | ₹ amount   | Real-time   |
| Total Variable Expenses       | Card          | ₹ amount   | Real-time   |
| Monthly Savings Target        | Card          | ₹ amount   | Static      |
| Pocket Money Pool             | Card          | ₹ amount   | Real-time   |
| Daily Pocket Money Allocation | Prominent Bar | ₹ amount   | Real-time   |
| Today's Spending              | Prominent Bar | ₹ amount   | Real-time   |
| Emergency Savings Balance     | Card          | ₹ amount   | Real-time   |
| Days Remaining in Month       | Counter       | # days     | Daily       |
| Overspending Flag             | Alert         | Yes/No     | Real-time   |
| Budget Health Score           | Gauge         | %          | Real-time   |

**Charts Section:**

```
┌─ Monthly Breakdown (Pie Chart) ────┐  ┌─ Daily Spending Trend (Line Chart) ─┐
│  Fixed: 33%  ████████            │  │ ₹ 1500                              │
│  Variable: 7% ██                 │  │      ╱╲      ╱╲                    │
│  Pocket: 47%  ███████████        │  │   ╱    ╲  ╱    ╲  ╱               │
│  Savings: 13% ███                │  │ ╱        ╲╱      ╲╱ ₹ 0           │
└────────────────────────────────────┘  │ Day 1  5   10   15   20   25      │
                                         └─────────────────────────────────┘

┌─ Category-wise Spending (Bar Chart) ────────────────────┐
│ Food           ████████████████ ₹2,400                  │
│ Transportation █████ ₹800                              │
│ Entertainment  ██████ ₹950                             │
│ Shopping       ███████ ₹1,100                          │
│ Utilities      ████ ₹600                               │
│ Medical        ██ ₹300                                 │
└─────────────────────────────────────────────────────────┘
```

**Recent Activity Section:**

```
┌─ Last 5 Transactions ──────────────┐  ┌─ Upcoming Tasks (Next 3) ──────────┐
│ • 11:30 AM - Coffee - ₹120         │  │ ✓ Today: Complete project (High)   │
│ • 10:15 AM - Cab - ₹250            │  │ ⚠ Tomorrow: Pay rent (Urgent)      │
│ • Yesterday: Groceries - ₹890      │  │ □ Jan 10: Submit report            │
│ • Yesterday: Movie - ₹400          │  │                                     │
│ • Jan 5: Electricity (Auto) - ₹850 │  │                [View All] [Add New] │
└────────────────────────────────────┘  └─────────────────────────────────────┘
```

**Quick Action Buttons:**

```
[+ Add Expense]  [+ Add Task]  [View Analytics]  [Settings]
```

**Features of Dashboard Page:**

- All KPIs update in real-time as expenses/tasks change
- Color-coded alerts (Green = good, Yellow = warning, Red = critical)
- Responsive charts that adapt to screen size
- One-click navigation to detailed pages
- Mobile-responsive design maintained

---

### 3.3 Money Management Pages

#### **Page: /money/overview**

**Purpose:** Dedicated money management dashboard

**Content:**

- Budget allocation breakdown (cards showing each component)
- Detailed daily pocket money calculation
- Weekly/Monthly trends
- Category breakdown
- Quick add expense button
- Link to transaction history
- Link to analytics

**KPIs on this page:**

- Current pocket money status
- Total spent this month
- Total spent today
- Days remaining calculation
- Budget health percentage
- Forecast: projected remaining money

---

#### **Page: /money/add-expense**

**Purpose:** Manual expense entry form

**Form Fields:**

- Amount (required, decimal input)
- Category (dropdown, required)
- Description (text input, optional)
- Date & Time (date/time pickers, default today)
- Payment Method (dropdown)
- Receipt attachment (optional file upload)
- Notes (textarea, optional)

**Form Behavior:**

- Client-side validation
- Preview of updated pocket money after submission
- Success notification after save
- Option to add another expense or return to dashboard
- Undo option (5 minutes)

**Responsive Design:**

- Desktop: Form in modal or full page
- Mobile: Bottom sheet with form

---

#### **Page: /money/transactions**

**Purpose:** View and search transaction history

**Features:**

- Filterable transaction list
- Search by date range, amount, category, description
- Sort by date, amount, category
- View transaction details (click to expand)
- Delete transaction (with confirmation)
- Export transactions (CSV/PDF)
- Pagination for performance
- Bulk actions (select multiple, delete, export)

**Table/List Display:**

```
Date | Time | Description | Category | Amount | Payment | Actions
─────┼──────┼─────────────┼──────────┼────────┼─────────┼────────
1/7  │11:30 │Coffee       │Food      │₹120    │Cash     │Edit|Del
1/7  │10:15 │Cab - Uber   │Transport │₹250    │Card     │Edit|Del
1/6  │14:00 │Groceries    │Food      │₹890    │Card     │Edit|Del
```

---

#### **Page: /money/categories**

**Purpose:** Manage expense categories

**Features:**

- List all categories (pre-defined + custom)
- Add new category
- Edit category (name, type, color, icon)
- Delete category (with impact analysis)
- Category budget limits (optional per category)
- Category visibility toggle

**Category Form:**

- Name (required)
- Type dropdown (Fixed / Variable / Pocket Money)
- Budget limit (optional)
- Color picker
- Icon selector (from Lucide icons)
- Is Default? (read-only for built-in categories)

---

#### **Page: /money/analytics**

**Purpose:** Detailed financial reports and analytics

**Charts & Visualizations (using Recharts):**

1. **Monthly Breakdown (Pie Chart)**
   - Fixed vs Variable vs Pocket vs Savings
   - Click slice for details
   - Export as image

2. **Daily Spending Trend (Line Chart)**
   - X-axis: Days of month
   - Y-axis: Amount spent
   - Hover for daily details
   - Compare with previous month option

3. **Category-wise Spending (Horizontal Bar Chart)**
   - Top categories by amount spent
   - Click bar to filter transactions
   - Show percentage of total

4. **Spending Velocity (Area Chart)**
   - Cumulative spending over month
   - Target pocket money line
   - Shows if user is over/under budget

5. **Month-over-Month Comparison (Bar Chart)**
   - Compare current month with previous 3 months
   - Categories compared side-by-side

6. **Weekly Breakdown (Grouped Bar Chart)**
   - Week 1, 2, 3, 4 spending
   - Show average per week

**Metrics Displayed:**

- Average daily spending
- Highest spending day
- Lowest spending day
- Total variance from budget
- Top spending category
- Most frequent transaction type

**Export Options:**

- PDF Report (with charts and summary)
- CSV Data (for spreadsheet analysis)
- Image (individual charts)

**Date Range Selector:**

- Today, This Week, This Month, Last 30 Days, Custom Range

---

### 3.4 Task Management Pages

#### **Page: /tasks/kanban**

**Purpose:** Kanban board for task workflow management

**Layout:**

```
Four-column Kanban board:
[To Do]  [In Progress]  [Completed]  [Not Done]
```

**Kanban Features:**

- Drag-and-drop between columns
- Drop animation
- Task cards show:
  - Title
  - Priority (color-coded badge)
  - Due date (if set)
  - Category tag
  - Task count in each column
  - No tasks indicator
- Right-click context menu (Edit, Delete, View Details)
- Keyboard shortcuts (Tab to navigate, Enter to open)

**Mobile Kanban:**

- Horizontal scroll between columns
- Single column visible at a time
- Swipe left/right to navigate columns
- Drag-and-drop with touch support
- Tab navigation option

---

#### **Page: /tasks/calendar**

**Purpose:** Calendar view for task scheduling

**Features:**

- Monthly calendar grid
- Tasks with due dates appear under dates
- Task dots show priority (color-coded)
- Click date to see daily tasks
- Click task to open details
- Drag task to different date to reschedule
- Quick add task button

**Task Indicators on Calendar:**

- Urgent tasks: Red dot
- High priority: Orange dot
- Medium priority: Yellow dot
- Low priority: Blue dot
- Completed tasks: Checkmark overlay
- Overdue tasks: Red background

---

#### **Page: /tasks/list**

**Purpose:** List view of all tasks with filtering

**List Features:**

- Sort by: Due date, Priority, Title, Created date
- Filter by: Status, Category, Priority, Overdue
- Search by title/description
- Show/hide completed tasks
- Bulk actions (mark complete, delete, change priority)
- Expand task to see full description

---

#### **Page: /tasks/create** (Modal or Full Page)

**Purpose:** Create new task

**Form Fields:**

- Title (required, max 100 chars)
- Description (optional, max 500 chars)
- Category (dropdown, optional)
- Priority (Low/Medium/High/Urgent, default Medium)
- Due Date (date picker, optional)
- Due Time (time picker, optional)
- Reminder Type (None/Notification/Alarm/Both)
- Reminder Time (depends on type)
- Tags (optional, multi-select)
- Status (default To Do)

**Form Validation:**

- Title required
- Date cannot be in past
- Time picker only if date selected
- Real-time character count for title/description

---

### 3.5 Settings & Configuration Pages

#### **Page: /settings/profile**

**Purpose:** User profile management

**Content:**

- Profile picture/avatar
- Display name
- Email (read-only)
- Phone number (optional)
- Bio/About (optional)
- Account creation date
- Last login date

---

#### **Page: /settings/budget**

**Purpose:** Budget and salary configuration

**Form:**

- Monthly Salary (number input, required)
- Fixed Expenses (list with add/edit/delete)
  - Item name
  - Monthly amount
- Variable Expenses (list with add/edit/delete)
  - Item name
  - Estimated monthly amount
- Emergency Savings:
  - Amount (fixed) or Percentage (of salary)
  - Current balance (read-only)
  - Access warning toggle
- Savings Target (monthly)

**Budget Summary:**

- Total fixed expenses
- Total variable expenses
- Total budget allocated
- Remaining pocket money
- Visual breakdown

---

#### **Page: /settings/preferences**

**Purpose:** App preferences and behavior settings

**Options:**

- Theme (Light/Dark/System)
- Currency (₹/$/€)
- Date Format (DD/MM/YYYY or MM/DD/YYYY)
- Time Format (12hr/24hr)
- Language (English, Hindi - future)
- Notification Preferences:
  - Enable notifications
  - Enable sounds
  - Quiet hours (start time, end time)
- Expense defaults:
  - Default category
  - Default payment method
- Task defaults:
  - Default priority
  - Default category

---

#### **Page: /settings/security**

**Purpose:** Security and data management

**Options:**

- Change Password (old, new, confirm)
- Two-Factor Authentication:
  - Enable/disable
  - Backup codes
  - Recovery email
- Active Sessions (list, logout from remote sessions)
- Connected Devices
- Privacy Settings:
  - Data export request
  - Account deletion (dangerous zone)
- Bank message permissions (mobile-specific):
  - Banks to monitor
  - Banks to exclude
  - View permission status

---

### 3.6 Reports Page

#### **Page: /reports/monthly**

**Purpose:** Monthly financial summary and report

**Content:**

- Month selector (previous/next navigation)
- Executive summary (key metrics)
- All charts from analytics page
- Category breakdown table
- Spending patterns analysis
- Savings achievement
- Overspending analysis (if any)
- Print option
- Export as PDF

---

#### **Page: /reports/yearly**

**Purpose:** Yearly financial summary

**Content:**

- Year selector
- Yearly comparison charts
- Month-by-month breakdown
- Trends analysis
- Yearly savings total
- Best/worst months
- Print option
- Export as PDF

---

### 3.7 UI/UX Patterns Used in Web App

**Navigation:**

- Top navigation bar with logo, user menu, notifications
- Sidebar or top tab navigation for main sections
- Breadcrumb navigation for deep pages
- Back buttons on detail pages

**Styling Standards (Tailwind CSS):**

- Color scheme:
  - Primary: Teal/Blue (#2D8A8E)
  - Success: Green (#22C55E)
  - Warning: Orange (#F97316)
  - Danger: Red (#EF4444)
  - Neutral: Gray scale
- Typography:
  - Headings: Bold, larger font
  - Body: Regular weight
  - Captions: Smaller, muted color
- Spacing: Consistent 8px base unit
- Shadows: Subtle shadows for depth
- Borders: Rounded corners (6-8px)

**Component Library (shadcn/ui):**

- Buttons (primary, secondary, outline, ghost)
- Input fields (text, number, date, time, select)
- Modals/Dialogs
- Cards
- Dropdowns
- Tabs
- Alerts/Toasts
- Tables
- Badges
- Progress bars
- Spinners

**Icons (Lucide React):**

- Consistent icon set throughout
- Icons for categories (fork/knife for food, etc.)
- Icons for status (checkmark, clock, etc.)
- Priority indicators (star, arrow, etc.)

### 3.7.1 Key Shared Components

**Transaction Modal (Smart Expense Form):**

- **Purpose**: Unified interface for adding expenses/incomes from any page (Dashboard, Transactions).
- **Features**:
  - Receipt Upload & AI Scanning (Gemini integration).
  - Smart category detection.
  - Recurring transaction toggle.
  - Reusable across the application to ensure consistent UX.

### 3.8 AI Financial Assistant (Gemini Integrated)

**Purpose:** A conversational AI interface available globally across the app to answer financial questions and perform actions.

**Features:**

- **Context-Aware:** Knows your current budget, recent transactions, and spending patterns.
- **Actionable:** Can execute commands like "Add transaction" or "Create task" directly from chat.
- **Gemini 2.5 Flash:** Powered by Google's latest model for fast and accurate responses.
- **Floating UI:** Glassmorphism-styled chat widget accessible from any page.

**Capabilities:**

- **Analytics:** "How much did I spend on Food this month?"
- **Budget Checks:** "Can I afford dinner tonight?"
- **Data Entry:** "Add $50 expense for Groceries."
- **Task Management:** "Remind me to pay rent on Friday."

---

## 4. Detailed Feature Requirements

### 4.1 MONEY MANAGEMENT FEATURES

#### 4.1.1 Income & Salary Setup

**Functional Requirement:**

- User can set and update monthly salary/income amount
- Income is treated as the starting point for all budget calculations
- History of salary changes is maintained for reference
- Salary can be edited anytime with updated calculations

**Acceptance Criteria:**

- [ ] User can enter salary amount in settings
- [ ] Salary updates reflect immediately across all calculations
- [ ] System stores previous salary history
- [ ] Salary field is required for system initialization
- [ ] Salary changes update all dependent calculations instantly

---

#### 4.1.2 Expense Categories & Types

**Fixed Expenses (Non-Discretionary)**

- Definition: Expenses that remain constant each month
- Examples: House rent, maid salary, insurance premiums
- System Behavior: Automatically deducted from monthly salary

**Variable Expenses (Semi-Discretionary)**

- Definition: Expenses that fluctuate but are recurring
- Examples: Electricity bills, water bills, internet charges
- System Behavior: User can estimate and include in monthly budget

**Pocket Money (Discretionary Spending)**

- Definition: Remaining amount after fixed and variable expenses
- System Behavior: Automatically divided by remaining days of month
- Allocation: Fresh allocation each month on day 1

**Emergency Savings (Safety Net)**

- Definition: Portion of salary reserved for unforeseen circumstances
- System Behavior: User sets percentage or fixed amount to reserve
- Access Rules: Only accessible when daily pocket money is exhausted
- Visibility: Clearly displayed in dashboard with access warnings

---

#### 4.1.3 Budget Calculation Engine

**Monthly Budget Breakdown:**

```
Monthly Salary = Total Income

Total Fixed Expenses = Sum of all fixed expense items

Total Variable Expenses = Sum of estimated variable expenses

Monthly Savings = Fixed Savings Amount (set by user)

Pocket Money Pool = Monthly Salary
                  - Total Fixed Expenses
                  - Total Variable Expenses
                  - Monthly Savings

Daily Pocket Money = Pocket Money Pool ÷ Remaining Days of Month
```

**Pocket Money Distribution Algorithm:**

When user spends on a given day:

- If Daily Spending ≤ Daily Pocket Money: Normal deduction
- If Daily Spending > Daily Pocket Money: Excess deducted from pocket money pool
- Remaining Days' Pocket Money = Updated Pool ÷ Updated Remaining Days
- If Pool = 0: Subsequent spending draws from Emergency Savings with warning

**Functional Requirements:**

- System automatically calculates budget allocation on day 1 of month
- Daily pocket money is recalculated each day based on remaining days
- Overspending on one day affects subsequent days' pocket money
- Users can view breakdown of budget allocation in dashboard
- Historical budget data is maintained month-to-month

**Acceptance Criteria:**

- [ ] Budget calculations are mathematically accurate
- [ ] Pocket money recalculates daily at midnight
- [ ] Emergency savings access is clearly warned
- [ ] Users can view historical budget data
- [ ] Calculation logic handles edge cases (0 remaining days, month-end, etc.)

---

#### 4.1.4 Expense Tracking (Web)

**Add Expense Manually:**

**Functional Requirements:**

- User can add daily expenses with the following details:
  - Expense amount (required, decimal)
  - Expense category (required) - Fixed, Variable, or Pocket Money
  - Description/notes (optional)
  - Date & time (default: today)
  - Payment method (optional): Cash, Card, UPI, Bank Transfer, etc.
  - Receipt attachment (optional, image file)

**Functional Behavior:**

- Expense is immediately deducted from pocket money or appropriate category
- System displays updated daily pocket money after expense addition
- User receives warning if expense exceeds daily pocket money limit
- All expenses are timestamped and user-attributed
- Real-time update across all pages using Supabase Realtime

**Delete Expense:**

**Functional Requirements:**

- User can delete any expense entry
- Deletion restores the amount to pocket money pool
- Deletion history is logged but not visible to user (for audit purposes)
- Confirmation dialog prevents accidental deletion
- Undo available for 5 minutes after deletion

**Functional Behavior:**

- Pocket money is recalculated after deletion
- System shows previous balance before deletion
- Undo option available for 5 minutes after deletion
- Deleted transactions can be restored from history

**Acceptance Criteria:**

- [ ] Expenses can be added with all required fields
- [ ] Category selection is intuitive (dropdown or toggle)
- [ ] System validates amount format (decimal, positive numbers)
- [ ] Expenses appear in daily ledger immediately
- [ ] Deletion is reversible within 5 minutes
- [ ] Warnings are shown for excess spending
- [ ] Receipt images can be attached (optional)
- [ ] Form validation shows clear error messages
- [ ] Special characters in descriptions handled properly

---

#### 4.1.5 Expense Tracking (Mobile - Auto-Capture Feature)

**Bank Message Scraping:**

**Functional Requirements:**

- Mobile app monitors incoming SMS messages from registered banks
- When payment SMS received (e.g., "Payment of ₹500 at XYZ Store"), system extracts:
  - Transaction amount
  - Timestamp of transaction
  - Merchant name (if available)
  - Transaction type (debit/credit)
- System automatically creates expense entry in FinanceTask
- User can review, edit, or delete auto-captured expenses

**Bank Message Detection Logic:**

- App monitors SMS from known bank short codes (e.g., HDFC = 720720, ICICI = 9215097xxx)
- Keywords detected: "debit", "paid", "purchase", "transferred", "withdrawn"
- Only "debit" transactions are captured as expenses
- Credit transactions (salary, refunds) are ignored in auto-capture
- Accuracy target: > 95% detection rate

**Functional Behavior:**

- Auto-captured expense appears in "Pending Review" section
- User can approve or reject within 24 hours
- Rejected transactions don't affect pocket money
- User can manually edit merchant name and category before approval
- Approved transactions are locked (cannot be edited, only deleted)
- All processing happens locally on device (not sent to servers initially)

**Permissions & Security:**

- App requests SMS read permission during onboarding
- User is informed exactly which bank messages will be monitored
- User can whitelist/blacklist specific banks or numbers
- All message content is processed locally (not sent to servers for processing)
- Only transaction data (amount, timestamp, merchant) is stored on Supabase
- Users can disable SMS scraping anytime in settings

**Acceptance Criteria:**

- [ ] App correctly identifies bank SMS messages
- [ ] Transaction amounts are accurately extracted
- [ ] Auto-captured expenses appear with confirmation request
- [ ] User can approve/reject within dashboard
- [ ] SMS permission is requested clearly
- [ ] Processing is fast (< 2 seconds per message)
- [ ] Failed captures don't break app flow
- [ ] User can view all auto-captured history
- [ ] Accuracy rate > 95%
- [ ] No duplicate capture of same transaction

---

#### 4.1.6 Daily Dashboard & Analytics

**Key Metrics Displayed (Real-time with Recharts):**

| Metric                                   | Location          | Refresh Rate     | Data Source |
| ---------------------------------------- | ----------------- | ---------------- | ----------- |
| Monthly Salary                           | Header Card       | Static           | Supabase    |
| Total Fixed Expenses                     | Overview Card     | Real-time        | Supabase    |
| Total Variable Expenses                  | Overview Card     | Real-time        | Supabase    |
| Monthly Savings Target                   | Overview Card     | Static           | Supabase    |
| Available Pocket Money (Remaining Month) | Prominent Display | Real-time        | Calculated  |
| Daily Pocket Money (Today's Allocation)  | Prominent Display | Real-time        | Calculated  |
| Today's Spending                         | Daily Card        | Real-time        | Supabase    |
| Emergency Savings Balance                | Card with Warning | Real-time        | Supabase    |
| Days Remaining in Month                  | Counter           | Daily (midnight) | System      |
| Overspending Flag                        | Alert Badge       | Real-time        | Calculated  |
| Budget Health Score (%)                  | Progress Bar      | Real-time        | Calculated  |

**Analytics Charts (Recharts Implementation):**

1. **Monthly Expense Breakdown (Pie Chart)**
   - Fixed vs Variable vs Pocket vs Savings percentages
   - Interactive tooltips on hover
   - Click segment to drill down
   - Legend with exact amounts
   - Export as image

2. **Daily Spending Trend (Line Chart)**
   - X-axis: Days 1-31 of month
   - Y-axis: Amount spent (₹)
   - Line shows cumulative spending
   - Hover shows daily amount and running total
   - Compare with previous month option (overlay)
   - Target pocket money line (horizontal reference)

3. **Category-wise Spending (Horizontal Bar Chart)**
   - Top 5-10 categories by total spent
   - Show percentage of pocket money used
   - Show absolute amount spent
   - Click bar to filter transaction list
   - Sort by amount or frequency

4. **Spending Velocity (Area Chart)**
   - Cumulative spending over month
   - Target pocket money line (reference)
   - Shows if user is over/under budget
   - Color changes if exceeding target (green → yellow → red)

5. **Weekly Breakdown (Grouped Bar Chart)**
   - Week 1, 2, 3, 4 spending comparison
   - Show average per week
   - Compare weeks side-by-side
   - Identify peak spending weeks

**Functional Behavior:**

- Dashboard loads all data from Supabase on app open
- Real-time updates when expense is added/deleted (Supabase Realtime)
- User can filter by date range, category, payment method
- Export option available for monthly summary (PDF/CSV)
- Charts are responsive and mobile-friendly
- Charts use Recharts responsive container for auto-resize
- Performance optimized for large datasets (1000+ transactions)

**Acceptance Criteria:**

- [ ] All metrics are calculated correctly
- [ ] Dashboard updates within 1 second of expense change
- [ ] Charts render smoothly with no lag (60 FPS on web)
- [ ] Date filters work across all metrics
- [ ] Export formats are readable and complete
- [ ] Mobile responsive design maintained
- [ ] Charts are accessible (alt text, keyboard navigation)
- [ ] Charts don't flicker during updates

---

#### 4.1.7 Transaction History & Search

**Functional Requirements:**

- Complete transaction log showing all expenses with:
  - Date & time (sortable)
  - Amount (sortable)
  - Category (filterable)
  - Description/notes
  - Payment method (filterable)
  - Receipt (if attached, clickable to view)
  - Status (approved, pending, rejected)

**Search & Filter Functionality:**

- Search by date range (start date to end date)
- Search by amount range (min-max)
- Search by category (multi-select)
- Search by description keywords (full-text)
- Search by payment method (multi-select)
- Search by status (approved, pending, rejected)
- Filter combinations allowed (e.g., "Coffee category in last 7 days, amount > 50")
- Sorting options: Date (ascending/descending), Amount (low-high), Category (A-Z)

**Functional Behavior:**

- Search results update as user types (debounced, 300ms)
- Results show total count and sum of matching transactions
- Each transaction is selectable for detailed view
- Bulk actions available: Delete multiple, export multiple
- Pagination or infinite scroll for performance
- Save filter combinations (future feature)

**Acceptance Criteria:**

- [ ] Search is fast for large datasets (1000+ transactions)
- [ ] Multiple filters can be applied simultaneously
- [ ] Results are accurate and complete
- [ ] Sorting works on all metrics
- [ ] Bulk delete shows confirmation dialog
- [ ] Export includes selected filters
- [ ] No lag with real-time updates

---

#### 4.1.8 Settings & Expense Categories Management

**Functional Requirements:**

- User can create custom expense categories
- Pre-defined categories available:
  - Food & Dining
  - Transportation
  - Entertainment
  - Utilities
  - Medical & Health
  - Shopping
  - Subscriptions
  - Other
- User can mark categories as Fixed, Variable, or Pocket Money
- Categories can be edited or deleted
- Default categories cannot be deleted but can be hidden
- Categories have icons (from Lucide icon set) for visual identification

**Category Properties:**

- Category name (required, unique)
- Category type (Fixed/Variable/Pocket Money)
- Monthly budget limit (optional, for alerts)
- Icon (selected from Lucide React icons)
- Color (from color palette)
- Visibility toggle (show/hide in dropdown)
- Is Default? (read-only for built-in categories)

**Functional Behavior:**

- New expenses must be assigned to an existing category
- Changing category type requires confirmation
- Deleting category with existing transactions shows:
  - Count of affected transactions
  - Option to reassign to different category or delete transactions
- Budget limit notifications trigger when:
  - Category spending reaches 80% of budget
  - Category spending reaches 100% of budget (warning)
  - Category spending exceeds budget (alert)

**Acceptance Criteria:**

- [ ] Custom categories can be created without limits
- [ ] Category deletion shows impact on existing transactions
- [ ] Budget limits trigger notifications at 80% and 100%
- [ ] Category icons/colors are visually distinct
- [ ] Changes propagate to all expense records
- [ ] Categories display consistently across all pages

---

### 4.2 TASK MANAGEMENT FEATURES

#### 4.2.1 Task Structure (Web & Mobile)

**Task Properties:**

- Title (required, max 100 characters)
- Description (optional, max 500 characters)
- Status (required): To Do, In Progress, Completed, Not Done
- Priority level (Low, Medium, High, Urgent - default Medium)
- Due date (optional, date picker)
- Due time (optional, time picker)
- Category/Project (optional, predefined or custom)
- Assignee (future: multi-user version)
- Created date (auto-generated)
- Updated date (auto-updated)
- Tags/Labels (optional, multiple, max 10)
- Completion time (auto-set when moved to Completed)
- Reason for not done (optional, text field for Not Done status)

---

#### 4.2.2 Task Workflow - Kanban Board (Web)

**Functional Requirements:**

- Four-column Kanban board layout:
  1. **To Do** - New tasks and tasks not yet started
  2. **In Progress** - Currently being worked on
  3. **Completed** - Successfully finished
  4. **Not Done** - Abandoned or incomplete tasks
- Drag-and-drop functionality:
  - User can drag task card between columns
  - Drop on target column updates task status
  - Smooth animation during drag operation (using CSS transitions)
  - Task order within column is preserved
  - Visual drop zone indicator shows where task will land

**Functional Behavior:**

- Moving task to "Completed" marks completion time
- Moving task to "Not Done" shows optional dialog for reason
- Task timestamps update when status changes
- Kanban board state is persisted to Supabase immediately
- Multi-user conflicts handled (last-write-wins with notification)
- Empty state message shown for empty columns
- Column count badges show number of tasks

**Mobile Kanban (React Native):**

- Horizontal scroll between columns
- Single column visible at a time
- Column headers indicate position (1/4, 2/4, etc.)
- Swipe left/right to navigate between columns
- Drag-and-drop optimized for touch:
  - Long-press to select
  - Visual feedback during drag
  - Smooth animations

**Acceptance Criteria:**

- [ ] Drag-and-drop is smooth and responsive
- [ ] Column updates are immediate and persisted
- [ ] Tasks don't disappear during drag operations
- [ ] Drop zones are clearly indicated
- [ ] Mobile view adapts drag-and-drop (touch-friendly)
- [ ] Empty state messages shown for empty columns
- [ ] Performance good with 100+ tasks
- [ ] Animations don't cause lag

---

#### 4.2.3 Task Creation & Editing (Web & Mobile)

**Create Task:**

**Functional Requirements:**

- Quick add button in top-right (+ icon) or FAB (mobile)
- Opens modal or form with all task properties
- Pre-filled fields: Created date (today), Status (To Do)
- Validation: Title is required, all other fields optional
- Submit button is disabled until title is entered
- Cancel button closes form without saving

**Functional Behavior:**

- Task is created in "To Do" column by default
- Success notification appears after creation
- Modal closes and new task appears in To Do column
- Form resets for next task creation (or closes based on user preference)
- Task is immediately saved to Supabase

**Edit Task:**

**Functional Requirements:**

- Click on task card to open detailed view
- All properties editable except created date
- Changes auto-save as user types (debounced 1 second)
- Delete button available in detailed view with confirmation
- Close button to return to Kanban

**Functional Behavior:**

- Edit modal shows all task details
- Changes are saved to Supabase with timestamp
- Edit history maintained (not visible in MVP, but logged)
- Concurrent edits: Last-write-wins, with conflict notification
- Save indicator shows when changes are being saved

**Acceptance Criteria:**

- [ ] Task creation is quick (< 3 clicks)
- [ ] Title validation prevents empty tasks
- [ ] Edits auto-save without losing data
- [ ] Delete requires confirmation
- [ ] Form validation is clear with error messages
- [ ] Special characters in title are handled properly
- [ ] Form displays correctly on mobile

---

#### 4.2.4 Task Scheduling & Reminders (Web & Mobile)

**Functional Requirements:**

- Each task can have:
  - **Due Date** (optional) - Date when task should be completed
  - **Due Time** (optional) - Specific time for task completion
  - **Reminder** (optional) - Notification settings

**Reminder Options (Web):**

- No reminder
- On due date (morning, 9 AM)
- 1 day before due date (morning, 9 AM)
- 1 hour before due time
- 30 minutes before due time
- Custom reminder (time picker)
- Multiple reminders per task (future feature)

**Reminder Options (Mobile - Two Types):**

1. **Push Notification** (In-app notification)
   - Appears as banner at top of screen (React Native notification)
   - Dismissible with swipe
   - Tappable to open task details
   - Does not interrupt user activity
   - Silent by default

2. **Alarm** (Device alarm, more intrusive)
   - Full-screen alert dialog
   - Device sound notification (customizable)
   - User must acknowledge/dismiss
   - For critical deadline tasks
   - Can include vibration patterns
   - Not affected by silent mode (alert tone plays)

**Reminder Configuration (Mobile):**

- User can set per-task which type:
  - Notification only (silent, non-intrusive)
  - Notification + Alarm (both triggered)
  - Alarm only (high-priority)
- System default: Notification for most tasks, Alarm for marked critical tasks
- Quiet hours: User can set timeframe (e.g., 10 PM - 8 AM) when no alarms sound
- Notifications respect quiet hours, but can be snoozed/dismissed

**Functional Behavior (Web):**

- Browser notifications sent at scheduled time (if browser tab open)
- Tasks with due dates in past shown in "Overdue" section
- Visual indicators (red color, exclamation mark) for overdue tasks
- Reminder status shown in task card (bell icon with checkmark)
- Snooze option available on notification (5 min, 1 hour, 1 day, 1 week)

**Functional Behavior (Mobile):**

- Notification/Alarm delivered at scheduled time even if app closed
- Notification uses native Firebase Cloud Messaging (FCM)
- Alarm plays configured sound and vibration
- Both require device permissions granted during onboarding
- Notification history accessible from app settings
- Reminder delivery guaranteed even with app killed (Firebase)

**Acceptance Criteria:**

- [ ] Reminders trigger at correct time (web & mobile)
- [ ] Alarms play selected sound properly (mobile)
- [ ] Quiet hours are respected
- [ ] User can test notifications/alarms
- [ ] Notification history retained for 30 days
- [ ] Permissions properly requested and documented
- [ ] Multiple reminders per task work correctly (future)
- [ ] Snooze functionality works properly

---

#### 4.2.5 Task Categories & Filtering (Web)

**Functional Requirements:**

- Tasks can be grouped by categories (Projects/Labels):
  - Work
  - Personal
  - Health
  - Finance
  - Shopping
  - Learning
  - Custom categories (user-created)

**Filter Options:**

- By category/project (multi-select)
- By priority level (multi-select)
- By due date (Today, This Week, Overdue, All)
- By status (To Do, In Progress, Completed, Not Done)
- By tags (multi-select)
- Filter combinations allowed

**Search Functionality:**

- Search by task title (partial match)
- Search by description keywords (full-text)
- Full-text search across all task properties
- Search results update as user types (debounced)

**Functional Behavior:**

- Filters persist when user navigates away and returns
- Filter count badge shows number of active filters
- Clear all filters button available
- Filtered results shown across all Kanban columns
- Search highlights matching words in results
- Filter/search performance optimized for smooth interaction

**Acceptance Criteria:**

- [ ] Filters work individually and in combinations
- [ ] Search results update in real-time
- [ ] Performance remains acceptable with 1000+ tasks
- [ ] Filter state is saveable (future feature)
- [ ] Clear filters button resets all active filters

---

### 4.3 MOBILE APPLICATION - REACT NATIVE

#### 4.3.1 Task Management on Mobile (React Native)

**Calendar Integration:**

**Functional Requirements:**

- Tasks with due dates appear on calendar view
- Calendar shows:
  - Monthly calendar grid
  - Tasks listed under each date
  - Task priority indicated by color coding
  - Task count badge on dates with multiple tasks
- Tap on date shows all tasks for that day
- Tap on task opens detail view
- Drag task to different date to reschedule (future feature)

**Functional Behavior:**

- Tasks are color-coded by priority:
  - Urgent (Red #EF4444)
  - High (Orange #F97316)
  - Medium (Yellow #EAB308)
  - Low (Blue #3B82F6)
- Tasks with no due date hidden from calendar
- Current date highlighted
- Navigation between months smooth
- Tasks sync across web and mobile (Supabase Realtime)
- Calendar uses React Native Calendar library
- Swipe to navigate between months

**Acceptance Criteria:**

- [ ] All tasks with due dates visible on calendar
- [ ] Color coding matches priority levels
- [ ] Calendar navigation smooth
- [ ] Sync works between web and mobile
- [ ] Performance good with 100+ tasks

---

#### 4.3.2 Notifications & Alarms (Mobile - React Native)

**Push Notification (In-app):**

**Functional Requirements:**

- Appears as banner at top of screen
- Shows task title and priority
- Dismissible with swipe or tap
- Tappable to open task details
- Does not interrupt user activity
- Uses React Native notification library
- Silent by default (no sound)

**Functional Behavior:**

- Notification appears for 5 seconds then auto-dismisses
- User can tap to open task immediately
- No sound plays unless user configured for specific task
- Notification delivered even with app in background
- FCM (Firebase Cloud Messaging) integration

**Alarm (Full-Screen Alert):**

**Functional Requirements:**

- Full-screen alert dialog appears
- Device sound notification plays (user-selected sound)
- Vibration pattern (customizable)
- User must acknowledge by tapping button
- For critical deadline tasks
- More intrusive than notification
- Cannot be dismissed by swipe

**Alarm Configuration:**

- Sound options:
  - Default alarm tone
  - Custom selected tone
  - Silent (vibration only)
- Vibration pattern:
  - No vibration
  - Single vibration
  - Multiple vibrations (pattern)
- Volume: Respects system volume but can override for alarms

**Functional Behavior:**

- Alarm plays even if device in silent mode
- Alarm continues until user acknowledges
- User can snooze alarm (5 min, 15 min, 30 min, 1 hour)
- Snooze reschedules alarm for selected duration
- Alarm logged in history

**Reminder Configuration (Mobile):**

- Per-task reminder type:
  - No reminder
  - Notification only
  - Alarm only
  - Notification + Alarm
- Global quiet hours (10 PM - 8 AM default):
  - Notifications still delivered but silent
  - Alarms don't sound during quiet hours (unless urgent)
  - User can override for specific tasks
- Test notification/alarm button in settings

**Acceptance Criteria:**

- [ ] Notifications deliver at correct time
- [ ] Alarms play selected sound properly
- [ ] Quiet hours are respected
- [ ] User can test notifications/alarms
- [ ] Notification history retained for 30 days
- [ ] Permissions properly requested (POST_NOTIFICATIONS)
- [ ] Snooze functionality works correctly
- [ ] Alarms continue until acknowledged

---

#### 4.3.3 Mobile Task Kanban (React Native)

**Functional Requirements:**

- Simplified Kanban view optimized for mobile:
  - Horizontal scrolling between columns
  - Single column visible at a time (full width)
  - Column headers indicate position (1/4, 2/4, etc.)
  - Swipe animation between columns
  - Tab-based navigation between columns (alternative)
- Drag-and-drop within visible column:
  - Supports touch gestures
  - Visual feedback during drag
  - Drop zone highlight

**Functional Behavior:**

- Drag-and-drop same as web version but touch-optimized
- Animations optimized for mobile devices (60 FPS)
- Long-press on task opens context menu:
  - Edit
  - Delete
  - View Details
  - Change Priority
- Double-tap to quick-open task details
- Swipe left/right between columns (smooth animation)
- Pull-to-refresh to sync with Supabase

**Acceptance Criteria:**

- [ ] Kanban columns clearly visible on mobile
- [ ] Drag-and-drop works smoothly on touch devices
- [ ] No horizontal scroll lag
- [ ] Column headers clear about position
- [ ] Touch targets are large enough (44px minimum)
- [ ] Animations smooth at 60 FPS
- [ ] Context menu accessible

---

#### 4.3.4 Mobile Money Management (React Native)

**Functional Requirements:**

- All web features available on mobile:
  - View budget breakdown
  - Add expenses (manual and auto-captured)
  - View daily pocket money allocation
  - View emergency savings balance
  - Access transaction history
  - View analytics dashboard (simplified charts)
  - Manage expense categories
  - Settings and preferences

**Mobile-Specific Enhancements:**

- Quick expense add (Floating Action Button - FAB)
- Bottom navigation: Money / Tasks / More
- Streamlined forms optimized for mobile input
- Simplified charts (touch-friendly, Recharts on web, native charts on mobile)
- Single-click to view detailed transaction
- Expense camera integration (snap receipt photo)
- Biometric authentication (Face ID / Fingerprint)

**Functional Behavior:**

- Data syncs in real-time with web version (Supabase Realtime)
- Expense camera integration:
  - Open device camera
  - Snap receipt photo
  - Attach to expense (optional)
  - Store in Supabase Storage
- Fingerprint/Face ID authentication support:
  - Local biometric auth
  - Fallback to password if biometric not available
  - User can enable/disable in settings
- Offline support (limited):
  - Expenses can be added offline
  - Changes synced when connectivity restored

**Bottom Tab Navigation:**

1. **Money** Tab
   - Dashboard with budget summary
   - Quick expense add (FAB)
   - Recent transactions preview
   - Quick access to transaction history
   - Categories shortcut

2. **Tasks** Tab
   - Kanban board view (primary)
   - Calendar toggle
   - Quick add task (FAB)
   - Filter/search options
   - Today's tasks highlight

3. **More** Tab
   - Settings
   - Profile
   - App info
   - Help & Support
   - Logout

**Acceptance Criteria:**

- [ ] All features work smoothly on mobile
- [ ] Forms optimized for mobile keyboards
- [ ] Performance acceptable on 3G networks
- [ ] Biometric login supported
- [ ] Camera permissions handled properly
- [ ] Real-time sync works with web
- [ ] Bottom tabs accessible and clear

---

---

### 4.4 P2P FILE SHARING FEATURES

#### 4.4.1 Direct Device-to-Device Sharing (Web & Mobile)

**Overview:**
Integrated file transfer system allowing users to send files directly between their devices (Web ⇄ Mobile, Mobile ⇄ Mobile, Web ⇄ Web) without storing files on the server. This ensures privacy and eliminates server storage costs for transient file transfers.

**Core Technology:**

- **WebRTC:** For peer-to-peer data channels (streaming file chunks directly).
- **Supabase Realtime:** For signaling (exchanging connection details: Offer/Answer/ICE candidates).
- **Direct Connection:** No file size limits (server-side), high speed on local networks, end-to-end encrypted.

**Workflows:**

**1. Sender Workflow:**

- **Select Mode:** User chooses "Send File".
- **Room Generation:** System generates a unique, short 6-character Room ID (e.g., `K9X2P1`).
- **File Selection:** User picks a file (Image, Document, Video, etc.).
- **Wait State:** App shows the Room ID big and bold, waiting for peer to join.
- **Transfer:** Once Receiver connects, transfer can start automatically or via "Send" button.
- **Feedback:** Progress bar shows upload percentage.

**2. Receiver Workflow:**

- **Select Mode:** User chooses "Receive File".
- **Input Code:** User enters the 6-character Room ID provided by Sender.
- **Connection:** System uses Supabase Realtime to find the room and establish WebRTC handshake.
- **Download:** Once connected, file chunks are received and reassembled.
- **Feedback:** Progress bar shows download percentage.
- **Completion:** File is saved to device (Downloads folder on Web, File System/Share Sheet on Mobile).

**Functional Requirements:**

- **Cross-Platform Compatibility:**
  - Web Client (React + simple-peer logic)
  - Mobile Client (React Native + react-native-webrtc)
  - Must support Web-to-Mobile, Mobile-to-Web, and Mobile-to-Mobile flows.
- **Real-time Feedback:**
  - Visual status indicators: Idle, Waiting, Connecting, Connected, Transferring, Completed.
  - Percentage progress bar on both screens.
- **Error Handling:**
  - Auto-reconnect or clear error messages for "Peer disconnected", "Invalid ID", "Network Error".
  - Graceful handling of large files (chunking).

**UI/UX Requirements:**

- **Theming:** Full support for Light and Dark modes matching system preference.
- **Responsiveness:** Mobile UI optimized for touch, Web UI optimized for drag-and-drop.
- **Clarity:** Room IDs must be easy to read (uppercase, large font).

---

## 5. Technical Architecture & Implementation

### 5.1 Technology Stack (Comprehensive)

#### Frontend - Web Application (React.js + TypeScript)

**Core Framework:**

```
React 18+
TypeScript 5+
React Router v6 (routing)
```

**UI & Styling:**

```
Tailwind CSS (utility-first CSS)
shadcn/ui (component library)
Lucide React (icons - 1000+ icons)
```

**Data Visualization:**

```
Recharts (charts & analytics)
  - LineChart (daily spending trend)
  - BarChart (category breakdown)
  - PieChart (budget allocation)
  - AreaChart (spending velocity)
  - ResponsiveContainer (responsive charts)
```

**State Management & Data:**

```
React Hooks:
  - useState (component state)
  - useContext (global state - auth, user)
  - useReducer (complex state - budget calculations)
  - useCallback (performance optimization)
  - useMemo (expensive calculations)

Real-time Data:
  - Supabase Realtime SDK
  - Auto-syncing with database changes
  - Real-time notifications
```

**Forms & Validation:**

```
React Hook Form (lightweight form management)
Zod (runtime schema validation)
  - Type-safe form validation
  - Auto-validation feedback
```

**Date & Time:**

```
date-fns (date manipulation)
React DatePicker (date selection)
```

**HTTP Client:**

```
Supabase JavaScript SDK (all API calls)
  - Authentication
  - Database operations
  - Real-time subscriptions
  - File storage
```

**Notifications & Feedback:**

```
React Toastify or Sonner (toast notifications)
  - Success messages
  - Error messages
  - Confirmation dialogs
```

**Performance & Build:**

```
Vite (build tool)
  - Fast development server
  - Optimized production builds
  - Code splitting
```

**Directory Structure:**

```
src/
├── components/
│   ├── shared/          (reusable UI components)
│   ├── Money/           (money management components)
│   ├── Tasks/           (task management components)
│   ├── Layout/          (header, sidebar, navigation)
│   └── Charts/          (Recharts components)
├── pages/
│   ├── Dashboard.tsx
│   ├── Money/
│   │   ├── Overview.tsx
│   │   ├── AddExpense.tsx
│   │   ├── Transactions.tsx
│   │   ├── Categories.tsx
│   │   └── Analytics.tsx
│   ├── Tasks/
│   │   ├── Kanban.tsx
│   │   ├── Calendar.tsx
│   │   ├── List.tsx
│   │   └── Create.tsx
│   ├── Settings/
│   ├── Reports/
│   ├── Auth/
│   └── NotFound.tsx
├── hooks/               (custom React hooks)
│   ├── useBudget.ts     (budget calculations)
│   ├── useTasks.ts      (task management)
│   ├── useAuth.ts       (authentication)
│   └── useFetch.ts      (data fetching)
├── context/             (React Context)
│   ├── AuthContext.tsx
│   ├── BudgetContext.tsx
│   └── NotificationContext.tsx
├── services/            (business logic)
│   ├── supabaseClient.ts
│   ├── budgetService.ts
│   ├── taskService.ts
│   └── expenseService.ts
├── types/               (TypeScript interfaces)
│   ├── index.ts
│   └── supabase.ts
├── utils/               (utility functions)
│   ├── calculations.ts
│   ├── formatters.ts
│   └── validators.ts
├── styles/              (global styles)
│   └── globals.css
├── App.tsx
└── main.tsx
```

---

#### Frontend - Mobile Application (React Native)

**Core Framework:**

```
React Native 0.72+
TypeScript 5+
React Navigation 6+ (navigation)
Expo (optional - for rapid development)
```

**UI Components & Styling:**

```
React Native Paper (Material Design components)
or
React Native Elements (UI components)
or
Native Base (cross-platform UI)

NativeWind (Tailwind CSS for React Native)
```

**State Management:**

```
React Hooks (useState, useContext)
Zustand or Redux Toolkit (if needed)
AsyncStorage (local persistence)
SQLite (offline-first database)
```

**Data Visualization (Mobile):**

```
react-native-chart-kit (native charts)
or
Victory Native (Recharts equivalent)
```

**Data & API:**

```
Supabase React Native SDK
  - Real-time synchronization
  - Authentication
  - Database operations
  - File storage

Axios (HTTP client)
```

**SMS Integration (Mobile):**

```
react-native-sms-parse (parse SMS messages)
react-native-read-sms (read SMS on Android)
Native iOS SMS framework
```

**Notifications & Alerts (Mobile):**

```
React Native Firebase Cloud Messaging (push notifications)
React Native Alarm Manager (alarms)
React Native Vibration (haptics/vibration)
React Native Sound (audio playback)
```

**Calendar (Mobile):**

```
React Native Calendar (calendar UI)
or
react-native-calendars (more customizable)
```

**Camera Integration:**

```
react-native-image-picker (camera/gallery)
or
react-native-camera (native camera)
```

**Biometric Auth:**

```
react-native-biometric (fingerprint/Face ID)
```

**Navigation:**

```
React Navigation 6+
  - BottomTabNavigator
  - StackNavigator
  - DrawerNavigator
```

---

#### Backend & Database

**Database:**

```
Supabase (Managed PostgreSQL)
  - Real-time subscriptions
  - Authentication
  - Role-based access control (RLS)
  - Vector search (future: AI features)
  - Built-in functions & triggers
```

**Authentication:**

```
Supabase Auth
  - Email/password authentication
  - OAuth providers (Google, GitHub)
  - Multi-factor authentication (SMS OTP)
  - JWT tokens
  - Session management
```

**Database Schema (Key Tables):**

```
tables:
  - users
  - user_profiles
  - salaries (salary history)
  - fixed_expenses
  - variable_expenses
  - expenses (daily transactions)
  - expense_categories (user-defined)
  - auto_captured_expenses (from SMS)
  - tasks
  - task_categories
  - task_reminders
  - reminders_sent (history)
  - audit_logs (compliance)
  - notifications (push notifications)

functions:
  - calculate_pocket_money()
  - process_bank_sms()
  - generate_monthly_report()
  - sync_tasks()
  - send_notifications()

triggers:
  - on_expense_insert → update_pocket_money
  - on_task_complete → send_notification
  - on_reminder_trigger → send_alert
```

**File Storage:**

```
Supabase Storage
  - Receipt images
  - User avatars
  - Document exports
  - Attachments
```

**Real-time Communication:**

```
Supabase Realtime
  - WebSocket subscriptions
  - Database change streams
  - Live updates across devices
  - Multi-user conflict resolution
```

---

### 5.2 Security & Data Protection

**Authentication:**

- Email/password with strong validation rules
- Optional: Google OAuth, Apple OAuth
- Multi-factor authentication (SMS OTP, optional)
- Session management with automatic logout (15 minutes inactivity)
- JWT tokens with refresh tokens

**Data Protection:**

- HTTPS/TLS for all API calls
- End-to-end encryption for sensitive financial data (future feature)
- Supabase Row Level Security (RLS) policies enforcing user isolation
- Data at rest encryption (Supabase default AES-256)
- Secrets managed via environment variables

**Compliance:**

- GDPR compliant data handling
- Data deletion request support (GDPR Art. 17)
- Privacy policy clear on data usage
- No third-party financial data sharing
- Audit logs for compliance audits

**Bank Message Security (Mobile):**

- SMS processing happens locally on device (NOT sent to backend raw)
- Only extracted transaction data sent to backend
- SMS content never logged or stored on servers
- User explicit consent before enabling SMS scraping
- Clear disclosure of banks being monitored
- User can disable SMS scraping anytime

**API Security:**

- Rate limiting on endpoints (to prevent abuse)
- CORS policy configured
- Input validation and sanitization
- SQL injection prevention (parameterized queries via Supabase SDK)
- CSRF tokens for state-changing operations
- Content Security Policy headers

---

### 5.3 Performance Optimization

**Web Application:**

```
Target Metrics:
  - First Contentful Paint (FCP): < 1.5s
  - Largest Contentful Paint (LCP): < 2.5s
  - Cumulative Layout Shift (CLS): < 0.1
  - Time to Interactive (TTI): < 3.5s
  - Page Load Time: < 2 seconds

Optimization Techniques:
  - Code splitting & lazy loading (React.lazy)
  - Image optimization (next/image equivalent)
  - Minification and compression
  - Caching strategy (Service Workers)
  - CDN for static assets (Vercel edge network)
  - Database query optimization
  - Recharts performance:
    - Responsive containers
    - Data aggregation before visualization
    - Virtual scrolling for large datasets
```

**Mobile Application:**

```
Target Metrics:
  - App startup time: < 3 seconds
  - List scrolling FPS: 60 FPS smooth
  - Memory usage: < 200MB
  - App bundle size: < 50MB

Optimization Techniques:
  - Native modules for critical paths
  - Lazy loading screens
  - Image optimization
  - Bundle size analysis (Hermes JS engine)
  - Local caching with SQLite
  - Offline-first architecture
```

**Database:**

```
- Connection pooling
- Query indexing on frequently filtered columns
- Database query limits (pagination)
- Aggregate data for analytics (materialized views)
- Archive old data after retention period
```

---

### 5.4 Scalability Architecture

**Web Application:**

```
Vercel Deployment:
  - Auto-scaling edge functions
  - Global CDN for content distribution
  - Serverless functions (future: API routes)
  - Automatic HTTPS
  - Zero-downtime deployments
  - Environment management (staging, production)
```

**Mobile Application:**

```
App Store Distribution:
  - Apple App Store (iOS)
  - Google Play Store (Android)
  - Beta testing via TestFlight / Google Play Beta
```

**Database Scaling:**

```
Supabase Auto-Scaling:
  - Automatic scaling up during peak load
  - Connection pooling
  - Read replicas (future: if needed)
  - Backup retention and recovery
```

**Future Considerations:**

```
- Backend API caching layer (Redis)
- Message queue for async tasks (Bull Queue)
- Data warehouse for analytics (future)
- Search optimization (Elasticsearch, future)
```

---

## 6. User Stories & Workflows

### 6.1 Core User Story: Monthly Budget Setup

**As a** working professional earning ₹75,000/month  
**I want to** set up my monthly budget with all expenses  
**So that** I can see exactly how much pocket money I have daily

**Acceptance Criteria:**

```
Given: User creates new account
When: User navigates to /settings/budget
And: User sets monthly salary to ₹75,000
And: User adds fixed expenses: Rent ₹20,000, Maid ₹5,000
And: User adds variable expenses: Electricity ₹2,000
And: User sets monthly savings target: ₹10,000
Then: System calculates: Pocket Money = 75,000 - 20,000 - 5,000 - 2,000 - 10,000 = ₹38,000
And: System shows daily pocket money = ₹38,000 ÷ 30 = ₹1,266.67
And: Dashboard displays all KPI cards with correct values
And: Data is saved to Supabase with timestamp
And: User sees confirmation message and navigates to dashboard
```

---

### 6.2 Core User Story: Daily Expense Tracking

**As a** user who wants to track spending  
**I want to** add an expense and see pocket money updated  
**So that** I know how much I can spend for the rest of the month

**Acceptance Criteria:**

```
Given: User is logged in on dashboard with ₹1,266.67 daily pocket money
When: User clicks "Add Expense" or navigates to /money/add-expense
And: User enters amount: ₹500
And: User enters description: "Coffee at café"
And: User selects category: "Food"
And: User clicks "Save"
Then: Expense is recorded in Supabase with current timestamp
And: Supabase Realtime triggers update
And: Daily pocket money updates to ₹766.67
And: Remaining month pocket money updates proportionally
And: Transaction appears in /money/transactions list
And: Dashboard KPI cards update in real-time
And: User sees success notification: "Expense added: ₹500"
```

---

### 6.3 Core User Story: Overspending & Emergency Access

**As a** user who overspent on daily pocket money  
**I want to** access emergency savings  
**So that** I can pay for an unexpected expense

**Acceptance Criteria:**

```
Given: User has ₹200 remaining pocket money for month
And: User has ₹10,000 emergency savings
When: User adds expense for ₹500
And: Pocket money is insufficient (system calculates)
Then: System shows modal: "Pocket money insufficient. Use emergency savings?"
And: User confirms emergency access
Then: Expense is deducted from emergency savings
And: Emergency savings balance updates to ₹9,500
And: Dashboard highlights emergency savings in red warning state
And: Notification sent: "Emergency savings accessed: ₹500"
And: Dashboard alert badge shows "⚠️ Emergency Mode"
And: User can view reason in transaction history
```

---

### 6.4 Core User Story: Mobile Bank Message Capture

**As a** mobile user who makes card purchases  
**I want to** bank SMS messages automatically added as expenses  
**So that** I don't have to manually log every transaction

**Acceptance Criteria:**

```
Given: Mobile user has app installed and SMS permission granted
And: SMS auto-capture enabled in /settings/security
When: User receives bank SMS: "HDFC Bank: Purchase of ₹2,500 at Amazon"
And: SMS arrives to registered bank number
Then: App parses SMS locally (not sent to server)
And: Expense ₹2,500 appears in /tasks/pending-review section
And: Merchant "Amazon" is pre-filled
And: Category defaults to "Shopping" (based on merchant)
And: User can edit amount, category before approval
When: User approves
Then: Expense is recorded in Supabase
And: Pocket money is updated immediately
And: Notification shows: "Expense added: ₹2,500 at Amazon"
And: Transaction appears in history
```

---

### 6.5 Core User Story: Task Creation & Kanban

**As a** user who wants to organize tasks  
**I want to** create a task and move it through a workflow  
**So that** I can track my progress

**Acceptance Criteria:**

```
Given: User navigates to /tasks/kanban
When: User clicks "Add Task" button (top-right or FAB)
And: Modal opens for task creation
And: User enters title: "Complete project report"
And: User sets due date: "January 10, 2026"
And: User sets priority: "High"
And: User sets category: "Work"
And: User clicks "Create"
Then: Task is saved to Supabase
And: Task appears in "To Do" column with High priority color (orange)
And: Task displays due date "Jan 10"
When: User drags task from "To Do" to "In Progress"
Then: Drag animation plays
And: Task moves to "In Progress" column
And: Status updates in Supabase
And: Timestamp recorded for state change
When: User completes task and drags to "Completed"
Then: Task moves to "Completed" column
And: Completion time is recorded
And: Task shows checkmark overlay
And: Success notification shown
```

---

### 6.6 Core User Story: Task Reminders

**As a** user with important tasks  
**I want to** receive reminders before my due date  
**So that** I don't miss important deadlines

**Acceptance Criteria:**

```
Given: User has task "Pay rent" due January 10 at 10 AM
When: User opens task details
And: Sets reminder "1 day before at 9 AM"
And: Saves task
Then: Reminder is scheduled in system
When: January 9 arrives at 9 AM
Then: System sends notification (web) or push/alarm (mobile)
And: Web notification: "Pay rent - due tomorrow at 10 AM"
And: Mobile notification: Same message
And: Mobile alarm (if configured): Plays configured sound + vibration
And: User can tap notification to open task
And: Snooze options available (5 min, 1 hour, 1 day)
```

---

### 6.7 Cross-Platform Sync Story

**As a** user who uses both web and mobile  
**I want to** see my expenses and tasks on both platforms  
**So that** I'm always in sync regardless of device

**Acceptance Criteria:**

```
Given: User adds ₹500 expense on mobile at 11:30 AM
When: Expense is saved to Supabase
Then: Web dashboard updates via Supabase Realtime < 1 second
And: Dashboard shows updated pocket money
And: Transactions list shows new expense
And: KPI cards update with new values

When: User creates task on web at 2 PM
And: Task is saved to Supabase
Then: Mobile app updates via Supabase Realtime < 1 second
And: Task appears in mobile Kanban board
And: Mobile calendar shows task on due date
And: Notification delivered to mobile
```

---

## 7. Dashboard & Analytics Features

### 7.1 KPI Metrics (Real-time Display)

**Financial KPIs:**

- Monthly Salary (₹)
- Total Fixed Expenses (₹, % of salary)
- Total Variable Expenses (₹, % of salary)
- Monthly Savings Target (₹, % of salary)
- Pocket Money Pool (₹, % of salary)
- Daily Pocket Money Allocation (₹)
- Today's Spending (₹, % of daily allocation)
- Emergency Savings Balance (₹)
- Budget Health Score (%)
- Days Remaining in Month (#)
- Overspending Status (Yes/No, amount if yes)

**Task KPIs:**

- Total Tasks Created (this month)
- Tasks Completed (this month, %)
- Tasks In Progress (#)
- Tasks Overdue (#)
- Completion Rate (%)

**Charts & Visualizations:**

- Monthly Budget Breakdown (Pie Chart - Recharts)
- Daily Spending Trend (Line Chart - Recharts)
- Category-wise Spending (Bar Chart - Recharts)
- Weekly Spending Comparison (Grouped Bar - Recharts)
- Task Completion Trend (Line Chart - Recharts)
- Spending Velocity (Area Chart - Recharts)

---

## 8. MVP Release Plan

### Phase 1: Core Features (Weeks 1-4)

- [x] User authentication (email/password via Supabase)
- [x] Salary & budget setup
- [x] Manual expense tracking (web + mobile)
- [x] Daily pocket money calculation
- [x] Basic task Kanban board
- [x] Task creation & status updates
- [x] Basic dashboard with key KPIs
- [x] Responsive design (web + mobile)

### Phase 2: Enhanced Features (Weeks 5-8)

- [ ] Bank SMS auto-capture (mobile)
- [ ] Task reminders & notifications (web)
- [ ] Mobile notifications & alarms
- [ ] Calendar view for tasks
- [ ] Transaction history & search
- [ ] Analytics & Recharts visualizations
- [ ] Category management
- [ ] Export functionality (CSV/PDF)
- [x] AI Financial Assistant (Actionable Chat)

### Phase 3: Optimization (Weeks 9-12)

- [ ] Performance optimization
- [ ] UI/UX refinement
- [ ] Mobile app testing
- [ ] Security hardening
- [ ] Offline sync support
- [ ] Advanced filters
- [ ] Budget alerts

### Phase 4: Advanced (Future)

- [ ] Multi-user support
- [ ] Investment tracking
- [ ] Recurring bill automation
- [x] AI-powered insights (Completed in Phase 2)
- [ ] Bill splitting
- [ ] Social features

---

## 9. Success Metrics

### User Engagement

- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session duration (target: > 5 minutes)
- Retention rate at 7, 14, 30 days

### Financial Tracking

- Average expenses logged per user per month (target: > 50)
- Auto-capture accuracy (target: > 95%)
- Users with data consistency (target: > 90%)

### Task Management

- Average tasks created per user per month (target: > 20)
- Task completion rate (target: > 60%)
- Reminder notification engagement

### Platform Metrics

- API response time (target: < 500ms)
- Real-time sync latency (target: < 1s)
- App crash rate (target: < 0.1%)
- User satisfaction (NPS score, target: > 40)

---

## 10. Glossary

| Term                   | Definition                                                                   |
| ---------------------- | ---------------------------------------------------------------------------- |
| **Fixed Expense**      | Recurring monthly expense with consistent amount (e.g., rent)                |
| **Variable Expense**   | Recurring monthly expense with fluctuating amount (e.g., electricity)        |
| **Pocket Money**       | Discretionary spending amount calculated as salary minus all allocations     |
| **Emergency Savings**  | Reserve fund accessed only when pocket money exhausted                       |
| **Daily Pocket Money** | Pocket money pool divided by remaining days of month                         |
| **Auto-Capture**       | Automatic extraction of expenses from bank SMS messages                      |
| **Kanban Board**       | Workflow visualization with columns: To Do, In Progress, Completed, Not Done |
| **KPI**                | Key Performance Indicator - metric for measuring success                     |
| **Real-time Sync**     | Immediate data synchronization across web and mobile devices                 |
| **RLS**                | Row Level Security - database access control policies                        |
| **MVP**                | Minimum Viable Product - core features for initial release                   |
| **FCM**                | Firebase Cloud Messaging - push notification service                         |
| **Recharts**           | React charting library for data visualization                                |

---

## 11. Document Sign-off

| Role            | Name               | Signature        | Date             |
| --------------- | ------------------ | ---------------- | ---------------- |
| Product Manager | [Your Name]        | \***\*\_\_\*\*** | January 7, 2026  |
| Technical Lead  | [Dev Lead Name]    | \***\*\_\_\*\*** | \***\*\_\_\*\*** |
| Design Lead     | [Design Lead Name] | \***\*\_\_\*\*** | \***\*\_\_\*\*** |
| Stakeholder     | [Stakeholder Name] | \***\*\_\_\*\*** | \***\*\_\_\*\*** |

---

## Document History

- **v2.0** (January 7, 2026) - Updated with multi-page architecture, technology stack details, KPI dashboard, Recharts integration, React Native specifics, and comprehensive feature breakdown
- **v1.0** (January 6, 2026) - Initial PRD creation with core features and basic structure

---

**Note for Development Team:** This PRD is the single source of truth for the FinanceTask project. The project is **ONE unified application** combining money management and task management (NOT separate apps). All features work together through a shared Supabase backend with real-time synchronization.

**Key Integration Points:**

- Money management funds task management decisions (e.g., "Can I spend time on this if earning money?")
- Shared user authentication and profile
- Unified dashboard showing both money and task KPIs
- Real-time sync ensures consistency across web and mobile
- Supabase is the single source of truth for all data

Regular PRD review meetings recommended at start of each development phase.

---

**End of Document**
