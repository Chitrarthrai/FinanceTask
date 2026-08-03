# FinanceTask: Workspace Memory & Rules

This document serves as persistent workspace memory for the **FinanceTask (Toffee)** project, containing project metadata, database connections, design system references, architectural mappings, and implementation guidelines.

---

## ⚡ Connected Services & Resources

### 1. Supabase Backend
* **Project Name**: `Chitrarthrai's Project`
* **Project Reference ID**: `ggmuswtlyyvyouhidslk`
* **Region**: `ap-southeast-1`
* **Database Engine**: PostgreSQL 17

### 2. StitchMCP Integration
* **Stitch Project Name**: `FinanceTask`
* **Stitch Resource ID**: `projects/10572712856859605956`
* **Project Type**: `PROJECT_DESIGN`

### 3. Environment & Configuration Paths
* **IDE MCP Config**: `C:\Users\chitr\.gemini\antigravity-ide\mcp_config.json`
* **Global Customizations Root**: `C:\Users\chitr\.gemini\config\`
* **Workspace Root**: `d:\Chitrarth\Project P\FinanceTask`

---

## 📚 Core Repository Maps & Documents

* **Product Requirements**: [PRD-FinanceTask-v2.md](file:///d:/Chitrarth/Project%20P/FinanceTask/PRD-FinanceTask-v2.md)
* **Frontend Architecture**: [frontend_data_flow_map.md](file:///d:/Chitrarth/Project%20P/FinanceTask/frontend_data_flow_map.md)
* **Backend Specifications**: [backend_spec_map.md](file:///d:/Chitrarth/Project%20P/FinanceTask/backend_spec_map.md)
* **Mobile Architecture**: [mobile_data_flow_map.md](file:///d:/Chitrarth/Project%20P/FinanceTask/mobile_data_flow_map.md)
* **Code Gap Analysis**: [implementation_gap_analysis.md](file:///d:/Chitrarth/Project%20P/FinanceTask/implementation_gap_analysis.md)
* **Master Task List**: [task_list.md](file:///d:/Chitrarth/Project%20P/FinanceTask/task_list.md)

---

## ⚙️ Development Guidelines

1. **Supabase Realtime & Row-Level Security**: Ensure all new PostgreSQL tables enable RLS restricting access via `auth.uid() = user_id`.
2. **Web & Mobile Parity**: Any changes to metric calculation formulas or task statuses must be synchronized across both `frontend/contexts/DataContext.tsx` and `mobile/context/DataContext.tsx`.
3. **MCP Configuration Location**: Always ensure MCP server changes are updated in `C:\Users\chitr\.gemini\antigravity-ide\mcp_config.json` for IDE tool discovery.
