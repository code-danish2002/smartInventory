// src/components/drawer.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { PlusCircle, LayoutDashboard, FileText, User, Warehouse, Factory, Box, Wrench, Info, Building, ClipboardIcon, ClipboardList, } from 'lucide-react';
import 'inert-polyfill'; // Import the inert polyfill if needed
import { useAuth } from '../context/authContext.jsx';
import AddERP from '../modals/add-ERP.jsx';
import CombinedPdfManager from '../modals/pdfSignUpload.jsx';
import { AiFillSignature } from "react-icons/ai";
import ParentModal from '../modals/parentModal.jsx';
import { FaCertificate } from 'react-icons/fa';

const Drawer = ({ open, setOpenDrawer, handlePoForm, currentRender, setCurrentRender }) => {
  const [addErp, setAddErp] = React.useState(false);
  const [signPdf, setSignPdf] = React.useState(false);
  const [helpMe, setHelpMe] = React.useState(false);
  const { groups } = useAuth();
  if (!open) {
    return null; // Don't render the drawer if it's not open
  }

  //const rightToWrite = true;
  const rightToWrite = groups.includes('item-inspection-admin');

  return (
    // Overlay
    <>
      <div className="fixed inset-0 z-50 flex">
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={() => setOpenDrawer(false)}
        ></div>

        <div className="relative flex flex-col h-full min-w-60 w-auto max-w-max bg-slate-100 shadow-lg overflow-y-auto">
          <div className="display: flex flex-row justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-700">More To Do...</h2>
            <button onClick={() => setOpenDrawer(false)} className="text-gray-500 px-3 py-1 rounded-lg hover:text-gray-700 hover:bg-gray-300 text-lg">
              &times;
            </button>
          </div>

          {/* <div className="flex flex-col items-center justify-center  p-2">
            <button onClick={() => setSignPdf(true)} className='flex flex-row items-center justify-center gap-2 p-4 bg-cyan-100 hover:bg-cyan-200 rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs'>
              <AiFillSignature size={24} className="text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-700">Sign PDF</h3>
            </button>
          </div> */}

          {/* <div className="flex flex-col items-center justify-center  p-2">
            <button onClick={() => setAddErp(true)} className='flex flex-row items-center justify-center gap-2 p-4 bg-cyan-100 hover:bg-cyan-200 rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs'>
              <PlusCircle size={24} className="text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-700">New ERP</h3>
            </button>
          </div> */}

          <div className="flex flex-col p-2 space-y-2">
            <button onClick={() => handlePoForm()} className='flex flex-row items-center justify-start gap-2 p-4 bg-blue-100 hover:bg-blue-200 rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs'>
              <PlusCircle size={24} className="text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-700">Inspection</h3>
            </button>
          
            <button onClick={() => setCurrentRender('Dashboard')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Dashboard' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <LayoutDashboard size={18} className="text-gray-500" />
              Dashboard
            </button>
            <button onClick={() => setCurrentRender('Certificates')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Certificates' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <FaCertificate size={18} className="text-gray-500" />
              Certificates
            </button>
          {/* {rightToWrite && (
            <button onClick={() => setCurrentRender('All POs')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'All POs' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <FileText size={18} className="text-gray-500" />
              Show All POs
            </button>
          )} */}
          {rightToWrite && (
            <button onClick={() => setCurrentRender('Type')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Type' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <ClipboardList size={18} className="text-gray-500" />
              Type
            </button>
          )}
          {rightToWrite && (
            <button onClick={() => setCurrentRender('Make')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Make' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <Factory size={18} className="text-gray-500" />
              Make
            </button>
          )}
          {rightToWrite && (
            <button onClick={() => setCurrentRender('Model')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Model' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <Box size={18} className="text-gray-500" />
              Model
            </button>
          )}
          {rightToWrite && (
            <button onClick={() => setCurrentRender('Part')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Part' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <Wrench size={18} className="text-gray-500" />
              Part
            </button>
          )}
          {rightToWrite && (
            <button onClick={() => setCurrentRender('Firm')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Firm' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <Building size={18} className="text-gray-500" />
              Firm
            </button>
          )}
          {rightToWrite && (
            <button onClick={() => setCurrentRender('Stores')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Stores' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <Warehouse size={18} className="text-gray-500" />
              Stores
            </button>
          )}
          {/* {rightToWrite && (
            <button onClick={() => setCurrentRender('Users')} className={`flex flex-row items-center justify-start gap-2 p-4 ${currentRender === 'Users' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              <User size={18} className="text-gray-500" />
              Users
            </button>
          )} */}
          </div>
          {/* help and  guidelines */}
          <div className="mt-auto flex flex-col items-center justify-center p-4 border-t">
            {/* Help & Support Link */}
            <div className="flex flex-row gap-1 items-center mb-2">
              <Info size={16} className="text-gray-500" />
              <p
                onClick={() => setHelpMe(true)}
                className="text-sm text-gray-500 hover:underline hover:text-sky-500 cursor-pointer"
              >
                Help & Support
              </p>
            </div>
            {/* Version Info */}
            <div>
              <p className="text-xs text-gray-500">Version 2.0 | &copy; 2025 RCIL.</p>
            </div>
          </div>
        </div>
      </div >
      {addErp && (<AddERP isOpen={addErp} onClose={() => setAddErp(false)} />)}
      {signPdf && (<CombinedPdfManager isOpen={signPdf} onCancel={() => setSignPdf(false)} onSubmit={() => setSignPdf(false)} />)}
        {helpMe && (<ParentModal modalName={'Help & Support'} isOpen={helpMe} onClose={() => setHelpMe(false)} type={'help&support'} />)}
    </>
  );
};

// Prop Types for better type checking
Drawer.propTypes = {
  open: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
};

export default Drawer;

