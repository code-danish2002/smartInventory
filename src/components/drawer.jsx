// src/components/drawer.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { PlusCircle } from 'lucide-react';
import 'inert-polyfill'; // Import the inert polyfill if needed
import { useAuth } from '../context/authContext.jsx';
import AddERP from '../modals/add-ERP.jsx';

const Drawer = ({ open, setOpenDrawer, handlePoForm, currentRender, setCurrentRender }) => {
  const [addErp, setAddErp] = React.useState(false);
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

          {rightToWrite && <div className="flex flex-col items-center justify-center  p-2">
            <button onClick={() => setAddErp(true)} className='flex flex-row items-center justify-center gap-2 p-4 bg-cyan-100 hover:bg-cyan-200 rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs'>
              <PlusCircle size={24} className="text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-700">New ERP</h3>
            </button>
          </div>}

          <div className="flex flex-col items-center justify-center  p-2">
            <button onClick={() => handlePoForm()} className='flex flex-row items-center justify-center gap-2 p-4 bg-blue-100 hover:bg-blue-200 rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs'>
              <PlusCircle size={24} className="text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-700">New PO</h3>
            </button>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <button onClick={() => setCurrentRender('Dashboard')} className={`flex flex-row items-center justify-center gap-2 p-4 ${currentRender === 'Dashboard' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              Dashboard
            </button>
          </div>
          {rightToWrite && <div className="flex flex-col items-center justify-center p-2">
            <button onClick={() => setCurrentRender('All POs')} className={`flex flex-row items-center justify-center gap-2 p-4 ${currentRender === 'All POs' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              Show All POs
            </button>
          </div>}
          {rightToWrite && <div className="flex flex-col items-center justify-center p-2">
            <button onClick={() => setCurrentRender('Type')} className={`flex flex-row items-center justify-center gap-2 p-4 ${currentRender === 'Type' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              Type
            </button>
          </div>}
          {rightToWrite && <div className="flex flex-col items-center justify-center p-2">
            <button onClick={() => setCurrentRender('Make')} className={`flex flex-row items-center justify-center gap-2 p-4 ${currentRender === 'Make' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              Make
            </button>
          </div>}
          {rightToWrite && <div className="flex flex-col items-center justify-center p-2">
            <button onClick={() => setCurrentRender('Model')} className={`flex flex-row items-center justify-center gap-2 p-4 ${currentRender === 'Model' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              Model
            </button>
          </div>}
          {rightToWrite && <div className="flex flex-col items-center justify-center p-2">
            <button onClick={() => setCurrentRender('Part')} className={`flex flex-row items-center justify-center gap-2 p-4 ${currentRender === 'Part' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              Part
            </button>
          </div>}
          {rightToWrite && <div className="flex flex-col items-center justify-center p-2">
            <button onClick={() => setCurrentRender('Firm')} className={`flex flex-row items-center justify-center gap-2 p-4 ${currentRender === 'Firm' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              Firm
            </button>
          </div>}
          {rightToWrite && <div className="flex flex-col items-center justify-center p-2">
            <button onClick={() => setCurrentRender('Stores')} className={`flex flex-row items-center justify-center gap-2 p-4 ${currentRender === 'Stores' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              Stores
            </button>
          </div>}
          {rightToWrite && <div className="flex flex-col items-center justify-center p-2">
            <button onClick={() => setCurrentRender('Users')} className={`flex flex-row items-center justify-center gap-2 p-4 ${currentRender === 'Users' ? 'bg-gray-200' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs`}>
              Users
            </button>
          </div>}
          <div className="mt-auto flex items-center justify-center p-4 border-t">
            <p className="text-sm text-gray-500">Version 2.0 | &copy; 2025 RCIL.</p>
          </div>
        </div>
      </div>
      {addErp && (<AddERP isOpen={addErp} onClose={() => setAddErp(false)} />)}
    </>
  );
};

// Prop Types for better type checking
Drawer.propTypes = {
  open: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
};

export default Drawer;

