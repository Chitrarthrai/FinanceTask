<div align="center">

  <h1>💰 FinanceTask</h1>
  
  <p>
    <strong>The Unified Ecosystem for Personal Finance & Productivity</strong>
  </p>

  <p>
    <a href="#key-features">Key Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#contributing">Contributing</a>
  </p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Expo](https://img.shields.io/badge/Expo-50.0-black?style=flat-square&logo=expo)](https://expo.dev)
[![Status](https://img.shields.io/badge/Status-Active_Development-success?style=flat-square)]()

  <br />
  <br />

  <img src="https://via.placeholder.com/1200x600/0f172a/38bdf8?text=FinanceTask+Dashboard+Preview" alt="FinanceTask Dashboard" width="100%" style="border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">

</div>

<br />

## 🌟 Overview

**FinanceTask** isn't just another budgeting app. It's a comprehensive **Life Operating System** that bridges the gap between your money and your time.

By integrating **Advanced Financial Analytics** with **Kanban-style Task Management**, we help you not only track where your money goes but also plan the actions needed to grow your wealth—all in one seamless, glassmorphism-styled interface.

---

## 🎨 Feature Deep Dive

### 🤖 AI Financial Assistant (Powered by Gemini)

Your personal financial advisor, available 24/7.

- **Natural Language Chat**: Ask questions directly to your data.
  - _"How much did I spend on coffee last month?"_
  - _"What is my remaining budget for the week?"_
  - _"Can I afford a new laptop right now?"_
- **Smart Insights**: The AI pro-actively suggests budget adjustments based on your spending habits.
- **Context Aware**: Understands your past transactions and future recurring payments.

### 📊 Advanced Analytics & Visualization

Turn raw data into actionable wisdom.

- **Interactive Spending Graphs**: Zoomable line charts to track spending velocity over Days, Weeks, Months, and Years.
- **Category Breakdown**: Dynamic pie charts that visualize exactly where your money is going (e.g., 40% Housing, 20% Food).
- **Trend Analysis**: Bar charts that compare your current spending against previous months to spot lifestyle inflation.
- **Custom Filters**: Slice and dice your data by date range, category, or payment method.

### 📄 Professional Reporting & Exports

Data freedom at your fingertips.

- **One-Click PDF Generation**: Create polished, high-resolution PDF statements from your mobile device.
- **Detailed Statements**: Includes transaction history, category summaries, and saving rates.
- **Seamless Sharing**: Instantly share reports via WhatsApp, Email, or Slack directly from the app.
- **Excel/CSV Support**: (Web) Export raw data for use in external tools like Excel or Google Sheets.

### 🧾 AI Receipt Scanning (Vision)

Stop manual data entry forever.

- **Instant Capture**: Snap a photo of any physical receipt.
- **Intelligent Extraction**: Google Gemini Vision API automatically identifies the **Merchant**, **Date**, **Total Amount**, and matches it to a **Category**.
- **Hybrid Workflow**: Review and edit scanned details before saving them to your ledger.

### 📱 Productive Mobile Experience

- **Glassmorphism UI**: A stunning, modern interface with real-time blur effects and vibrant gradients.
- **Secure Access**: native integration with FaceID and Fingerprint sensors.
- **Offline Mode**: View your dashboard and recent transactions even without an internet connection.
- **Smart Dashboard**: See your "Safe to Spend" daily limit instantly upon launch.

### 📅 Integrated Productivity System

- **Kanban Task Management**: Visualize financial tasks (e.g., "Call Bank", "Pay Utility Bill") on a drag-and-drop board.
- **Priority Matrix**: Automatically sort tasks by urgency and importance.
- **Calendar Sync**: View upcoming bill due dates and paydays on a unified calendar view.

---

## �️ Tech Stack

We utilize the latest edge technologies to ensure performance, type safety, and developer experience.

| Layer          | Technologies                                     |
| :------------- | :----------------------------------------------- |
| **Frontend**   | React 19, TypeScript, Vite, Tailwind CSS v4      |
| **Mobile**     | React Native, Expo, NativeWind, Expo Router      |
| **Components** | Radix UI (Web), GlassView (Mobile), Lucide Icons |
| **Backend**    | Supabase (PostgreSQL, Auth, Realtime)            |
| **AI Engine**  | Google Gemini 2.5 Flash                          |

---

## � Security & Privacy

We take your financial data security seriously.

- **Row Level Security (RLS)**: PostgreSQL policies ensure that database queries can _only_ return data that belongs to your authenticated User ID. Even if an API endpoint is exposed, your data remains isolated.
- **Encrypted Storage**: Sensitive keys and tokens are stored using platform-native secure storage (Keychain on iOS, Keystore on Android).
- **Zero-Knowledge Receipt Processing**: Receipt images sent to Gemini AI are processed in-memory and governed by Google Cloud's enterprise data privacy standards.
- **JWT Authentication**: Stateless, secure token-based authentication with automatic refresh mechanisms.

## ⚡ Performance Architecture

Built for speed and reliability.

- **Optimistic UI Updates**: The interface updates instantly when you add a task or transaction, syncing with the background quietly.
- **Smart Caching**: `React Query` manages server state, eliminating redundant network requests and enabling offline-first capabilities.
- **Edge Computing**: Heavy computations (like budget forecasting) run on Supabase Edge Functions to keep the mobile app lightweight.
- **Native Compilation**: The mobile app is compiled to native ARM64 code, ensuring 60fps scrolling and instant startup times.

## 🗺️ Roadmap

Exciting features currently in development:

- [ ] **Recurring Transactions**: Set it and forget it for monthly subscriptions and rent.
- [ ] **Goal Tracking**: Specialized "Buckets" for saving towards a Vacation, Car, or House.
- [ ] **Gamification**: Earn badges and "Financial Health Points" for staying under budget.
- [ ] **Multi-Currency Support**: Perfect for digital nomads and travelers.
- [ ] **Stock Market Integration**: View your investment portfolio alongside your daily spending.

---

## �📸 Screenshots

<details>
<summary>Click to view Project Screenshots</summary>

<br />

|                                                    **Money Dashboard**                                                    |                                                    **Kanban Board**                                                    |
| :-----------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------: |
| <img src="https://via.placeholder.com/600x400/1e293b/38bdf8?text=Money+Management" alt="Money" style="border-radius:8px"> | <img src="https://via.placeholder.com/600x400/1e293b/a78bfa?text=Kanban+Board" alt="Kanban" style="border-radius:8px"> |

|                                                     **Analytics**                                                      |                                                   **Mobile View**                                                    |
| :--------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------: |
| <img src="https://via.placeholder.com/600x400/1e293b/34d399?text=Analytics" alt="Analytics" style="border-radius:8px"> | <img src="https://via.placeholder.com/600x400/1e293b/fb7185?text=Mobile+App" alt="Mobile" style="border-radius:8px"> |

</details>

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### Quick Setup

1.  **Clone the repo**

    ```bash
    git clone https://github.com/yourusername/financetask.git
    cd financetask/frontend
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment**
    Create a `.env` file:

    ```env
    VITE_GEMINI_API_KEY=your_key_here
    VITE_SUPABASE_URL=your_url_here
    VITE_SUPABASE_ANON_KEY=your_key_here
    ```

4.  **Lift off! 🚀**
    ```bash
    npm run dev
    ```
    ```
    Visit `http://localhost:5173` to see the magic.
    ```

### 📱 Mobile Setup

1.  **Navigate to Mobile folder**

    ```bash
    cd ../mobile
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Start the App**
    ```bash
    npx expo run:android
    # or
    npx expo run:ios
    ```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

<div align="center">
  <p>
    Built with ❤️ by the FinanceTask Team
  </p>
  <p>
    <a href="https://github.com/yourusername">GitHub</a> • 
    <a href="mailto:contact@financetask.com">Contact</a>
  </p>
</div>
