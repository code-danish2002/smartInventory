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

    const layoutBgClass = "bg-gray-50 dark:bg-slate-950";
    const headerBgClass = "bg-white dark:bg-slate-900/80";
    const mainContentBgClass = "bg-white dark:bg-slate-950/50";

    return (
        <div className={`flex flex-col h-screen transform transition-transform duration-300 ${layoutBgClass}`}>
            <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 glass-header sticky top-0 z-40 shadow-sm dark:shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)]`}>

                {/* 1. Toggle, Title, Subtitle Group */}
                <div className="flex items-center w-full sm:w-auto order-1 mb-2 sm:mb-0">
                    <div className="relative group mr-4 flex items-center justify-center">
                        {/* 1. Core High-Intensity Light Source (Dark Mode ONLY) */}
                        <div className="absolute w-10 h-10 bg-white opacity-0 dark:opacity-70 blur-[20px] rounded-full transition-all duration-500 group-hover:dark:scale-150 group-hover:dark:opacity-100 pointer-events-none"></div>

                        {/* 2. Wider Ambient Indigo Glow (Dark Mode ONLY) */}
                        <div className="absolute w-16 h-16 bg-indigo-600 opacity-0 dark:opacity-25 blur-[30px] rounded-full transition-all duration-700 pointer-events-none"></div>

                        {/* 3. The Logo */}
                        <img
                            src={RailTelLogo}
                            alt="Logo"
                            className="w-12 h-12 transition-all duration-500 z-10 relative 
                   /* Interactions for both modes */
                   group-hover:scale-110 group-hover:rotate-3 
                   /* Enhancements strictly for Dark Mode */
                   dark:brightness-125 dark:contrast-115 
                   dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        />
                    </div>

                    <div className="flex flex-col">
                        <h1 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-indigo-400/60 leading-none mb-1">
                            {title}
                        </h1>

                        <div key={subTitle} className="animate-subtitle flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                                {subTitle || "Dashboard"}
                            </h2>
                            {/* Pulse Status Dot */}
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Action/Search & Add Button Group */}
                <div className="flex-1 w-full sm:w-auto order-3 sm:order-2 mt-2 sm:mt-0 flex justify-center sm:justify-end sm:ml-8 gap-3">
                    {canSearchItem && (
                        <div className="relative w-full md:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Quick Item search..."
                                className="w-full py-2.5 pl-10 pr-4 bg-gray-100/50 dark:bg-slate-800/40 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:bg-white dark:focus:bg-slate-800/80 transition-all duration-300 text-sm outline-none dark:text-slate-100 dark:placeholder-slate-500 dark:ring-1 dark:ring-white/5"
                                value={searchItem}
                                onChange={(e) => setSearchItem(e.target.value)}
                                onKeyDown={handleSearchItem}
                            />
                        </div>
                    )}
                    {action && (
                        <div className="flex items-center gap-2 animate-subtitle text-slate-700 dark:text-slate-200">
                            {action}
                        </div>
                    )}
                </div>

                {/* 3. Profile Section */}
                <div className="order-2 sm:order-3 absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto sm:w-auto">
                    <div className="relative" ref={profileButtonRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 p-[2px]">
                                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-700 dark:text-white font-bold">
                                    {name ? name.charAt(0).toUpperCase() : <UserCircleSolid className="w-6 h-6" />}
                                </div>
                            </div>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-60 sm:w-72 bg-white dark:bg-slate-800/95 dark:backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden">
                                <div className="p-5">
                                    <p className="text-lg font-bold text-gray-800 dark:text-white mb-4">Hello, {name || "User"}!</p>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-slate-300">
                                            <ProfileDuotone className="w-5 h-5 opacity-70" />
                                            <p className="text-sm font-medium truncate"> {username} </p>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-slate-300">
                                            <EmailIcon className="w-5 h-5 opacity-70" />
                                            <p className="text-sm font-medium truncate"> {email} </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
                                        <button
                                            className="w-full px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-subtitle {
                    animation: slideUpFade 0.4s ease-out forwards;
                }

                .glass-header {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                
                .dark .glass-header {
                    background: rgba(15, 23, 42, 0.75);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
                }

                /* Custom Scrollbar for Dark Mode */
                .dark ::-webkit-scrollbar {
                    width: 8px;
                }
                .dark ::-webkit-scrollbar-track {
                    background: #0f172a;
                }
                .dark ::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
                .dark ::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
                `}
            </style>

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
                    <div className="flex-1 overflow-auto rounded-xl dark:bg-slate-900/40">
                        {loading ? <ContentLoading /> : children}
                    </div>
                </div>
            </div>
            {/* Modal Logic remains unchanged */}
            {openModal && (<ParentModal modalName={subTitle} isOpen={openModal} onClose={() => setOpenModal(false)} type='create' onAction={refreshData} />)}
            {searchItemModal && (
                <ShowItemsDetails serialNumber={searchItem} closeModal={closeModal} />
            )}
        </div>
    );
};

export default Layout;