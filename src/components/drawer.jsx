// import React from 'react';
// import PropTypes from 'prop-types';
// import { PlusCircle, LayoutDashboard, Warehouse, Factory, Box, Wrench, Info, Building, ClipboardList, ChevronLeft, ChevronRight, PackageX, Dock, Sun, Moon } from 'lucide-react';
// import ParentModal from '../modals/parentModal.jsx';
// import { FaCertificate } from 'react-icons/fa';
// import { useCurrentRender } from '../context/renderContext.jsx';
// import { useTheme } from '../context/themeContext.jsx';
// import HierarchyPOFormModal from './create-po/po_initiate_form_modal.jsx';

// const NavItem = ({ label, icon: Icon, active, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full mb-1
//         ${active
//         ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800'
//         : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
//       }`}
//   >
//     <Icon size={18} className={active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"} />
//     <span>{label}</span>
//   </button>
// );

// const NavSection = ({ title, children }) => (
//   <div className="mb-4">
//     {title && <h4 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</h4>}
//     <div className="space-y-0.5">
//       {children}
//     </div>
//   </div>
// );

// const Drawer = ({ open, setOpenDrawer, isAdmin, isRelationEngineer, isUser }) => {
//   const [signPdf, setSignPdf] = React.useState(false);
//   const [helpMe, setHelpMe] = React.useState(false);
//   const { currentRender, handleSetCurrentRender } = useCurrentRender();
//   const { isDarkMode, toggleTheme } = useTheme();
//   const [newInitiate, setNewInitiate] = React.useState({ open: false, data: null, task: 'Create Inspection' });

//   const overviewRights = isAdmin || isUser;

//   if (!open) {
//     return (
//       // Button to open the drawer when it's closed
//       <button
//         onClick={() => setOpenDrawer(true)}
//         className="fixed top-1/2 left-0 transform -translate-y-1/2 w-4 h-20 flex items-center justify-center bg-black dark:bg-white shadow-lg z-50 rounded-r-full hover:bg-gray-700 dark:hover:bg-gray-200 focus:outline-none transition-all duration-300"
//         aria-label="Open menu"
//       >
//         <ChevronRight size={20} className="text-gray-50 dark:text-black" />
//       </button>
//     );
//   }

//   return (
//     <>
//       <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setOpenDrawer(false)}></div>

//       <div className="fixed lg:z-auto z-50 inset-y-0 left-0 lg:flex lg:flex-col h-full min-w-60 w-64 lg:w-64 bg-gray-50 dark:bg-slate-900 shadow-lg border-gray-300 dark:border-slate-800 border-r lg:border-r-0 lg:border-b-0 lg:shadow-none lg:inset-auto lg:transform-none flex flex-col transition-transform duration-300 lg:relative">
//         <button
//           onClick={() => setOpenDrawer(false)}
//           className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-full w-4 h-20 flex items-center justify-center bg-gray-100 dark:bg-slate-900 shadow-lg rounded-r-full hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none transition-all duration-300"
//           aria-label="Collapse menu"
//         >
//           <ChevronLeft size={20} className="text-gray-600 dark:text-slate-200" />
//         </button>

//         <div className="flex flex-col p-2 space-y-2 lg:flex-1 lg:overflow-y-auto lg:p-4">
//           {overviewRights && <div className="mb-6">
//             <button
//               onClick={() => setNewInitiate({ open: true, data: {}, task: 'Create Inspection' })}
//               className={`flex items-center justify-center gap-2 p-3 w-full rounded-lg font-semibold shadow-sm transition-all duration-200 
//                   ${currentRender === 'Inspection Form'
//                   ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
//                   : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
//             >
//               <PlusCircle size={20} />
//               <span>Initiate PO</span>
//             </button>
//           </div>}


//           <NavSection title="Overview">
//             {overviewRights && <NavItem
//               label="Dashboard"
//               icon={LayoutDashboard}
//               active={currentRender === 'Dashboard'}
//               onClick={() => handleSetCurrentRender('Dashboard')}
//             />}
//             <NavItem
//               label="Return Merchandise(RMA)"
//               icon={PackageX}
//               active={currentRender === 'RMA'}
//               onClick={() => handleSetCurrentRender('RMA')}
//             />
//             {isAdmin && <NavItem
//               label="My Inventory"
//               icon={Dock}
//               active={currentRender === 'Inventory'}
//               onClick={() => handleSetCurrentRender('Inventory')}
//             />}
//             {overviewRights && <NavItem
//               label="Certificates"
//               icon={FaCertificate}
//               active={currentRender === 'Certificates'}
//               onClick={() => handleSetCurrentRender('Certificates')}
//             />}
//           </NavSection>

//           {isAdmin && (
//             <NavSection title="Master Data">
//               <NavItem label="Type" icon={ClipboardList} active={currentRender === 'Type'} onClick={() => handleSetCurrentRender('Type')} />
//               <NavItem label="Make" icon={Factory} active={currentRender === 'Make'} onClick={() => handleSetCurrentRender('Make')} />
//               <NavItem label="Model" icon={Box} active={currentRender === 'Model'} onClick={() => handleSetCurrentRender('Model')} />
//               <NavItem label="Part" icon={Wrench} active={currentRender === 'Part'} onClick={() => handleSetCurrentRender('Part')} />
//               <NavItem label="Firm" icon={Building} active={currentRender === 'Firm'} onClick={() => handleSetCurrentRender('Firm')} />
//               <NavItem label="Stores" icon={Warehouse} active={currentRender === 'Stores'} onClick={() => handleSetCurrentRender('Stores')} />
//             </NavSection>
//           )}
//         </div>

//         {/* help and guidelines */}
//         <div className="mt-auto flex flex-col p-4 border-t border-gray-200 dark:border-slate-800">
//           <button
//             onClick={toggleTheme}
//             className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full"
//           >
//             {isDarkMode ? (
//               <>
//                 <Sun size={18} className="text-amber-500" />
//                 <span>Light Mode</span>
//               </>
//             ) : (
//               <>
//                 <Moon size={18} className="text-slate-400" />
//                 <span>Dark Mode</span>
//               </>
//             )}
//           </button>

//           <div className="flex flex-row gap-2 items-center px-3 py-2">
//             <Info size={16} className="text-gray-500 dark:text-slate-500" />
//             <p
//               onClick={() => setHelpMe(true)}
//               className="text-sm text-gray-500 dark:text-slate-500 hover:underline hover:text-sky-500 dark:hover:text-sky-400 cursor-pointer"
//             >
//               Help & Support
//             </p>
//           </div>
//         </div>

//         {/* Modals */}
//         {signPdf && (<CombinedPdfManager isOpen={signPdf} onCancel={() => setSignPdf(false)} onSubmit={() => setSignPdf(false)} />)}
//         {helpMe && (<ParentModal modalName={'Help & Support'} isOpen={helpMe} onClose={() => setHelpMe(false)} type={'help&support'} />)}

//         {
//           newInitiate.open && (
//             <HierarchyPOFormModal
//               isOpen={newInitiate.open}
//               onClose={() => setNewInitiate({ open: false, data: null, task: 'Create Inspection' })}
//               defaultValues={newInitiate.data}
//               task={newInitiate.task}
//             />
//           )}
//       </div>
//     </>
//   );
// };

// // Prop Types for better type checking
// Drawer.propTypes = {
//   open: PropTypes.bool.isRequired,
//   setOpenDrawer: PropTypes.func.isRequired,
//   isAdmin: PropTypes.bool.isRequired,
// };

// export default Drawer;


import React from 'react';
import PropTypes from 'prop-types';
import { PlusCircle, LayoutDashboard, Warehouse, Factory, Box, Wrench, Info, Building, ClipboardList, ChevronLeft, ChevronRight, PackageX, Dock, Sun, Moon } from 'lucide-react';
import ParentModal from '../modals/parentModal.jsx';
import { FaCertificate } from 'react-icons/fa';
import { useCurrentRender } from '../context/renderContext.jsx';
import { useTheme } from '../context/themeContext.jsx';
import HierarchyPOFormModal from './create-po/po_initiate_form_modal.jsx';

const NavItem = ({ label, icon: Icon, active, onClick, collapsed }) => (
  <div className="relative group w-full">
    {collapsed && (
      <div className="hidden lg:block fixed left-[72px] mt-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity duration-200 border border-slate-700 shadow-xl">
        {label}
      </div>
    )}
    <button
      onClick={onClick}
      className={`flex items-center h-10 w-full rounded-lg text-sm font-medium transition-colors duration-300 mb-1 overflow-hidden flex-nowrap
        ${active
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
    >
      <div className="flex items-center justify-center min-w-[48px] shrink-0">
        <Icon size={18} className={`transition-colors duration-300 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
      </div>
      <span className={`whitespace-nowrap font-medium text-sm transition-opacity duration-300 ease-in-out ${collapsed ? 'lg:opacity-0 delay-0' : 'opacity-100 lg:delay-100'}`}>
        {label}
      </span>
    </button>
  </div>
);

const NavSection = ({ title, children, collapsed }) => (
  <div className="mb-4 relative">
    {title && (
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${collapsed ? 'max-h-8 opacity-100 mb-2 lg:max-h-0 lg:opacity-0 lg:mb-0' : 'max-h-8 opacity-100 mb-2'}`}>
        <h4 className="px-3 pl-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
          {title}
        </h4>
      </div>
    )}
    <div className={`hidden lg:block h-px bg-slate-200 dark:bg-slate-800 transition-opacity duration-300 mx-3 ${collapsed ? 'opacity-100 mb-4' : 'opacity-0 mb-0'}`} />
    <div className="space-y-0.5">
      {children}
    </div>
  </div>
);

const Drawer = ({ open, setOpenDrawer, isAdmin, isRelationEngineer, isUser }) => {
  const [helpMe, setHelpMe] = React.useState(false);
  const { currentRender, handleSetCurrentRender } = useCurrentRender();
  const { isDarkMode, toggleTheme } = useTheme();
  const [initiatePO, setInitiatePO] = React.useState({ open: false, data: null, task: 'Create Inspection' });

  const overviewRights = isAdmin || isUser;
  const collapsed = !open;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpenDrawer(false)}
      ></div>

      {!open && (
        <button
          onClick={() => setOpenDrawer(true)}
          className="fixed top-1/2 left-0 transform -translate-y-1/2 w-4 h-20 flex items-center justify-center bg-black shadow-lg z-50 rounded-r-full hover:bg-gray-800 focus:outline-none transition-all duration-300 lg:hidden"
          aria-label="Open menu"
        >
          <ChevronRight size={20} className="text-white" />
        </button>
      )}

      <div className={`
        fixed lg:z-50 z-50 inset-y-0 left-0 bg-gray-50 dark:bg-slate-900 shadow-lg border-gray-300 dark:border-slate-800 border-r lg:shadow-none transition-all duration-300 flex flex-col lg:relative
        ${open ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-16 lg:translate-x-0'}
      `}>

        <button
          onClick={() => setOpenDrawer(!open)}
          className={`absolute top-1/2 -right-4 transform -translate-y-1/2 w-4 h-20 flex items-center justify-center bg-gray-100 dark:bg-slate-800 shadow-lg rounded-r-full hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none transition-all duration-300 border-y border-r border-gray-300 dark:border-slate-700 z-50`}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <ChevronLeft size={18} className="text-gray-600 dark:text-slate-400" /> : <ChevronRight size={18} className="text-gray-600 dark:text-slate-400" />}
        </button>

        <div className={`flex flex-col p-2 space-y-2 lg:flex-1 lg:overflow-y-auto overflow-x-hidden`}>
          {overviewRights && <div className="mb-6 w-full relative group">
            {collapsed && (
              <div className="hidden lg:block fixed left-[72px] mt-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity duration-200 border border-slate-700 shadow-xl">
                Initiate PO
              </div>
            )}
            <button
              onClick={() => setInitiatePO({ open: true, data: {}, task: 'Create Inspection' })}
              className={`flex items-center h-12 w-full rounded-lg font-semibold shadow-sm transition-colors duration-300 flex-nowrap overflow-hidden
                ${currentRender === 'Inspection Form'
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
            >
              <div className="flex items-center justify-center min-w-[48px] shrink-0">
                <PlusCircle size={20} />
              </div>
              <span className={`whitespace-nowrap transition-opacity duration-300 ease-in-out ${collapsed ? 'lg:opacity-0 delay-0' : 'opacity-100 lg:delay-100'}`}>
                Initiate PO
              </span>
            </button>
          </div>}

          <NavSection title="Overview" collapsed={collapsed}>
            {overviewRights && <NavItem
              label="Dashboard"
              icon={LayoutDashboard}
              active={currentRender === 'Dashboard'}
              onClick={() => handleSetCurrentRender('Dashboard')}
              collapsed={collapsed}
            />}
            <NavItem
              label="Return Merchandise(RMA)"
              icon={PackageX}
              active={currentRender === 'RMA'}
              onClick={() => handleSetCurrentRender('RMA')}
              collapsed={collapsed}
            />
            {isAdmin && <NavItem
              label="My Inventory"
              icon={Dock}
              active={currentRender === 'Inventory'}
              onClick={() => handleSetCurrentRender('Inventory')}
              collapsed={collapsed}
            />}
            {overviewRights && <NavItem
              label="Certificates"
              icon={FaCertificate}
              active={currentRender === 'Certificates'}
              onClick={() => handleSetCurrentRender('Certificates')}
              collapsed={collapsed}
            />}
          </NavSection>

          {isAdmin && (
            <NavSection title="Master Data" collapsed={collapsed}>
              <NavItem label="Type" icon={ClipboardList} active={currentRender === 'Type'} onClick={() => handleSetCurrentRender('Type')} collapsed={collapsed} />
              <NavItem label="Make" icon={Factory} active={currentRender === 'Make'} onClick={() => handleSetCurrentRender('Make')} collapsed={collapsed} />
              <NavItem label="Model" icon={Box} active={currentRender === 'Model'} onClick={() => handleSetCurrentRender('Model')} collapsed={collapsed} />
              <NavItem label="Part" icon={Wrench} active={currentRender === 'Part'} onClick={() => handleSetCurrentRender('Part')} collapsed={collapsed} />
              <NavItem label="Firm" icon={Building} active={currentRender === 'Firm'} onClick={() => handleSetCurrentRender('Firm')} collapsed={collapsed} />
              <NavItem label="Stores" icon={Warehouse} active={currentRender === 'Stores'} onClick={() => handleSetCurrentRender('Stores')} collapsed={collapsed} />
            </NavSection>
          )}
        </div>

        <div className={`mt-auto flex flex-col p-2 border-t border-gray-200 dark:border-slate-800 overflow-x-hidden`}>
          <div className="relative group w-full mb-1">
            {collapsed && (
              <div className="hidden lg:block fixed left-[72px] mt-2.5 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity duration-200 border border-slate-700 shadow-xl">
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </div>
            )}
            <button
              onClick={toggleTheme}
              className={`flex items-center h-11 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300 w-full flex-nowrap overflow-hidden`}
            //title={collapsed ? (isDarkMode ? "Light Mode" : "Dark Mode") : ""}
            >
              <div className="flex items-center justify-center min-w-[48px] shrink-0">
                {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-slate-400" />}
              </div>
              <span className={`whitespace-nowrap transition-opacity duration-300 ease-in-out ${collapsed ? 'lg:opacity-0 delay-0' : 'opacity-100 lg:delay-100'}`}>
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>

          <div className="relative group w-full cursor-pointer">
            {collapsed && (
              <div className="hidden lg:block fixed left-[72px] mt-2.5 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity duration-200 border border-slate-700 shadow-xl">
                Help & Support
              </div>
            )}
            <div className="flex items-center h-11 w-full flex-nowrap overflow-hidden" onClick={() => setHelpMe(true)}>
              <div className="flex items-center justify-center min-w-[48px] shrink-0">
                <Info size={16} className="text-gray-500 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
              </div>

              <p
                className={`text-sm text-gray-500 dark:text-slate-500 group-hover:underline group-hover:text-sky-500 dark:group-hover:text-sky-400 whitespace-nowrap transition-opacity duration-300 ease-in-out w-full text-left ${collapsed ? 'lg:opacity-0 delay-0' : 'opacity-100 lg:delay-100'}`}
              >
                Help & Support
              </p>
            </div>
          </div>
        </div>
      </div>
      {helpMe && (<ParentModal modalName={'Help & Support'} isOpen={helpMe} onClose={() => setHelpMe(false)} type={'help&support'} />)}

      {
        initiatePO.open && (<HierarchyPOFormModal
          isOpen={initiatePO.open}
          onClose={() => setInitiatePO({ open: false, data: null, task: 'Create Inspection' })}
          defaultValues={initiatePO.data}
          task={initiatePO.task}
        />
        )}
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