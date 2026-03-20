# Smart Inventory: Backend Architecture and Database Design

This document details the proposed database schema and API logic for the Smart Inventory project, specifically tailored for supply chain management and item-level tracking.

## 1. Database Schema (ERD)

The following schema represents a normalized relational structure designed to track items from Purchase Order (PO) to site deployment.

```mermaid
erDiagram
    PURCHASE_ORDER ||--o{ INSPECTION_TASK : "generates"
    INSPECTION_TASK ||--o{ INSPECTION_TASK_ITEM : "contains"
    INSPECTION_TASK_ITEM }o--|| LINE_ITEM : "specifies_quantity_for"
    INSPECTION_TASK_ITEM ||--o{ INDIVIDUAL_UNIT : "registers"
    FIRM ||--o{ PURCHASE_ORDER : "issues"
    PURCHASE_ORDER ||--o{ LINE_ITEM : "contains"
    ITEM_MASTER ||--o{ INDIVIDUAL_UNIT : "references"
    ITEM_TYPE ||--o{ ITEM_MAKE : "links"
    ITEM_MAKE ||--o{ ITEM_MODEL : "links"
    ITEM_MODEL ||--o{ ITEM_PART : "links"
    ITEM_PART --|| ITEM_MASTER : "defines"
    INDIVIDUAL_UNIT ||--o{ RMA : "returned_via"
    STORE ||--o{ INDIVIDUAL_UNIT : "houses"
    SITE ||--o{ INDIVIDUAL_UNIT : "deployed_at"

    PURCHASE_ORDER {
        int id PK
        string po_number UK
        text description
        string tender_number
        date po_date
        int firm_id FK
        int purchaser_id FK
        string status "Draft, Partial, Completed"
        timestamp created_at
    }

    INSPECTION_TASK {
        int id PK
        int po_id FK
        int inspector_id FK
        string call_letter_number UK
        date inspection_date
        string status "Assigned, In-Progress, Completed"
    }

    INSPECTION_TASK_ITEM {
        int id PK
        int inspection_task_id FK
        int line_item_id FK
        int quantity_offered
        int quantity_inspected
    }

    LINE_ITEM {
        int id PK
        int po_id FK
        int line_number
        string line_description
        string item_description
        string uom
        decimal unit_price
        int total_quantity
    }

    INDIVIDUAL_UNIT {
        int id PK
        int line_item_id FK
        int item_master_id FK
        string serial_number UK
        string status "In-Transit, Inspection-Pending, In-Stock, Dispatched, Faulty"
        int current_store_id FK
        int current_site_id FK
        text remarks
    }

    RMA {
        int id PK
        int unit_id FK
        string rma_number UK
        string type "DOA, Faulty, Repair"
        string status "Initiated, Received, Processing, Resolved"
        text reason
        int requester_id FK
        timestamp created_at
    }
```

---

## 2. Deep Logic: Partial Processing & Multi-Assignee Management

To manage a scenario where a single PO (e.g., 50 items) is split across multiple people or multiple processing batches, we use the **Inspection Task (Call Letter)** bridge.

### 2.1. The Workflow
1.  **PO Creation**: The PO is created with its total quantities.
2.  **Creating a Task (Partial Assignment)**: 
    - A user creates an `INSPECTION_TASK`.
    - They assign `inspector_id = Person_1`.
    - They specify `quantity_offered = 20` for Line Item A.
3.  **Second Assignment**:
    - Later, another `INSPECTION_TASK` is created.
    - Assigned to `inspector_id = Person_2`.
    - They specify the remaining `quantity_offered = 30` for Line Item A.
4.  **Reconciliation**:
    - The system validates that `SUM(Inspection_Task_Item.quantity_offered)` for a specific `line_item_id` does not exceed `Line_Item.total_quantity`.

### 2.2. Handling Individual Units
- Each `INDIVIDUAL_UNIT` (Serial Number) created during the data entry phase is linked back to the specific `INSPECTION_TASK_ITEM`.
- This ensures you know exactly **which person** inspected **which specific serial numbers**.

---

## 3. Table Definitions

### 2.1. Master Data Tables
*   **Item_Types**: `id`, `name`
*   **Item_Makes**: `id`, `type_id`, `name`
*   **Item_Models**: `id`, `make_id`, `name`
*   **Item_Parts**: `id`, `model_id`, `part_code`, `description` (The "Catalog" entries).
*   **Stores**: `id`, `store_name`, `location`, `contact_id`.
*   **Sites**: `id`, `site_name`, `address`, `zone`.

### 2.2. Transactional Tables
*   **Firms**: Stores Vendor details (Name, Address, Email, Phone).
*   **Purchase_Orders**: Header for the PO.
*   **Line_Items**: The requested items within a PO. Note that one Line Item might map to multiple unique Serial Numbers.
*   **Individual_Units**: The heart of tracking. Each physical item has its own row.

---

## 3. Core API Logic

### 3.1. Dashboard API (`GET /api/dashboard/counts`)
**Objective**: Provide high-level statistics for the landing page cards.

**Logic (Rust/SQL Pseudo-code)**:
```sql
SELECT 
    (SELECT COUNT(*) FROM purchase_orders) as total_pos,
    (SELECT COUNT(*) FROM individual_units WHERE status = 'In-Stock') as total_inventory,
    (SELECT COUNT(*) FROM rma WHERE status != 'Resolved') as active_rmas,
    (SELECT COUNT(*) FROM purchase_orders WHERE status = 'Inspection-Pending') as pending_inspections;
```

### 3.2. PO Listing API (`GET /api/pos`)
**Objective**: Fetch a paginated list of POs with firm information and current status.

**Parameters**: `page`, `limit`, `search_query`, `status_filter`.

**Logic**:
Join `purchase_orders` with `firms` and `users` (purchaser/inspector).
Calculate `completion_percentage` by comparing `SUM(quantity_inspected)` vs `SUM(total_quantity)` across all line items.

### 3.3. PO Creation Workflow (Transactional)
When a PO is created via the Modal:
1.  **Validate**: Ensure `po_number` is unique.
2.  **Insert PO**: Create the header record.
3.  **Insert Line Items**: Loop through the `line_items` array and create records linked to the new PO ID.
4.  **Audit Log**: Record the creation event.

### 3.4. Item Inspection/Data Entry (`POST /api/pos-dataEntry/{id}`)
This is where Serial Numbers are associated with Line Items.
1.  **Validate**: Check if provided Serial Numbers already exist in `individual_units` (global uniqueness check).
2.  **Bulk Insert Units**: Create records in `individual_units` for each serial, linked to the `line_item_id`.
3.  **Update Line Item**: Increment `quantity_inspected` and update `warranty_start`.
4.  **Auto-Update PO Status**: If all line items are fully inspected, set PO Status to `Completed`.

---

## 4. Item Lifecycle State Machine

Items move through these states, tracked via the `status` field in `individual_units`:

| Current State | Action | Next State | Notes |
| :--- | :--- | :--- | :--- |
| **Pending** | Inspection | **In-Stock** | Serial Number registered. |
| **In-Stock** | Dispatch | **In-Transit** | Linked to a Store/Site. |
| **In-Transit** | Receiving | **Deployed/In-Stock** | Final destination reach. |
| **Deployed** | Failure | **Faulty** | RMA triggered. |
| **Faulty** | Repair/Replace | **In-Stock** | Returned to circulation. |

---

## 5. Return Merchandise Authorization (RMA) Logic

*   **Initiation**: User selects a serial number (unit) from the site inventory.
*   **Validation**: Check if the item is still under warranty (calculated from `line_item.warranty_start`).
*   **Stock Adjustment**: When an RMA is initiated, the unit's site location is cleared, and it's marked as `Faulty`.
*   **Receiving**: When the vendor receives the item, the RMA status is updated.
