import { createContext, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CurrentRenderContext = createContext();

export const CurrentRenderProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Derive currentRender from URL path instead of state
    const currentRender = useMemo(() => {
        const path = location.pathname;
        if (path === '/' || path === '/dashboard') return 'Dashboard';
        if (path === '/rma') return 'RMA';
        if (path === '/inventory') return 'Inventory';
        if (path === '/certificates') return 'Certificates';
        if (path.startsWith('/master/')) {
            const type = path.split('/').pop();
            return type.charAt(0).toUpperCase() + type.slice(1);
        }
        return 'Dashboard';
    }, [location.pathname]);

    const handleSetCurrentRender = (newRender) => {
        const pathMap = {
            'Dashboard': '/dashboard',
            'RMA': '/rma',
            'Inventory': '/inventory',
            'Certificates': '/certificates',
        };

        if (pathMap[newRender]) {
            navigate(pathMap[newRender]);
        } else {
            // Assume Master Data
            navigate(`/master/${newRender.toLowerCase()}`);
        }
    };

    const value = {
        currentRender,
        handleSetCurrentRender,
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