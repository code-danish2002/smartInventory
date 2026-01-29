// src/components/Layout.jsx
import React from "react";
import { useAuth } from "../context/authContext";
import { AddSquare, EmailIcon, ProfileDuotone, UserCircleSolid } from "../utils/icons";
import GlobalLoading, { ContentLoading } from "../globalLoading";
import Drawer from "./drawer";
import { X, Menu, StepBack, Search } from "lucide-react";
import ParentModal from "../modals/parentModal";
import { MdArrowBackIosNew } from "react-icons/md";
import RailTelLogo from "../assets/railtel_1.svg";
import { useCurrentRender } from "../context/renderContext";
import { ShowItemsDetails } from "../modals/showItemsDetails";

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
    const isAdmin = groups?.includes('item-inspection-admin');
    const isUser = groups?.includes('item-inspection-user');
    const isRelationEngineer = groups?.includes('item-inspection-relation-engineer');
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const { username, name, email, logout } = useAuth();
    const [openModal, setOpenModal] = React.useState(false);
    const profileButtonRef = React.useRef(null);

    const { currentRender, handleSetCurrentRender } = useCurrentRender();
    const [searchItem, setSearchItem] = React.useState('');
    const [searchItemModal, setSearchItemModal] = React.useState(false);

    const [openDrawer, setOpenDrawer] = React.useState(() => {
        const saved = localStorage.getItem('drawerOpen');
        return saved ? JSON.parse(saved) : false;
    });

    const canSearchItem = isAdmin || isUser;

    // Save drawer state to localStorage when it changes
    React.useEffect(() => {
        localStorage.setItem('drawerOpen', JSON.stringify(openDrawer));
    }, [openDrawer]);

    // Effect for closing profile menu
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchItem = (e) => {
        if (e.key === "Enter") {
            const searchTerm = e.target.value.trim();
            if (searchTerm) {
                setSearchItem(searchTerm);
                setSearchItemModal(true);
            }
            return;
        }
    };

    const closeModal = () => {
        setSearchItemModal(false);
        setSearchItem('');
    };

    const layoutBgClass = "bg-gray-50";
    const headerBgClass = "bg-white"; // Changed to white for better contrast
    const footerBgClass = layoutBgClass;
    const mainContentBgClass = "bg-white";
    const borderClass = "border-gray-200";

    return (
        <div className="flex flex-col h-screen transform transition-transform duration-300">
            <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 glass-header sticky top-0 z-40 shadow-sm`}>

                {/* 1. Toggle, Title, Subtitle Group (Left side on large screens) */}
                {/* w-full on small, auto on large; uses order-1 for mobile flow */}
                <div className="flex items-center w-full sm:w-auto order-1 mb-2 sm:mb-0">
                    <div className="relative group">
                        <img src={RailTelLogo} alt="Logo" className="w-12 h-12 mr-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" />
                        {/* Ambient glow behind logo */}
                        <div className="absolute inset-0 bg-blue-400 opacity-20 blur-xl rounded-full scale-50 group-hover:scale-100 transition-transform duration-500"></div>
                    </div>

                    <div className="flex flex-col">
                        <h1 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 leading-none mb-1">
                            {title}
                        </h1>

                        <div key={subTitle} className="animate-subtitle flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                                {subTitle || "Dashboard"}
                            </h2>
                            {/* Status Dot */}
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                        </div>
                    </div>
                </div>

                {/* 2. Action/Search & Add Button Group (Center/Right on large screens, second row/centered on small) */}
                <div className="flex-1 w-full sm:w-auto order-3 sm:order-2 mt-2 sm:mt-0 flex justify-center sm:justify-end sm:ml-8 gap-3">
                    {canSearchItem && (
                        <div className="relative w-full md:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Quick Item search..."
                                className="w-full py-2 pl-10 pr-4 bg-gray-100/50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-300 text-sm outline-none"
                                value={searchItem}
                                onChange={(e) => setSearchItem(e.target.value)}
                                onKeyDown={handleSearchItem}
                            />
                        </div>
                    )}
                    {action && (
                        <div className="flex items-center gap-2 animate-subtitle">
                            {action}
                        </div>
                    )}
                </div>

                {/* 3. Profile Section (Right side on large screens, top right on small) */}
                {/* Absolute positioning on mobile prevents it from breaking the main flow */}
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
                            <div className="absolute right-0 mt-2 w-60 sm:w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                                <div className="absolute -top-2 right-3 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-100"></div>
                                <div className="p-4">
                                    <p className="text-lg text-wrap font-bold text-gray-700 mb-3 truncate">Hello, {name || "User"}!</p>

                                    {/* User Details with better icons/styling */}
                                    <div className="mb-2 flex items-center gap-2 text-gray-600" title="Username">
                                        <ProfileDuotone className="w-5 h-5" />
                                        <p className="text-sm truncate"> {username || "username"} </p>
                                    </div>

                                    <div className="mb-4 flex items-center gap-2 text-gray-600" title="Email">
                                        <EmailIcon className="w-5 h-5" />
                                        <p className="text-sm truncate"> {email || "No email"} </p>
                                    </div>

                                    <div className="pt-2 border-t border-gray-100">
                                        <button
                                            className="w-full px-4 py-2 text-sm font-semibold text-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-150"
                                            onClick={logout}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <style>
                {`
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes glassShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .animate-subtitle {
      animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .glass-header {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
  `}
            </style>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
                <Drawer
                    {...drawerProps}
                    isAdmin={isAdmin}
                    isRelationEngineer={isRelationEngineer}
                    isUser={isUser}
                    open={openDrawer}
                    setOpenDrawer={setOpenDrawer}
                />

                <div className={`flex-1 flex flex-col overflow-hidden p-4 ${mainContentBgClass} transition-all duration-300`}>
                    <div className="flex-1 overflow-auto">
                        {loading ? <ContentLoading /> : children}
                    </div>
                </div>
            </div>

            {/* Footer and Modal */}
            {/* <footer className={`p-2 border-t ${borderClass} ${footerBgClass}`}>
                <p className="text-xs text-gray-500 text-center">Version 2.0 | &copy; 2025 RCIL.</p>
            </footer> */}
            {openModal && (<ParentModal modalName={subTitle} isOpen={openModal} onClose={() => setOpenModal(false)} type='create' onAction={refreshData} />)}
            {searchItemModal && (
                <ShowItemsDetails serialNumber={searchItem} closeModal={closeModal} />
            )}
        </div>
    );
};

export default Layout;