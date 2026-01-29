import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import logo from "../assets/railtel_1.svg";
import { OnSubmitLoading } from "../utils/icons.jsx";

const Lander = () => {
    const { isAuthenticated, updateNewLogin, login, loading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate, login]);

    React.useEffect(() => {
        // Push a dummy state to prevent back navigation
        window.history.pushState(null, "", window.location.href);

        const handlePopState = () => {
            window.history.pushState(null, "", window.location.href);
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);


    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const id_token = params.get("id_token");
    const expires_in = params.get("expires_in");
    const username = params.get("username") ?? 'not available';
    const name = params.get("name");
    const email = params.get("email");
    const groups = params.get("groups")?.split(",") ?? 'not available';
    //console.log(token, refresh_token, id_token, expires_in, username, name, email);

    if (token) {
        updateNewLogin({ access_token: token, refresh_token, id_token, expires_in, username, name, email, groups });
        //console.log('token is available', token);
        //navigate('/');
    }


    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background image (logo as translucent background) */}
            <img
                src={logo}
                alt="Background Logo"
                className="fixed top-0 left-0 w-full h-full object-contain opacity-5 z-0"
            />

            {/* Overlay for dim effect */}
            <div className="fixed inset-0 bg-black bg-opacity-40 z-10"></div>

            {/* Main content */}
            <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4">
                <div className=" rounded-2xl p-8 max-w-md w-full text-center">
                    {/* <img
                                src={logo}
                                alt="RailTel Logo"
                                className="mx-auto w-24 h-auto mb-6 opacity-80"
                            /> */}
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                        Welcome to RCIL
                    </h1>
                    <h3 className="text-xl sm:text-2xl font-semibold mb-4">
                        You’re on the{' '}
                        <span className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-300 bg-clip-text text-transparent">
                            Smart Inventory
                        </span>
                    </h3>
                    <h6 className="text-xs sm:text-sm text-gray-200 mb-6">
                        Effortlessly track, monitor, and manage your assets in real-time with RailTel’s item tracking system.
                    </h6>
                    <button
                        type="button"
                        onClick={login}
                        disabled={loading}
                        className={`min-w-[180px] inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {loading
                            ? <OnSubmitLoading />
                            : 'Proceed to Login'}
                    </button>
                </div>

                <div className="absolute bottom-4 text-center w-full px-4">
                    <p className="text-sm text-gray-600">
                        Version 2.0 | &copy; 2025 RailTel Corporation of India Limited.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Lander;