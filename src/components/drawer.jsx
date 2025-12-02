import React from 'react';
import PropTypes from 'prop-types';
import {
  PlusCircle, LayoutDashboard, FileText, User, Warehouse, Factory, Box, Wrench, Info, Building, ClipboardIcon, ClipboardList, X, ChevronLeft, ChevronRight, PackageX,
  Dock,} from 'lucide-react';
//import AddERP from '../dump/add-ERP.jsx';
import CombinedPdfManager from '../modals/pdfSignUpload.jsx';
import ParentModal from '../modals/parentModal.jsx';
import { FaCertificate } from 'react-icons/fa';
import { ShowItemsDetails } from '../modals/showItemsDetails.jsx';
import { useCurrentRender } from '../context/renderContext.jsx';
import PurchaseOrderFormModal from './create-po/PO-form.jsx';

const Drawer = ({ open, setOpenDrawer, rightToWrite }) => {
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
        {/* =================================================================== */}

        <div className="flex flex-col mt-2 px-2 lg:overflow-y-auto lg:px-4">
          {/* <button
            onClick={() => setOpenDrawer(false)}
            className="lg:hidden flex flex-row items-center justify-center gap-2 text-gray-500 text-center rounded-lg hover:text-gray-700 hover:bg-gray-200 p-2 leading-none"
            aria-label="Close menu"
          >
            <X size={24} />
          </button> */}
          <input className="w-full px-4 py-2 text-gray-700 bg-white border rounded-md focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
            placeholder="Search Item..."
            value={SearchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            onKeyDown={handleSearchItem}
          />
        </div>

        <div className="flex flex-col p-2 space-y-2 lg:flex-1 lg:overflow-y-auto lg:p-4">
          <button
            onClick={() => setInitiatePO({ open: true, data: {}, task: 'Create Inspection' })}
            className={`flex flex-row items-center justify-start gap-2 p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs ${currentRender === 'Inspection Form' ? 'bg-gray-200 font-medium' : 'bg-blue-100 hover:bg-blue-200'}`}>
            <PlusCircle size={24} className="text-gray-700" />
            <h3 className="text-xl font-semibold text-gray-700">Initiate PO</h3>
          </button>
          <button
            onClick={() => handleSetCurrentRender('RMA')}
            className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'RMA' ? 'bg-gray-200 font-medium' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}
          >
            <PackageX size={18} className="text-gray-500" />
            RMA
          </button>

          <button onClick={() => handleSetCurrentRender('Dashboard')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Dashboard' ? 'bg-gray-200 font-medium' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
            <LayoutDashboard size={18} className="text-gray-500" />
            Dashboard
          </button>
          <button onClick={() => handleSetCurrentRender('Inventory')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Inventory' ? 'bg-gray-200 font-medium' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
            <Dock size={18} className="text-gray-500" />
            My Inventory
          </button>
          <button onClick={() => handleSetCurrentRender('Certificates')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Certificates' ? 'bg-gray-200 font-medium' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
            <FaCertificate size={18} className="text-gray-500" />
            Certificates
          </button>

          {rightToWrite && (
            <button onClick={() => handleSetCurrentRender('Type')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Type' ? 'bg-gray-200 font-medium' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <ClipboardList size={18} className="text-gray-500" />
              Type
            </button>
          )}
          {rightToWrite && (
            <button onClick={() => handleSetCurrentRender('Make')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Make' ? 'bg-gray-200 font-medium' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <Factory size={18} className="text-gray-500" />
              Make
            </button>
          )}
          {rightToWrite && (
            <button onClick={() => handleSetCurrentRender('Model')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Model' ? 'bg-gray-200 font-medium' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <Box size={18} className="text-gray-500" />
              Model
            </button>
          )}
          {rightToWrite && (
            <button onClick={() => handleSetCurrentRender('Part')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Part' ? 'bg-gray-200 font-medium' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <Wrench size={18} className="text-gray-500" />
              Part
            </button>
          )}
          {rightToWrite && (
            <button onClick={() => handleSetCurrentRender('Firm')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Firm' ? 'bg-gray-200 font-medium' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <Building size={18} className="text-gray-500" />
              Firm
            </button>
          )}
          {rightToWrite && (
            <button onClick={() => handleSetCurrentRender('Stores')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Stores' ? 'bg-gray-200 font-medium' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <Warehouse size={18} className="text-gray-500" />
              Stores
            </button>
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
        {/* {addErp && (<AddERP isOpen={addErp} onClose={() => setAddErp(false)} />)} */}
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

// Prop Types for better type checking
Drawer.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpenDrawer: PropTypes.func.isRequired,
  rightToWrite: PropTypes.bool.isRequired,
};

export default Drawer;