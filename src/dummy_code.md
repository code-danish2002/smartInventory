# Modern UI/UX Code Reference

Use this file to copy-paste the "Modern Professional" (Slate + Indigo) theme components and styles into your project manually.

---

## 1. Global Styles
**File:** `src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-['Inter'] bg-slate-50 text-slate-900 antialiased;
  }
}
```

---

## 2. UI Components

### Button Component
**File:** `src/components/ui/Button.jsx`

```jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  disabled = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
```

### Card Component
**File:** `src/components/ui/Card.jsx`

```jsx
import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
```

### Badge Component
**File:** `src/components/ui/Badge.jsx`

```jsx
import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  const variants = {
    default: "bg-slate-100 text-slate-800",
    primary: "bg-indigo-100 text-indigo-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    dot: "pl-2 pr-2.5 py-1 gap-1.5", 
  };
  
  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
```

---

## 3. Layout Components

### Drawer (Sidebar)
**File:** `src/components/drawer.jsx`

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
  PlusCircle, LayoutDashboard, User, Warehouse, Factory, Box, Wrench, Info, Building, ClipboardList, X, ChevronLeft, ChevronRight, PackageX,
  Dock,
} from 'lucide-react';
import CombinedPdfManager from '../modals/pdfSignUpload.jsx';
import ParentModal from '../modals/parentModal.jsx';
import { FaCertificate } from 'react-icons/fa';
import { ShowItemsDetails } from '../modals/showItemsDetails.jsx';
import { useCurrentRender } from '../context/renderContext.jsx';
import PurchaseOrderFormModal from './create-po/PO-form.jsx';

const NavItem = ({ label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full mb-1
      ${active 
        ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
  >
    <Icon size={18} className={active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"} />
    <span>{label}</span>
  </button>
);

const NavSection = ({ title, children }) => (
  <div className="mb-4">
    {title && <h4 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</h4>}
    <div className="space-y-0.5">
      {children}
    </div>
  </div>
);

const Drawer = ({ open, setOpenDrawer, rightToWrite, relationEngineerRights }) => {
  const [addErp, setAddErp] = React.useState(false);
  const [signPdf, setSignPdf] = React.useState(false);
  const [helpMe, setHelpMe] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [SearchItem, setSearchItem] = React.useState('');
  const { currentRender, handleSetCurrentRender } = useCurrentRender();
  const [initiatePO, setInitiatePO] = React.useState({ open: false, data: null, task: 'Create Inspection' });

  const handleSearchItem = (e) => {
    if (e.key === "Enter") {
      const searchTerm = e.target.value.trim();
      if (searchTerm) {
        setSearchItem(searchTerm);
        setOpenModal(true);
      }
      return;
    }
  };

  const closeModal = () => {
    setOpenModal(false);
    setSearchItem('');
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpenDrawer(true)}
        className="fixed top-24 left-0 w-4 h-12 flex items-center justify-center bg-white border border-l-0 border-slate-200 shadow-md z-40 rounded-r-lg hover:bg-slate-50 transition-all duration-300 group"
        aria-label="Open menu"
      >
        <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden" onClick={() => setOpenDrawer(false)}></div>

      <div className="fixed lg:z-auto z-50 inset-y-0 left-0 lg:flex lg:flex-col h-full w-64 lg:w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out">
        <button
          onClick={() => setOpenDrawer(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
          aria-label="Collapse menu"
        >
          <X size={20} />
        </button>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100">
          <input className="w-full px-3 py-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
            placeholder="Search Serial Number..."
            value={SearchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            onKeyDown={handleSearchItem}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

          <div className="mb-6">
            <button
              onClick={() => setInitiatePO({ open: true, data: {}, task: 'Create Inspection' })}
              className={`flex items-center justify-center gap-2 p-3 w-full rounded-lg font-semibold shadow-sm transition-all duration-200 
                ${currentRender === 'Inspection Form'
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
            >
              <PlusCircle size={20} />
              <span>Initiate PO</span>
            </button>
          </div>

          <NavSection title="Overview">
            <NavItem
              label="Dashboard"
              icon={LayoutDashboard}
              active={currentRender === 'Dashboard'}
              onClick={() => handleSetCurrentRender('Dashboard')}
            />
            <NavItem
              label="Return Merchandise (RMA)"
              icon={PackageX}
              active={currentRender === 'RMA'}
              onClick={() => handleSetCurrentRender('RMA')}
            />
            <NavItem
              label="My Inventory"
              icon={Dock}
              active={currentRender === 'Inventory'}
              onClick={() => handleSetCurrentRender('Inventory')}
            />
            <NavItem
              label="Certificates"
              icon={FaCertificate}
              active={currentRender === 'Certificates'}
              onClick={() => handleSetCurrentRender('Certificates')}
            />
          </NavSection>

          {rightToWrite && (
            <NavSection title="Master Data">
              <NavItem label="Type" icon={ClipboardList} active={currentRender === 'Type'} onClick={() => handleSetCurrentRender('Type')} />
              <NavItem label="Make" icon={Factory} active={currentRender === 'Make'} onClick={() => handleSetCurrentRender('Make')} />
              <NavItem label="Model" icon={Box} active={currentRender === 'Model'} onClick={() => handleSetCurrentRender('Model')} />
              <NavItem label="Part" icon={Wrench} active={currentRender === 'Part'} onClick={() => handleSetCurrentRender('Part')} />
              <NavItem label="Firm" icon={Building} active={currentRender === 'Firm'} onClick={() => handleSetCurrentRender('Firm')} />
              <NavItem label="Stores" icon={Warehouse} active={currentRender === 'Stores'} onClick={() => handleSetCurrentRender('Stores')} />
            </NavSection>
          )}

        </div>

        {/* help and guidelines */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setHelpMe(true)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors w-full px-2"
          >
            <Info size={16} />
            <span>Help & Support</span>
          </button>
        </div>

        {/* Modals - (Same as original) */}
        {signPdf && (<CombinedPdfManager isOpen={signPdf} onCancel={() => setSignPdf(false)} onSubmit={() => setSignPdf(false)} />)}
        {helpMe && (<ParentModal modalName={'Help & Support'} isOpen={helpMe} onClose={() => setHelpMe(false)} type={'help&support'} />)}
        {openModal && (
          <ShowItemsDetails serialNumber={SearchItem} closeModal={closeModal} />
        )}
        {initiatePO.open && (
          <PurchaseOrderFormModal
            isOpen={initiatePO.open}
            onClose={() => setInitiatePO({ open: false, data: null, task: 'Create Inspection' })}
            defaultValues={initiatePO.data}
            task={initiatePO.task}
          />
        )}
      </div>
    </>
  );
};

Drawer.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpenDrawer: PropTypes.func.isRequired,
  rightToWrite: PropTypes.bool.isRequired,
};

export default Drawer;
```

### Main Layout
**File:** `src/components/wrapperLayout.jsx`

```jsx
import React from "react";
import { useAuth } from "../context/authContext";
import { AddSquare, EmailIcon, ProfileDuotone, UserCircleSolid } from "../utils/icons";
import { ContentLoading } from "../globalLoading";
import Drawer from "./drawer";
import ParentModal from "../modals/parentModal";
import RailTelLogo from "../assets/railtel_1.svg";
import { useCurrentRender } from "../context/renderContext";

const Layout = ({
    title = "Smart Inventory",
    subTitle = "",
    action,
    children,
    loading = false,
    refreshData,
    drawerProps = {},
}) => {
    const { groups } = useAuth();
    const rightToWrite = groups?.includes('item-inspection-admin');
    const relationEngineerRights = groups?.includes('item-inspection-relation-engineer');
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const { username, name, email, logout } = useAuth();
    const [openModal, setOpenModal] = React.useState(false);
    const profileButtonRef = React.useRef(null);

    const { handleSetCurrentRender } = useCurrentRender();

    const [openDrawer, setOpenDrawer] = React.useState(() => {
        const saved = localStorage.getItem('drawerOpen');
        return saved ? JSON.parse(saved) : false;
    });

    React.useEffect(() => {
        localStorage.setItem('drawerOpen', JSON.stringify(openDrawer));
    }, [openDrawer]);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const layoutBgClass = "bg-slate-50";
    const headerBgClass = "bg-white"; 
    const footerBgClass = layoutBgClass;
    const mainContentBgClass = "bg-slate-50/50";
    const borderClass = "border-slate-200";

    return (
        <div className="flex flex-col h-screen transform transition-transform duration-300 font-sans text-slate-900 bg-slate-50">
            <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 ${headerBgClass} border-b ${borderClass}`}>

                <div className="flex items-start w-full sm:w-auto order-1 mb-2 sm:mb-0">
                    <img src={RailTelLogo} alt="Logo" className="w-12 h-12 mr-3" />

                    <div className="flex flex-col truncate justify-center h-12">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 truncate leading-tight">
                            {title}
                        </h1>
                        {subTitle && (
                            <h2 className="text-sm font-medium text-indigo-600 truncate">
                                {subTitle}
                            </h2>
                        )}
                    </div>
                </div>

                <div className="flex-1 w-full sm:w-auto order-3 sm:order-2 mt-2 sm:mt-0 flex justify-center sm:justify-end sm:ml-4">
                    {action && (
                        <div className="w-full sm:w-auto flex justify-center sm:justify-end gap-2">
                            {action}
                            {['Make', 'Model', 'Part', 'Stores'].includes(subTitle) && <button
                                onClick={() => { setOpenModal(true); }}
                                className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition duration-150 ease-in-out"
                            >
                                <AddSquare className="h-5 w-5" /> {subTitle}
                            </button>}
                        </div>
                    )}
                </div>

                <div className="order-2 sm:order-3 absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto sm:w-auto">
                    <div className="relative" ref={profileButtonRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-full text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                            aria-haspopup="true"
                            aria-expanded={isProfileOpen}
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                {name ? name.charAt(0).toUpperCase() : <UserCircleSolid className="w-6 h-6" />}
                            </div>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 ring-1 ring-black ring-opacity-5">
                                <div className="p-4">
                                    <p className="text-base font-semibold text-slate-800 mb-1 truncate">{name || "User"}</p>
                                    <p className="text-xs text-slate-500 mb-4 truncate">{email || "No email"}</p>

                                    <div className="pt-2 border-t border-slate-100">
                                        <button
                                            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition duration-150"
                                            onClick={logout}
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                <Drawer
                    {...drawerProps}
                    rightToWrite={rightToWrite}
                    relationEngineerRights={relationEngineerRights}
                    open={openDrawer}
                    setOpenDrawer={setOpenDrawer}
                />

                <div className={`flex-1 overflow-auto p-6 ${mainContentBgClass} transition-all duration-300`}>
                    {loading ? <ContentLoading /> : children}
                </div>
            </div>

            <footer className={`p-2 border-t ${borderClass} ${footerBgClass}`}>
                <p className="text-xs text-slate-400 text-center">Version 2.0 | &copy; 2025 RCIL.</p>
            </footer>
            {openModal && (<ParentModal modalName={subTitle} isOpen={openModal} onClose={() => setOpenModal(false)} type='create' onAction={refreshData} />)}
        </div>
    );
};

export default Layout;
```

---

## 4. Feature Components

### RMA Dashboard
**File:** `src/components/RMA/RMA_dashboard.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import { RefreshCw, FileText, Package, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Truck, Box } from 'lucide-react';
// import AsyncSelect from 'react-select/async'; 
// import { commonSelectProps } from '../../utils/CommonCSS';
import { useToast } from '../../context/toastProvider';
import api from '../../api/apiCall';
import { ContentLoading } from '../../globalLoading';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const getStatusConfig = (status) => {
    switch (status) {
        case 'RMA Generated':
            return { variant: 'warning', icon: Clock, label: 'Pending' };
        case 'Dispatch Initiated':
            return { variant: 'primary', icon: Truck, label: 'Dispatched' };
        case 'In Transit - Repairing':
            return { variant: 'primary', icon: RefreshCw, label: 'In Repair' };
        case 'Item Commissioned':
            return { variant: 'success', icon: CheckCircle, label: 'Commissioned' };
        case 'Rejected':
            return { variant: 'danger', icon: XCircle, label: 'Rejected' };
        default:
            return { variant: 'default', icon: FileText, label: status };
    }
};

const RmaDashboard = () => {
    const [rmaList, setRmaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const addToast = useToast();
    const [expandedId, setExpandedId] = useState(null);
    const [dispatchDetails, setDispatchDetails] = useState({});

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);


    useEffect(() => {
        if (!loading) {
            setLoading(true);
        }
        api.get('/api/rma', {
            params: {
                page: currentPage,
                limit: limit
            }
        })
            .then((res) => {
                if (res.data.success) {
                    setRmaList(res.data.data);
                    setTotalPages(res.data.pagination.totalPages);
                    setTotalRecords(res.data.pagination.total);
                }
            })
            .catch((error) => console.log(error))
            .finally(() => setLoading(false));
    }, [refreshData, currentPage, limit]);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) {
        return <ContentLoading />
    }

    return (
        <Card className="h-[75vh] flex flex-col overflow-hidden bg-white shadow-sm border-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                         <Package className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                         <h2 className="text-xl font-bold text-slate-900">RMA Status Tracker</h2>
                         <p className="text-sm text-slate-500">Manage and track return merchandise authorizations</p>
                    </div>
                </div>
                <Badge variant="default" className="text-sm px-3 py-1">
                    Total: {totalRecords}
                </Badge>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {rmaList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <Package className="w-12 h-12 mb-2 opacity-50" />
                        <p className="italic">No RMA requests found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rmaList.map((rma) => {
                            const isExpanded = expandedId === rma.rma_id;
                            const { variant, icon: StatusIcon, label } = getStatusConfig(rma.item_status);

                            return (
                                <div
                                    key={rma.ram_id || rma.rma_id} 
                                    className={`bg-white rounded-lg border transition-all duration-200 ${isExpanded ? 'border-indigo-200 shadow-md ring-1 ring-indigo-50' : 'border-slate-200 hover:border-indigo-200 hover:shadow-sm'}`}
                                >
                                    {/* Header Row */}
                                    <div
                                        className="p-4 cursor-pointer flex items-center gap-4"
                                        onClick={() => toggleExpand(rma.rma_id)}
                                    >
                                        <div className={`p-2 rounded-full ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                            <Box size={20} />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Product</p>
                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                    {rma.product_name || 'N/A'} <span className="text-slate-400 font-normal">/</span> {rma.serial_number || rma.old_serial_number_at_rma || rma.new_serial_number}
                                                </p>
                                            </div>
                                            <div className="hidden md:block">
                                                 <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">RMA Number</p>
                                                 <p className="text-sm font-mono text-slate-700">{rma.rma_number}</p>
                                            </div>
                                            <div className="flex justify-start md:justify-end">
                                                <Badge variant={variant} className="gap-1.5 pl-1.5 pr-2.5 py-1">
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {label} ({rma.item_status})
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="text-slate-400">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50/30 rounded-b-lg">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm mb-6">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Fault Date</p>
                                                    <p className="text-slate-900 font-medium">{new Date(rma.fault_date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Requested On</p>
                                                    <p className="text-slate-900 font-medium">{new Date(rma.rma_date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Tracking #</p>
                                                    <p className="text-slate-900 font-mono bg-white px-2 py-1 rounded border border-slate-200 inline-block">
                                                        {rma.tracking_number || 'Pending'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Issue Description</p>
                                                    <p className="text-slate-700 italic">{rma.detailed_fault_description || 'No description provided.'}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Internal Notes</p>
                                                    <p className="text-slate-700 font-mono text-xs">{rma.requested_resolution || 'No notes.'}</p>
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-end border-t border-slate-200 pt-4">
                                                
                                                {rma.item_status === 'Item Received' && (
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => {
                                                            api.put(`/api/rma/${rma.rma_id}/commission`, { item_location: rma.item_location })
                                                                .then((res) => {
                                                                    addToast(res);
                                                                    setRefreshData(!refreshData);
                                                                })
                                                                .catch((e) => {
                                                                    addToast(e);
                                                                    console.log(e);
                                                                })
                                                        }}
                                                    >
                                                        Restock Item
                                                    </Button>
                                                )}

                                                {rma.item_status === 'RMA Generated' && (
                                                    <div className="w-full flex flex-col md:flex-row gap-3 items-end">
                                                        <div className="w-full">
                                                            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
                                                                Tracking ID (Required for Dispatch)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter courier tracking ID..."
                                                                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                                                value={dispatchDetails?.tracking_id || ''}
                                                                onChange={(e) =>
                                                                    setDispatchDetails(prev => ({ ...prev, tracking_id: e.target.value }))
                                                                }
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="primary"
                                                            disabled={!dispatchDetails?.tracking_id}
                                                            onClick={() => {
                                                                api.put(`/api/rma/${rma.rma_id}`, {
                                                                    tracking_id: dispatchDetails?.tracking_id,
                                                                })
                                                                    .then((res) => {
                                                                        addToast(res);
                                                                        setRefreshData(!refreshData);
                                                                    })
                                                                    .catch((error) => {
                                                                        addToast(error);
                                                                    });
                                                            }}
                                                        >
                                                            Dispatch Item
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer / Pagination */}
            <div className="border-t border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
                 <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>Rows per page:</span>
                    <select
                        value={limit}
                        onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="form-select text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1"
                    >
                        {[7, 10, 15, 25, 50].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                    <span className="hidden sm:inline text-slate-400">|</span>
                    <span className="hidden sm:inline">
                        Showing <span className="font-medium text-slate-900">{(currentPage - 1) * limit + 1}</span> - <span className="font-medium text-slate-900">{Math.min(currentPage * limit, totalRecords)}</span> of <span className="font-medium text-slate-900">{totalRecords}</span>
                    </span>
                 </div>

                 <div className="flex items-center gap-2">
                    <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-sm font-medium text-slate-600">
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-2"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                 </div>
            </div>
        </Card>
    );
};

export default RmaDashboard;
```
