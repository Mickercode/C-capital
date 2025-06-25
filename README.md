# Crawdwall Capital Admin Dashboard

A modern, responsive admin dashboard for managing event funding proposals. Built with vanilla JavaScript and CSS for optimal performance.

## 🌟 Features

### Dashboard Overview
- Quick stats summary (pending, approved, under review, total funding)
- Trend indicators for key metrics
- Responsive sidebar navigation with icons
- Admin profile section with avatar

### Proposal Management
- **Sortable Table**
  - Proposal ID
  - Event Title
  - Organizer Name
  - Status (with color-coded badges)
  - Submission Date
  - Action buttons

- **Search & Filter**
  - Real-time search across all fields
  - Status filter dropdown
  - Debounced search for performance

- **Pagination**
  - Items per page control
  - Page navigation
  - Entry count display

### Proposal Detail Modal
- **Tabbed Interface**
  1. 👤 Organizer Details
     - Contact information
     - Company details
  2. 📅 Event Summary
     - Description
     - Type
     - Dates
     - Expected attendees
  3. 📄 Documents
     - Proposal PDF
     - CAC Certificate
     - Pitch Deck
     - Bank Details
  4. 💰 Budget & Revenue
     - Total budget
     - Expected revenue
     - Profit margin
     - Budget breakdown chart
  5. 📝 Internal Notes
     - Add/view admin notes
     - Timestamp and author tracking
  6. 🔄 Status Updates
     - Current status selector
     - Status history timeline

### State Management
- **Empty States**
  - Friendly message when no proposals exist
  - Clear guidance for users

- **Loading States**
  - Spinning indicator during data fetch
  - Smooth transitions

- **Error Handling**
  - User-friendly error messages
  - Recovery options
  - Detailed error logging

## 🎨 Design System

### Colors
- Primary: Navy Blue (`#0B1E39`)
- Secondary shades:
  - Light: 5%, 10%, 20%
  - Medium: 40%, 60%
  - Dark: 80%, 100%

### Typography
- System font stack for optimal performance
- Size scale: 0.875rem to 1.5rem
- Weights: 400 (regular), 500 (medium), 600 (semibold)

### Spacing
- Base unit: 4px
- Scale:
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px

### Components
- Buttons (primary, secondary)
- Status badges
- Cards
- Modal dialogs
- Form inputs
- Tables
- Navigation

## 🛠 Technical Implementation

### File Structure
```
C-capital/
├── dashboard/
│   ├── admin.html
│   ├── organizer.html
│   └── new-proposal.html
├── js/
│   └── admin.js
├── styles/
│   ├── admin.css
│   └── dashboard.css
└── README.md
```

### JavaScript Classes
1. **AdminDashboard**
   - Dashboard initialization
   - Stats loading
   - Mobile navigation

2. **ProposalManagement**
   - Table rendering
   - Search/filter/sort
   - Pagination
   - Action handlers

3. **ProposalDetailModal**
   - Modal state management
   - Tab switching
   - Data population
   - Action handlers

### State Management
- Client-side filtering and sorting
- Pagination calculation
- Status tracking
- Form state management

### API Integration Points
```javascript
// Load proposals
async loadProposals()

// Fetch proposal details
async fetchProposalDetails(proposalId)

// Update proposal status
async updateStatus(newStatus)

// Add internal note
async addNote(content)

// Save changes
async saveChanges()

// Notify organizer
async notifyOrganizer()
```

## 🚀 Getting Started

1. Clone the repository
2. Open `dashboard/admin.html` in your browser
3. No build step required - pure HTML, CSS, and JavaScript

## 📱 Responsive Design

- **Desktop** (> 1024px)
  - Full feature set
  - Multi-column layouts
  - Hover states

- **Tablet** (768px - 1024px)
  - Adapted grid layouts
  - Touch-optimized buttons
  - Scrollable tables

- **Mobile** (< 768px)
  - Single column layouts
  - Full-width modals
  - Touch-friendly navigation
  - Stacked actions

## 🔒 Security Considerations

- Input sanitization
- XSS prevention
- CSRF protection
- Secure API endpoints
- Role-based access control

## 🔄 Future Improvements

1. Real-time updates
2. Document preview
3. Email notifications
4. Analytics dashboard
5. Bulk actions
6. Export functionality
7. Advanced filtering
8. Audit logging

## 📄 License

Copyright © 2025 Crawdwall Capital. All rights reserved.
