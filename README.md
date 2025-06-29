# Crawdwall Capital Admin Dashboard

A modern, responsive admin dashboard for managing event funding proposals. Built with vanilla JavaScript and CSS for optimal performance.

## 🌟 Features

### Dashboard Overview
- Quick stats summary (pending, approved, under review, total funding)
- Trend indicators for key metrics
- Responsive sidebar navigation with icons
- Admin profile section with avatar

### Organizers Management
- **Organizers Page**
  - Sticky header with search and "Add Organizer" button
  - Sortable and filterable organizers table
  - Status badges (Verified, Pending, Suspended)
  - Action buttons (View Profile, Verify, Suspend, Add Note)
  - Internal Admin Notes Panel for team communication

- **Admin Notes Panel**
  - Pinned and regular notes sections
  - Time-stamped entries with author tags
  - Rich text formatting (bold, italic, links, lists)
  - Note tagging system for categorization
  - Pin/unpin, edit, and delete functionality

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
│   ├── admin-organizers.html
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

4. **OrganizersManagement**
   - Organizers table rendering
   - Search/filter/sort functionality
   - Status badge management
   - Action button handlers

5. **AdminNotesPanel**
   - Rich text formatting
   - Note creation and management
   - Pin/unpin functionality
   - Edit and delete operations

### State Management
- Client-side filtering and sorting
- Pagination calculation
- Status tracking
- Form state management

## 🔧 Admin Dashboard API Requirements

The Admin Dashboard requires the following backend APIs to function properly. This documentation outlines all necessary endpoints for the admin settings page components.

### 👤 Profile Management APIs

### 👥 Admin Permissions Management APIs

### 🔔 Notifications Preferences APIs

### 🧩 Platform Configuration APIs

### 👥 Organizers Management APIs

#### 1. List Organizers
- **Endpoint:** `/admin/organizers`
- **Method:** GET
- **Description:** Get a list of all organizers with their details and status
- **Authentication:** Admin token required
- **Query Parameters:**
  - page: number
  - limit: number
  - status: "verified" | "pending" | "suspended" | "all"
  - search: string (search by name, email, or company)
  - sort: string (field to sort by)
  - order: "asc" | "desc"
- **Response:**
  ```json
  {
    "organizers": [
      {
        "id": "uuid",
        "full_name": "string",
        "email": "string",
        "company": "string",
        "status": "verified" | "pending" | "suspended",
        "date_registered": "timestamp",
        "last_active": "timestamp",
        "proposals_count": "number",
        "approved_proposals": "number"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    }
  }
  ```
- **Error Codes:**
  - 401: Unauthorized
  - 403: Insufficient permissions

#### 2. Get Organizer Details
- **Endpoint:** `/admin/organizers/{id}`
- **Method:** GET
- **Description:** Get detailed information about a specific organizer
- **Authentication:** Admin token required
- **Response:**
  ```json
  {
    "id": "uuid",
    "full_name": "string",
    "email": "string",
    "phone": "string",
    "company": "string",
    "company_registration": "string",
    "company_address": "string",
    "status": "verified" | "pending" | "suspended",
    "date_registered": "timestamp",
    "last_active": "timestamp",
    "proposals": [
      {
        "id": "uuid",
        "title": "string",
        "status": "string",
        "submission_date": "timestamp"
      }
    ],
    "documents": [
      {
        "id": "uuid",
        "type": "string",
        "name": "string",
        "url": "string",
        "upload_date": "timestamp"
      }
    ]
  }
  ```
- **Error Codes:**
  - 401: Unauthorized
  - 403: Insufficient permissions
  - 404: Organizer not found

#### 3. Update Organizer Status
- **Endpoint:** `/admin/organizers/{id}/status`
- **Method:** PUT
- **Description:** Update an organizer's verification status
- **Authentication:** Admin token required
- **Request Body:**
  ```json
  {
    "status": "verified" | "pending" | "suspended",
    "reason": "string" // Required when suspending
  }
  ```
- **Response:**
  ```json
  {
    "id": "uuid",
    "status": "string",
    "updated_at": "timestamp",
    "updated_by": "string" // Admin name
  }
  ```
- **Error Codes:**
  - 400: Invalid input
  - 401: Unauthorized
  - 403: Insufficient permissions
  - 404: Organizer not found

#### 4. Add Admin Note
- **Endpoint:** `/admin/organizers/{id}/notes`
- **Method:** POST
- **Description:** Add an internal admin note about an organizer
- **Authentication:** Admin token required
- **Request Body:**
  ```json
  {
    "content": "string",
    "tags": ["string"],
    "is_pinned": "boolean"
  }
  ```
- **Response:**
  ```json
  {
    "note_id": "uuid",
    "content": "string",
    "tags": ["string"],
    "is_pinned": "boolean",
    "created_at": "timestamp",
    "created_by": {
      "id": "uuid",
      "name": "string"
    }
  }
  ```
- **Error Codes:**
  - 400: Invalid input
  - 401: Unauthorized
  - 403: Insufficient permissions
  - 404: Organizer not found

#### 5. Get Admin Notes
- **Endpoint:** `/admin/organizers/{id}/notes`
- **Method:** GET
- **Description:** Get all admin notes for a specific organizer
- **Authentication:** Admin token required
- **Query Parameters:**
  - pinned_only: boolean
- **Response:**
  ```json
  {
    "notes": [
      {
        "note_id": "uuid",
        "content": "string",
        "tags": ["string"],
        "is_pinned": "boolean",
        "created_at": "timestamp",
        "created_by": {
          "id": "uuid",
          "name": "string"
        },
        "updated_at": "timestamp",
        "updated_by": {
          "id": "uuid",
          "name": "string"
        }
      }
    ]
  }
  ```
- **Error Codes:**
  - 401: Unauthorized
  - 403: Insufficient permissions
  - 404: Organizer not found

#### 6. Update Admin Note
- **Endpoint:** `/admin/organizers/{organizer_id}/notes/{note_id}`
- **Method:** PUT
- **Description:** Update an existing admin note
- **Authentication:** Admin token required
- **Request Body:**
  ```json
  {
    "content": "string",
    "tags": ["string"],
    "is_pinned": "boolean"
  }
  ```
- **Response:** Updated note object
- **Error Codes:**
  - 400: Invalid input
  - 401: Unauthorized
  - 403: Insufficient permissions
  - 404: Note not found

#### 7. Delete Admin Note
- **Endpoint:** `/admin/organizers/{organizer_id}/notes/{note_id}`
- **Method:** DELETE
- **Description:** Delete an admin note
- **Authentication:** Admin token required
- **Response:** Status 200 OK
- **Error Codes:**
  - 401: Unauthorized
  - 403: Insufficient permissions
  - 404: Note not found
