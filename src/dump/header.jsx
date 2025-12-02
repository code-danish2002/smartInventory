import React from "react";
import { EmailIcon, ProfileDuotone, ReportFormsFill, UserCircleSolid, } from "../utils/icons.jsx";
import { useAuth } from "../context/authContext.jsx";
import { ShowItemsDetails } from "../modals/showItemsDetails.jsx";

export default function Header({ openDrawer, setOpenDrawer }) {
    const { token, logout, username, name, email } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const profileRef = React.useRef(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [searchSerialNumber, setSearchSerialNumber] = React.useState(null);

    //const decodedToken = jwtDecode(token);
    //console.log(decodedToken, decodedToken.name, decodedToken.email, decodedToken.preferred_username);
    //const name = decodedToken.name ? decodedToken.name : decodedToken.preferred_username;
    //const email = decodedToken.email ? decodedToken.email : 'No Email';
    //const username = decodedToken.preferred_username ? decodedToken.preferred_username : 'No Username';
    const user = username || JSON.parse(sessionStorage.getItem('username'))
    const user_name = name || JSON.parse(sessionStorage.getItem('name'))
    const user_email = email || JSON.parse(sessionStorage.getItem('email'))

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
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
                // optional: clear input
                setSearchSerialNumber(searchTerm);
                setIsModalOpen(true);
            }
            return;
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSearchSerialNumber('');
    };

    return (
        <>
            <header className="flex flex-wrap items-center justify-between p-4 bg-transparent  sm:flex-nowrap">
                {/* Left Section */}
                <div className="flex items-center flex-1 gap-2">
                    <button
                        onClick={() => setOpenDrawer(!openDrawer)}
                        className="px-4 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    >
                        <ReportFormsFill className="w-8 h-8" />
                    </button>
                    <h1 className="text-3xl whitespace-nowrap font-semibold text-gray-800">Smart Inventory</h1>
                </div>

                {/* Right Section */}
                <div className="relative flex items-center gap-1" ref={profileRef}>
                    {/* Item search searchbar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Type S.NO. & press Enter..."
                            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                            onKeyDown={handleSearchItem}
                            onChange={(e) => setSearchSerialNumber(e.target.value)}
                            value={searchSerialNumber}
                        />
                    </div>
                    <button className="px-3 py-1 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-300" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                        <UserCircleSolid />
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                            {/* Triangle indicator */}
                            <div className="absolute -top-2 right-3 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200"></div>

                            <div className="p-4">

                                <div className="mb-2 flex items-center gap-1" title="Name">
                                    <p className="text-lg text-wrap capitalize italic font-serif font-bold text-gray-500 truncate"> Welcome, {name || "name"} </p>
                                </div>
                                <div className="mb-2 flex items-center gap-1" title="Username">
                                    <ProfileDuotone />
                                    <p className="text-sm text-gray-500 truncate">
                                        {username || "username"}
                                    </p>
                                </div>

                                <div className="mb-2 flex items-center gap-1" title="Email">
                                    <EmailIcon />
                                    <p className="text-sm text-gray-500 truncate">
                                        {email || "No email"}
                                    </p>
                                </div>
                                <div className="flex w-full justify-center">
                                    <button
                                        className="w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-300"
                                        onClick={logout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>
            {isModalOpen && (
                <ShowItemsDetails serialNumber={searchSerialNumber} closeModal={closeModal} />
            )}
        </>
    );
};