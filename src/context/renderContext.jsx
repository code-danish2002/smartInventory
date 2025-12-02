import{ createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CurrentRenderContext = createContext();

export const CurrentRenderProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentRender, setCurrentRender] = useState(() => 
    {
        if (location.pathname === '/') {
            return localStorage.getItem('currentRender') || 'Dashboard';
        }
        return 'Dashboard';
    }
    );

    // Update localStorage when currentRender changes
    useEffect(() => {
        if (location.pathname === '/') {
            localStorage.setItem('currentRender', currentRender);
        }
    }, [currentRender, location.pathname]);

    // Listen for browser back/forward buttons
    useEffect(() => {
        const handlePopState = () => {
            if (location.pathname === '/') {
                setCurrentRender( 'Dashboard');
            }
            window.history.pushState(null, '', window.location.href);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleSetCurrentRender = (newRender) => {
        if (newRender === currentRender) return;
        setCurrentRender(newRender);
        const isDrawerItem = ['Dashboard', 'Certificates', 'Type', 'Make', 'Model', 'Part', 'Firm', 'Stores', 'Users'].includes(newRender);
        
        if (isDrawerItem) {
            // All main drawer items navigate to the home route ('/')
            navigate('/', { replace: true }); // Use replace to avoid filling history with redundant '/' entries
        } 
        // else {
        //     setCurrentRender(newRender);
        //     // For drawer items that should go to home route
        //     if (['Dashboard', 'Certificates', 'Type', 'Make', 'Model', 'Part', 'Firm', 'Stores', 'Users'].includes(newRender)) {
        //         navigate('/'); // Navigate to home route
        //     }
        //     window.history.pushState({ currentRender: newRender }, '', window.location.href);
        // }
    };

    const value = {
        currentRender,
        setCurrentRender,
        handleSetCurrentRender,
        // Helper function to handle navigation and history
        // handleSetCurrentRender: (newRender) => {
        //     if (newRender === currentRender) return;

        //     if (newRender === 'Dashboard') {
        //         setCurrentRender('Dashboard');
        //         window.history.replaceState(null, '', window.location.href);
        //     } else {
        //         setCurrentRender(newRender);
        //         window.history.pushState({ currentRender: newRender }, '', window.location.href);
        //     }
        // }
    };

    return (
        <CurrentRenderContext.Provider value={value}>
            {children}
        </CurrentRenderContext.Provider>
    );
};

export const useCurrentRender = () => {
    const context = useContext(CurrentRenderContext);
    if (!context) {
        throw new Error('useCurrentRender must be used within a CurrentRenderProvider');
    }
    return context;
};