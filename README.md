# RCIL Smart Inventory Management System

**RCIL Smart Inventory Management System** is a comprehensive web-based platform designed for tracking and managing purchase orders, inventory items, and assets throughout their entire lifecycle. From initial inspection and approval to storage, site deployment, and live status monitoring, this system provides a centralized hub for inventory operations.

## 🚀 Key Features

- **Inventory Tracking:** Real-time monitoring of item movements and status changes (Inspection → Store → Site → Live).
- **Purchase Order (PO) Management:** Full workflow for PO creation, tracking line items, and managing approvals.
- **RMA Management:** Streamlined Return Merchandise Authorization process for defective or returned items.
- **Document Management:** Integrated PDF uploading and digital signing for certificates and dispatch documents.
- **Role-Based Workflows:** Secure access control and workflows tailored for different operational roles.
- **Reporting & Dashboards:** Visual insights into inventory counts, status distributions, and transaction history.

## 🛠️ Tech Stack

- **Frontend Framework:** [React](https://reactjs.org/) (v18)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **State Management & Data Fetching:** [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **UI Components:** [Material UI (MUI)](https://mui.com/), [Framer Motion](https://www.framer.com/motion/) (Animations)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) with [Yup](https://github.com/jquense/yup) validation.
- **Routing:** [React Router](https://reactrouter.com/) (v6)
- **Authentication:** [Keycloak JS](https://www.keycloak.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [PostCSS](https://postcss.org/)
- **PDF Processing:** [pdf-lib](https://pdf-lib.js.org/), [jspdf](https://github.com/parallax/jsPDF), [react-pdf](https://projects.wojtekmaj.pl/react-pdf/)
- **Storage:** [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Utilities:** [Axios](https://axios-http.com/), [Lucide React](https://lucide.dev/) (Icons), [date-fns](https://date-fns.org/)

## 📂 Project Structure

```text
src/
├── api/            # API integration logic
├── assets/         # Images, fonts, and static assets
├── components/     # Reusable UI components and page layouts
├── context/        # React Context providers (Auth, Toast, etc.)
├── hooks/          # Custom React hooks
├── modals/         # Modal dialog components
├── utils/          # Helper functions and API endpoints configuration
└── validations/    # Form validation schemas
```

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Recommended: Latest LTS)
- npm or yarn

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server:
```bash
npm run dev
```

### Building for Production

To create an optimized production build:
```bash
npm run build
```

## 🌐 API Configuration

API endpoints are centrally managed in `src/utils/endpoints.jsx`. This centralized configuration allows for easy updates to API paths and ensures consistency across the application.

## 🔐 Authentication

The application uses **Keycloak** for secure authentication. Configuration details can be found in the authentication context.