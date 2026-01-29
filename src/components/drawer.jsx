import React from 'react';
import PropTypes from 'prop-types';
import { PlusCircle, LayoutDashboard, Warehouse, Factory, Box, Wrench, Info, Building, ClipboardList, ChevronLeft, ChevronRight, PackageX, Dock, } from 'lucide-react';
import CombinedPdfManager from '../modals/pdfSignUpload.jsx';
import ParentModal from '../modals/parentModal.jsx';
import { FaCertificate } from 'react-icons/fa';
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

const Drawer = ({ open, setOpenDrawer, isAdmin, isRelationEngineer, isUser }) => {
  const [signPdf, setSignPdf] = React.useState(false);
  const [helpMe, setHelpMe] = React.useState(false);
  const { currentRender, handleSetCurrentRender } = useCurrentRender();
  const [initiatePO, setInitiatePO] = React.useState({ open: false, data: null, task: 'Create Inspection' });

  const overviewRights = isAdmin || isUser;

  if (!open) {
    return (
      // Button to open the drawer when it's closed
      <button
        onClick={() => setOpenDrawer(true)}
        className="fixed top-1/2 left-0 transform -translate-y-1/2 w-4 h-20 flex items-center justify-center bg-black shadow-lg z-50 rounded-r-full hover:bg-gray-700 focus:outline-none transition-all duration-300"
        aria-label="Open menu"
      >
        <ChevronRight size={20} className="text-gray-50" />
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setOpenDrawer(false)}></div>

      <div className="fixed lg:z-auto z-50 inset-y-0 left-0 lg:flex lg:flex-col h-full min-w-60 w-64 lg:w-64 bg-gray-50 shadow-lg border-gray-300 border-r lg:border-r-0 lg:border-b-0 lg:shadow-none lg:inset-auto lg:transform-none flex flex-col transition-transform duration-300 lg:relative">
        <button
          onClick={() => setOpenDrawer(false)}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-full w-4 h-20 flex items-center justify-center bg-gray-100 shadow-lg z-50 rounded-r-full hover:bg-gray-200 focus:outline-none transition-all duration-300"
          aria-label="Collapse menu"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <div className="flex flex-col p-2 space-y-2 lg:flex-1 lg:overflow-y-auto lg:p-4">
          {overviewRights && <div className="mb-6">
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
          </div>}

          <NavSection title="Overview">
            {overviewRights && <NavItem
              label="Dashboard"
              icon={LayoutDashboard}
              active={currentRender === 'Dashboard'}
              onClick={() => handleSetCurrentRender('Dashboard')}
            />}
            <NavItem
              label="Return Merchandise(RMA)"
              icon={PackageX}
              active={currentRender === 'RMA'}
              onClick={() => handleSetCurrentRender('RMA')}
            />
            {isAdmin && <NavItem
              label="My Inventory"
              icon={Dock}
              active={currentRender === 'Inventory'}
              onClick={() => handleSetCurrentRender('Inventory')}
            />}
            {overviewRights && <NavItem
              label="Certificates"
              icon={FaCertificate}
              active={currentRender === 'Certificates'}
              onClick={() => handleSetCurrentRender('Certificates')}
            />}
          </NavSection>

          {isAdmin && (
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
        <div className="mt-auto flex flex-col items-center justify-center p-4 border-t">
          <div className="flex flex-row gap-1 items-center">
            <Info size={16} className="text-gray-500 hover:text-sky-500 cursor-pointer" />
            <p
              onClick={() => setHelpMe(true)}
              className="text-sm text-gray-500 hover:underline hover:text-sky-500 cursor-pointer"
            >
              Help & Support
            </p>
          </div>
        </div>

        {/* Modals */}
        {signPdf && (<CombinedPdfManager isOpen={signPdf} onCancel={() => setSignPdf(false)} onSubmit={() => setSignPdf(false)} />)}
        {helpMe && (<ParentModal modalName={'Help & Support'} isOpen={helpMe} onClose={() => setHelpMe(false)} type={'help&support'} />)}
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

// Prop Types for better type checking
Drawer.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpenDrawer: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export default Drawer;