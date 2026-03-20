# API Usage List

This document provides a comprehensive list of all APIs directly used in the Smart Inventory project, including their locations in the source code.

---

## 1. Authentication & Profile
- **POST** `/refresh` - Used for refreshing access tokens using a refresh token. [`apiCall.js(38, 52)`]
- **GET** `/api/user-details/searchByUserName` - Used in form selection to search for users. [`selectItems.jsx(773)`, `dispatchForm.jsx(65)`, `initiateRMAform.jsx(275, 300)`, `itemsCard.jsx(201)`, `PO-form.jsx(121)`]
- **GET** `/api/user-details-by-name/${name}` - Used to fetch user details during form population. [`PO-form.jsx(143)`]

## 2. Dashboard & Statistics
- **GET** `/api/dashboard/counts` - Fetches high-level counts for the dashboard cards. [`endpoints.jsx(4)`]
- **GET** `/api/dashboard/${phaseId}` - Fetches detailed table data based on the selected phase. [`useItemQueries.js(9)`]
- **WS** `/ws/dashboard` - Real-time dashboard updates via WebSocket. [`dashboard.jsx(140)`]

## 3. Purchase Order (PO) Management
- **GET** `/api/pos` - Fetches the list of Purchase Orders. [`endpoints.jsx(96)`]
- **POST** `/api/pos` - Creates a new Purchase Order. [`PO-form.jsx(221)`, `endpoints.jsx(93)`]
- **PUT** `/api/pos-correction/{po_id}` - Updates or corrects an existing PO. [`PO-form.jsx(221)`, `endpoints.jsx(94)`]
- **GET** `/api/po/details` - Fetches specific details for a PO. [`useModalLogic.js(48, 101)`, `endpoints.jsx(97)`]
- **GET** `/api/pos_flat` - Fetches a flat list of POs for inventory views. [`myInventory.jsx(215)`]
- **GET** `/api/fullPoDataByPoId/${id}` - Fetches all information related to a specific PO. [`useTableActions.js(49)`]
- **GET** `/api/allPoLineDataByPoId/${id}` - Fetches all line item data for a specific PO. [`lineItemsApproval.jsx(38)`, `myInventory.jsx(66)`]
- **GET** `/api/poNumberData` - Validates/checks PO numbers. [`PO-form.jsx(121)`]
- **GET** `/api/poCreatedData/${id}` - Fetches data for a newly created PO. [`PO-form.jsx(84)`]

### Line Items & Item Details (within PO)
- **GET** `/api/poLine/{po_id}/line-items` - Fetches line items for a specific PO. [`useModalLogic.js(48, 101)`, `endpoints.jsx(104)`]
- **POST** `/api/po/line-items/create` - Adds a line item to a PO. [`useModalLogic.js(55)`, `endpoints.jsx(101)`]
- **POST** `/api/po/line-items/update` - Updates a line item. [`useModalLogic.js(55)`, `endpoints.jsx(102)`]
- **GET** `/api/line-items/{po_line_item_id}/items` - Fetches items assigned to a line item. [`useModalLogic.js(48, 101)`, `endpoints.jsx(111)`]
- **POST** `/api/po/item-details/create` - Adds specific item details (serial numbers, etc.). [`useModalLogic.js(55)`, `endpoints.jsx(108)`]

### PO Reports & PDFs
- **GET** `/api/po_details_for_pdf` - Fetches PO details for PDF generation. [`certificatesPage.jsx(338)`, `endpoints.jsx(9)`]
- **GET** `/api/po-pdfs/${poNumber}` - Downloads generated PDF reports. [`certificatesPage.jsx(224)`]
- **POST** `/api/pos/{po_id}/upload` - Uploads signed/scanned PDF documents. [`useModalLogic.js(55)`, `endpoints.jsx(115)`]

## 4. Master Data
- **GET / POST / PUT / DELETE** `/api/firm/details` (GET), `/api/firm/names` (POST/PUT), `/api/firm/delete` (DELETE) - Management of Vendor information. [`MasterDataView.jsx(46)`, `add-new-subItem.jsx(76)`, `useModalLogic.js(53)`, `endpoints.jsx(18, 20, 31, 41)`]
- **GET / POST / DELETE** `/api/item-types` - Management of Item Types. [`MasterDataView.jsx(46)`, `add-new-subItem.jsx(39)`, `endpoints.jsx(45, 47, 52)`]
- **GET / POST / DELETE** `/api/item-makes` - Management of Manufacturers. [`MasterDataView.jsx(46)`, `add-new-subItem.jsx(49)`, `endpoints.jsx(56, 58, 64)`]
- **GET** `/api/item-makes/by-type/${typeId}` - Fetches makes filtered by type. [`useItemQueries.js(37)`, `itemsForm.jsx(208)`]
- **GET / POST / DELETE** `/api/item-models` - Management of Models. [`MasterDataView.jsx(46)`, `add-new-subItem.jsx(59)`, `endpoints.jsx(68, 70, 76)`]
- **GET** `/api/item-models/by-make/${makeId}` - Fetches models filtered by make. [`useItemQueries.js(53)`, `itemsForm.jsx(251)`]
- **GET / POST / DELETE** `/api/item-parts` - Management of Parts. [`MasterDataView.jsx(46)`, `add-new-subItem.jsx(59)`, `endpoints.jsx(80, 82, 89)`]
- **GET** `/api/item-parts/by-model/${modelId}` - Fetches parts filtered by model. [`useItemQueries.js(69)`, `itemsForm.jsx(291)`]
- **GET / POST / PUT / DELETE** `/api/stores` - Management of Warehouses. [`MasterDataView.jsx(46)`, `endpoints.jsx(129, 131, 138, 144, 145)`]
- **GET** `/api/stores/searchByStoreName` - Search for store locations. [`selectItems.jsx(723)`, `dispatchForm.jsx(51)`, `itemsCard.jsx(153)`]
- **GET** `/api/pops/searchByPopName` - Search for POP locations. [`add-new-subItem.jsx(116)`]

## 5. Inventory Workflow & Tracking
- **POST / PUT** `/api/inspection/{id}` - Processes inspection results. [`useModalLogic.js(55)`, `endpoints.jsx(119)`]
- **POST / PUT** `/api/store-items/action` - Moves items into storage. [`useModalLogic.js(32, 55)`, `endpoints.jsx(125)`]
- **POST / PUT** `/api/site-items/action` - Dispatches items to sites. [`useModalLogic.js(32, 55)`, `endpoints.jsx(149)`]
- **GET** `/api/tracking/{po_item_details_id}` - Fetches tracking trail for an item. [`useModalLogic.js(48, 101)`, `endpoints.jsx(153, 157)`]
- **GET** `/api/tracking/serial/${serialNumber}` - Fetches details by serial number. [`showItemsDetails.jsx(38)`]
- **POST** `/api/store-items` - General store item actions. [`handleModalApiCalls.jsx(11)`, `endpoints.jsx(120)`]
- **POST** `/api/dispatches` - General dispatch actions. [`handleModalApiCalls.jsx(12)`, `endpoints.jsx(121)`]

## 6. Return Merchandise Authorization (RMA)
- **GET** `/api/rma` - Fetches the list of RMA requests. [`RMA_dashboard.jsx(52)`]
- **POST** `/api/rma` - Initiates a new RMA request. [`initiateRMAform.jsx(129)`]
- **PUT** `/api/rma/${rma_id}` - Updates tracking or status of an RMA. [`RMA_dashboard.jsx(214)`]
- **PUT** `/api/rma/${rma_id}/receive` - Marks an RMA item as received. [`RMA_dashboard.jsx(170)`]
- **GET** `/api/rma_serial_number` - Validates a serial number for RMA. [`initiateRMAform.jsx(75)`]

---

## 7. Unused / Legacy Endpoints
The following endpoints are defined in `endpoints.jsx` but are currently not used by active components:

- **XYZ** `/api/...` - Some Description.

---
*Note: This list is generated based on direct calls in the frontend source code and may change as features are added or removed.*
