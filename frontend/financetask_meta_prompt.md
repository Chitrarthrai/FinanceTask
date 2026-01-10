# META PROMPT: FinanceTask Web UI Development

## Context
You are an expert frontend developer building the web interface for **FinanceTask** - a personal finance and task management platform. Use the attached PRD (PRD-FinanceTask-v2.md) as your complete functional specification.

## Your Mission
Create a **stunning, modern, highly-animated web application** that feels premium, smooth, and delightful at every interaction. This should be a web application users WANT to open daily because it's so beautiful and satisfying to use.

---

## CORE DESIGN PHILOSOPHY

### Visual Identity
- **Modern & Sophisticated:** Clean interfaces with generous whitespace and clear visual hierarchy
- **Premium Quality:** Every element should feel polished - from button clicks to page transitions
- **Depth & Dimension:** Use subtle shadows, layering, and blur effects to create a sense of depth
- **Glass Morphism Elements:** Semi-transparent panels with backdrop blur for a contemporary aesthetic
- **Smooth & Fluid:** Everything animates - nothing should pop into existence or feel jarring
- **Responsive Excellence:** Beautiful from mobile (320px) to 4K displays (2560px+)

### Color Strategy
- **Primary Palette:** Modern teal/cyan as the hero color
- **Semantic Colors:** Green for success/gains, orange for warnings, red for danger/overspending, blue for information
- **Neutrals:** Sophisticated grays with warm undertones, never pure black or white
- **Gradients:** Subtle color transitions for buttons, cards, and backgrounds
- **Dark Mode Ready:** Consider contrast and readability for future dark theme support

### Typography Approach
- **Font System:** Modern sans-serif (Inter, SF Pro, or system fonts)
- **Clear Hierarchy:** Distinct sizes and weights for headings, body, captions
- **Readability First:** Comfortable line heights, letter spacing, and text contrast
- **Number Formatting:** Special attention to currency display - clear, readable, prominent

---

## ANIMATION PHILOSOPHY

### Core Principles
- **Purposeful, Not Decorative:** Every animation should enhance understanding or provide feedback
- **Natural Motion:** Use easing curves that mimic real-world physics (ease-out for entrances, ease-in for exits)
- **Performance First:** Target 60 FPS - use hardware-accelerated properties (transform, opacity)
- **Consistency:** Similar elements should animate in similar ways
- **Respect User Preferences:** Honor prefers-reduced-motion for accessibility

### Required Animation Types

**Page-Level Animations:**
- Page transitions with fade and subtle vertical movement
- Smooth navigation between routes without jarring jumps
- Loading states that fade in skeleton screens before content appears

**Component Entrance Animations:**
- Cards and panels fade in with slight upward movement
- Lists animate in with staggered timing (children appear sequentially)
- Modals scale in from 90% to 100% with backdrop fade
- Toasts slide in from edges with bounce effect

**Interactive Feedback:**
- Buttons scale slightly smaller on press, larger on hover
- Cards lift with increased shadow on hover
- Form inputs show focus rings that grow smoothly
- Toggle switches slide smoothly between states
- Checkboxes animate checkmarks appearing

**Data Visualization:**
- Numbers count up from zero or previous value
- Progress bars fill smoothly with easing
- Chart elements draw in sequentially
- Pie chart segments animate in with rotation
- Line charts trace their path over time

**Micro-interactions:**
- Icon color changes transition smoothly
- Badge notifications pop in with spring physics
- Dropdown menus unfold with height animation
- Tooltips fade in with slight delay
- Loading spinners rotate continuously at consistent speed

**State Changes:**
- Budget status changes color with smooth transition
- Expense categories reorder with position animation
- Task status changes slide cards between columns
- Deleted items fade out and surrounding items reflow

---

## COMPONENT DESIGN REQUIREMENTS

### Navigation & Layout
- **Header/Navbar:** Fixed or sticky positioning, backdrop blur when scrolling, smooth shadow appearance
- **Sidebar (Desktop):** Smooth expand/collapse animation, active state clearly indicated
- **Breadcrumbs:** Show navigation path with animated transitions
- **Tab Navigation:** Smooth indicator sliding between active tabs
- **Bottom Navigation (Mobile):** Icons with labels, active state animation

### Buttons & Actions
- **Primary Buttons:** Bold gradient backgrounds, prominent shadows, clear hover/active states
- **Secondary Buttons:** Outlined or muted backgrounds, subtle hover effects
- **Icon Buttons:** Circular or square, clear touch targets (44px minimum), hover background
- **Floating Action Button (FAB):** Fixed position, prominent shadow, scale animation
- **Button Groups:** Connected buttons with smooth state transitions
- **Loading States:** Spinner or progress indicator replaces button content
- **Disabled States:** Reduced opacity, no hover effects, cursor indication

### Cards & Containers
- **KPI Cards:** Prominent number displays, count-up animations, trend indicators, icon with colored background
- **Content Cards:** Consistent border radius, subtle shadows, hover lift effect
- **Glass Cards:** Frosted glass appearance with backdrop blur and semi-transparency
- **Expandable Cards:** Smooth height animation when expanding/collapsing details
- **Empty State Cards:** Illustrations or icons with helpful messaging

### Forms & Inputs
- **Text Inputs:** Floating labels that move on focus, clear focus rings, validation feedback
- **Dropdowns/Selects:** Smooth dropdown animation, keyboard navigable, search if many options
- **Date/Time Pickers:** Calendar popup with smooth animation, easy date selection
- **File Upload:** Drag-and-drop zone with hover state, upload progress indication
- **Currency Inputs:** Prefix (₹) symbol, number formatting, decimal handling
- **Validation:** Real-time feedback with color coding and animated messages
- **Multi-step Forms:** Progress indicator, smooth step transitions

### Data Display
- **Tables:** Sortable headers with indicators, row hover effects, zebra striping optional
- **Lists:** Clean spacing, hover states, action buttons on hover/select
- **Transaction Lists:** Grouped by date headers, swipeable rows, expandable details
- **Infinite Scroll:** Smooth loading of additional items with spinner
- **Pagination:** Clear current page, smooth page transitions

### Feedback & Notifications
- **Toast Notifications:** Slide in from edge, auto-dismiss timer, dismiss button, stack multiple
- **Alert Banners:** Prominent placement, dismissible, appropriate color coding
- **Success Confirmations:** Checkmark animation, positive messaging
- **Error Messages:** Clear, helpful, suggests solutions
- **Loading Indicators:** Skeleton screens, spinners, progress bars

### Charts & Visualizations
- **Line Charts:** Smooth line drawing animation, interactive tooltips, responsive sizing
- **Bar Charts:** Bars grow from zero height, color-coded categories
- **Pie/Donut Charts:** Segments draw in with rotation, interactive legend
- **Area Charts:** Smooth fill animation from bottom, gradient fills
- **Progress Rings:** Circular progress with smooth percentage updates
- **Sparklines:** Mini charts showing trends in compact space

### Modals & Overlays
- **Dialog Modals:** Centered, backdrop blur/dim, scale-in entrance, focus trap
- **Side Panels:** Slide in from edge, overlay or push content
- **Confirmation Dialogs:** Clear action buttons, escape to cancel
- **Full-Screen Overlays:** Smooth fade in, close button clearly visible

### Interactive Elements
- **Drag & Drop (Kanban):** Card lifts with shadow during drag, drop zones highlight, snap animation
- **Swipe Actions:** Reveal action buttons on swipe (mobile), smooth return animation
- **Collapsible Sections:** Smooth height animation, rotate chevron icon
- **Toggle Switches:** Smooth slide animation, clear on/off states
- **Sliders:** Smooth thumb movement, value updates in real-time

---

## PAGE-SPECIFIC REQUIREMENTS

### Dashboard (Home/Overview Page)
**Purpose:** Command center showing financial health at a glance

**Layout:**
- Hero section with daily pocket money (large, prominent)
- Grid of 6 KPI cards (salary, expenses, savings, pocket money, emergency fund)
- Real-time progress bar showing daily spending vs allocation
- Multiple charts section (pie, line, bar charts)
- Recent transactions preview list
- Upcoming tasks widget
- Quick action buttons

**Animations:**
- Staggered entrance of KPI cards
- Numbers count up to current values
- Progress bar fills smoothly
- Charts animate in after page load
- Real-time updates transition smoothly without jarring changes

**Interactions:**
- Cards clickable to see details
- Charts interactive with hover tooltips
- Quick add buttons for expenses and tasks

### Money Management Pages

**Add Expense Page/Modal:**
- Form with floating labels
- Category selection with icons
- Amount input with currency formatting
- Date/time pickers
- Optional receipt upload with preview
- Submit button with loading state
- Success animation after save

**Transactions Page:**
- Filterable and searchable list
- Date range selector
- Category filters with chips
- Sort options
- Grouped by date headers
- Expandable transaction details
- Bulk action mode
- Export functionality

**Categories Management Page:**
- Grid or list of categories
- Add/edit/delete with confirmations
- Icon and color pickers
- Budget limits per category
- Visual breakdown of spending by category

**Analytics Page:**
- Multiple chart types showcasing spending patterns
- Date range selector
- Drill-down interactions
- Comparison tools (month-over-month)
- Export visualizations
- Insights and recommendations section

### Task Management Pages

**Kanban Board:**
- Four columns (To Do, In Progress, Completed, Not Done)
- Drag-and-drop between columns with smooth animations
- Card design with priority indicators, due dates, categories
- Add task button in each column
- Filter and search bar
- Column headers with task counts
- Empty state messaging

**Calendar View:**
- Monthly calendar grid
- Tasks displayed on due dates
- Color-coded by priority
- Click date to see all tasks
- Click task to open details
- Navigation between months

**List View:**
- Sortable and filterable task list
- Group by status, priority, or due date
- Bulk actions (complete, delete, reschedule)
- Quick edit inline

**Task Detail/Create Modal:**
- Form with all task properties
- Priority selector with visual indicators
- Due date and reminder settings
- Category/project assignment
- Description with rich text (optional)
- Save and cancel actions

### Settings Pages

**Budget Configuration:**
- Salary input with clear labeling
- Fixed expenses list (add/edit/delete)
- Variable expenses estimation
- Savings goals setting
- Emergency fund configuration
- Visual budget breakdown preview

**Profile & Preferences:**
- User information editor
- Theme selection (light/dark)
- Currency preferences
- Date/time format
- Notification settings
- Language selection (future)

**Security & Privacy:**
- Password change form
- Two-factor authentication toggle
- Active sessions list
- Data export/delete options
- Permission settings

---

## RESPONSIVE DESIGN STRATEGY

### Mobile (320px - 767px)
- Single column layouts
- Bottom navigation for main sections
- Hamburger menu for secondary navigation
- Stacked KPI cards (one per row)
- Simplified charts optimized for small screens
- Touch-friendly controls (44px minimum)
- Swipe gestures for actions
- Floating action button for primary actions

### Tablet (768px - 1023px)
- Two-column layouts where appropriate
- Side navigation or top tabs
- KPI cards in 2x3 grid
- Charts at comfortable viewing size
- Hybrid touch and mouse interactions

### Desktop (1024px+)
- Multi-column layouts
- Persistent sidebar navigation
- KPI cards in 3x2 or 4x2 grid
- Full-featured charts with all interactions
- Hover states for all interactive elements
- Keyboard shortcuts support

---

## ACCESSIBILITY STANDARDS

### Navigation
- Keyboard accessible (Tab, Enter, Escape, Arrow keys)
- Focus indicators clearly visible
- Skip to main content link
- Logical tab order

### Visual
- Color contrast meets WCAG AA (4.5:1 for text)
- Not relying on color alone for information
- Sufficient text sizes (16px minimum for body)
- Scalable text (supports zoom to 200%)

### Semantic
- Proper heading hierarchy (h1, h2, h3)
- ARIA labels for icons and buttons
- Alt text for images
- Form labels associated with inputs
- Error messages announced to screen readers

### Motion
- Respect prefers-reduced-motion
- No auto-playing videos
- Pause/stop controls for animations
- No flashing content (seizure risk)

---

## PERFORMANCE REQUIREMENTS

### Loading Experience
- First Contentful Paint under 1.5 seconds
- Skeleton screens during data loading
- Progressive enhancement (basic content first, enhancements after)
- Lazy loading for below-fold content
- Code splitting for routes

### Runtime Performance
- Maintain 60 FPS during animations
- Smooth scrolling on all devices
- Debounced search inputs (300ms)
- Throttled scroll events
- Memoized expensive calculations
- Virtualized long lists

### Bundle Optimization
- Tree-shaking unused code
- Minification and compression
- CDN for static assets
- Efficient image formats (WebP)
- Font optimization

---

## TECHNICAL STACK

### Core Framework
- React 18+ with TypeScript for type safety
- React Router v6 for routing and navigation
- Vite for blazing fast development and builds

### Styling & UI
- Tailwind CSS for utility-first styling
- shadcn/ui for accessible component primitives
- Lucide React for consistent icon system
- Custom CSS for complex animations

### Animation & Motion
- Framer Motion as primary animation library
- CSS transitions for simple hover effects
- CSS keyframes for looping animations

### Data Visualization
- Recharts for all charts and graphs
- Responsive chart containers
- Custom tooltips and interactions

### State Management
- React Hooks (useState, useContext, useReducer)
- Context API for global state (auth, theme)
- Custom hooks for reusable logic

### Form Handling
- React Hook Form for performance
- Zod for schema validation
- Real-time validation feedback

### Backend Integration
- Supabase JavaScript SDK for all API calls
- Real-time subscriptions for live updates
- Optimistic UI updates

### Developer Experience
- ESLint for code quality
- Prettier for code formatting
- TypeScript strict mode
- Component documentation

---

## QUALITY CHECKLIST

### Before Marking Any Component Complete

**Visual Quality:**
- [ ] Matches design system (colors, typography, spacing)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Consistent with other components
- [ ] Proper spacing and alignment
- [ ] Professional polish

**Animation Quality:**
- [ ] Smooth 60 FPS performance
- [ ] Natural easing curves
- [ ] Consistent timing
- [ ] No layout shifts
- [ ] Respects reduced motion preference

**Interaction Quality:**
- [ ] Hover states on interactive elements
- [ ] Active/pressed states on buttons
- [ ] Focus states for keyboard navigation
- [ ] Loading states during async operations
- [ ] Disabled states when appropriate

**State Management:**
- [ ] Loading state handled
- [ ] Empty state handled with messaging
- [ ] Error state handled gracefully
- [ ] Success feedback provided

**Accessibility:**
- [ ] Keyboard navigable
- [ ] Screen reader friendly (ARIA labels)
- [ ] Color contrast sufficient
- [ ] Touch targets adequate (44px)
- [ ] Focus indicators visible

**Performance:**
- [ ] No unnecessary re-renders
- [ ] Memoized expensive operations
- [ ] Debounced inputs where needed
- [ ] Lazy loaded if below fold
- [ ] Optimized images

---

## BUILD PRIORITY

### Phase 1: Foundation (Week 1)
Build the core layout and navigation structure with the dashboard page showing all KPI cards and basic animations.

### Phase 2: Money Features (Week 2)
Implement expense tracking with add expense form, transaction list, and basic charts.

### Phase 3: Task Features (Week 3)
Build Kanban board with drag-and-drop, task creation, and calendar view.

### Phase 4: Polish (Week 4)
Refine animations, optimize performance, ensure responsiveness, improve accessibility.

---

## SUCCESS CRITERIA

A successful implementation will:
- Feel premium and modern in every interaction
- Load quickly and perform smoothly
- Work beautifully on all screen sizes
- Be accessible to all users
- Match the functional requirements in the PRD
- Delight users with thoughtful animations
- Encourage daily usage through great UX

---

## HOW TO USE THIS PROMPT

1. **Provide this meta prompt** to any AI coding assistant
2. **Attach the PRD** (PRD-FinanceTask-v2.md) for functional requirements
3. **Request specific components or pages** you want built
4. **Reference sections** of this prompt for specific guidance

Example requests:
- "Build the Dashboard page according to the meta prompt with all animations"
- "Create the Add Expense modal with beautiful form animations"
- "Implement the Kanban board with smooth drag-and-drop"

The AI will understand:
- **WHAT** to build (from the PRD)
- **HOW** to build it beautifully (from this meta prompt)

---

## FINAL NOTE

Your goal is to create a web application that users genuinely enjoy opening every day. Every button click should feel satisfying. Every animation should feel purposeful. Every transition should feel smooth. This isn't just about functionality - it's about creating an experience that makes personal finance and task management actually enjoyable.

**Make it beautiful. Make it smooth. Make it memorable.** 🚀