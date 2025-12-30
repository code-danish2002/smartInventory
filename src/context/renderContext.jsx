import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';

const CurrentRenderContext = createContext();

export const CurrentRenderProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { groups } = useAuth();
    const isAdmin = groups?.includes('item-inspection-admin');
    const isRelationEngineer = groups?.includes('item-inspection-relation-engineer');
    const isUser = groups?.includes('item-inspection-user');
    const [currentRender, setCurrentRender] = useState(() => {
        if (isRelationEngineer && !isAdmin) {
            return 'RMA';
        }
        if (location.pathname === '/') {
            return localStorage.getItem('currentRender') || 'Dashboard';
        }
        return 'Dashboard';
    }
    );

    useEffect(() => {
        if (isRelationEngineer && !isAdmin && currentRender !== 'RMA') {
            setCurrentRender('RMA');
        }
    }, [isRelationEngineer, isAdmin, currentRender]);

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
                setCurrentRender('Dashboard');
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
            navigate('/', { replace: true });
        }
    };

    const value = {
        currentRender,
        setCurrentRender,
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