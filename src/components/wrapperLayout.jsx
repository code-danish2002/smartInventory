// src/components/Layout.jsx
import React from "react";
import { useAuth } from "../context/authContext";
import { AddSquare, EmailIcon, ProfileDuotone, UserCircleSolid } from "../utils/icons";
import GlobalLoading, { ContentLoading } from "../globalLoading";
import Drawer from "./drawer";
import { X, Menu, StepBack } from "lucide-react";
import ParentModal from "../modals/parentModal";
import { MdArrowBackIosNew } from "react-icons/md";
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
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const { username, name, email, logout } = useAuth();
    const [openModal, setOpenModal] = React.useState(false);
    const profileButtonRef = React.useRef(null);

    const { currentRender, handleSetCurrentRender } = useCurrentRender();

    const [openDrawer, setOpenDrawer] = React.useState(() => {
        const saved = localStorage.getItem('drawerOpen');
        return saved ? JSON.parse(saved) : false;
    });

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

    const layoutBgClass = "bg-gray-50";
    const headerBgClass = "bg-white"; // Changed to white for better contrast
    const footerBgClass = layoutBgClass;
    const mainContentBgClass = "bg-white";
    const borderClass = "border-gray-200";

    return (
        <div className="flex flex-col h-screen transform transition-transform duration-300">
            <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 ${headerBgClass} border-b ${borderClass} shadow-sm`}>

                {/* 1. Toggle, Title, Subtitle Group (Left side on large screens) */}
                {/* w-full on small, auto on large; uses order-1 for mobile flow */}
                <div className="flex items-start w-full sm:w-auto order-1 mb-2 sm:mb-0">
                    <img src={RailTelLogo} alt="Logo" className="w-14 h-14 mr-2" />

                    {/* Drawer Toggle Button */}
                    {/* {enableDrawer ? (openDrawer ?
                        <button
                            onClick={() => setOpenDrawer(prev => !prev)}
                            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-300 mr-2"
                            aria-label="Close menu"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                        : <button
                            onClick={() => setOpenDrawer(prev => !prev)}
                            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-300 mr-2"
                            aria-label="Open menu"
                        >
                            <Menu className="w-6 h-6 text-gray-600" />
                        </button>) : (
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-300 mr-2"
                        >
                            <MdArrowBackIosNew className="w-5 h-5 text-gray-600" />Back
                        </button>
                    )
                    } */}

                    {/* Title and Subtitle: Stacks on all screens for clear hierarchy */}
                    <div className="flex flex-col truncate">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800 truncate">
                            {title}
                        </h1>
                        {subTitle && (
                            <h2 className="text-sm sm:text-base font-semibold text-sky-600 truncate">
                                {subTitle}
                            </h2>
                        )}
                    </div>
                </div>

                {/* 2. Action/Search & Add Button Group (Center/Right on large screens, second row/centered on small) */}
                <div className="flex-1 w-full sm:w-auto order-3 sm:order-2 mt-2 sm:mt-0 flex justify-center sm:justify-end sm:ml-4">
                    {action && (
                        <div className="w-full sm:w-auto flex justify-center sm:justify-end gap-2">
                            {action}
                            {['Make', 'Model', 'Part', 'Stores'].includes(subTitle) && <button
                                onClick={() => { setOpenModal(true); }}
                                className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg shadow-md transition duration-150 ease-in-out"
                            >
                                <AddSquare className="h-5 w-5" /> {subTitle}
                            </button>}
                        </div>
                    )}
                </div>

                {/* 3. Profile Section (Right side on large screens, top right on small) */}
                {/* Absolute positioning on mobile prevents it from breaking the main flow */}
                <div className="order-2 sm:order-3 absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto sm:w-auto">
                    <div className="relative" ref={profileButtonRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="p-1 rounded-full text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-300 transition duration-150"
                            aria-haspopup="true"
                            aria-expanded={isProfileOpen}
                        >
                            <UserCircleSolid className="w-8 h-8 text-gray-600" />
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

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
                     <Drawer
                        {...drawerProps}
                        rightToWrite={rightToWrite}
                        open={openDrawer}
                        setOpenDrawer={setOpenDrawer}
                    />

                <div className={`flex-1 overflow-auto p-4 ${mainContentBgClass} transition-all duration-300`}>
                    {loading ? <ContentLoading /> : children}
                </div>
            </div>

            {/* Footer and Modal */}
            <footer className={`p-2 border-t ${borderClass} ${footerBgClass}`}>
                <p className="text-xs text-gray-500 text-center">Version 2.0 | &copy; 2025 RCIL.</p>
            </footer>
            {openModal && (<ParentModal modalName={subTitle} isOpen={openModal} onClose={() => setOpenModal(false)} type='create' onAction={refreshData} />)}
        </div>
    );
};

export default Layout;