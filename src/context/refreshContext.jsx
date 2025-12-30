import React, { createContext, useState, useCallback } from 'react';

// Create the context
export const RefreshContext = createContext({
  refreshDashboardData: () => {},
  refreshTableData: () => {},
  refreshFormOptions: () => {},
  isRefreshingDashboard: false,
  isRefreshingTable: false,
  isRefreshingForm: false,
});

export const RefreshProvider = ({ children }) => {
  // Track refresh states
  const [isRefreshingDashboard, setIsRefreshingDashboard] = useState(false);
  const [isRefreshingTable, setIsRefreshingTable] = useState(false);
  const [isRefreshingForm, setIsRefreshingForm] = useState(false);

  // Mock example functions — replace these with real API calls or fetchers
  const fetchDashboardData = async () => {
    console.log('Fetching dashboard data...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const fetchTableData = async () => {
    console.log('Fetching table data...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const fetchFormOptions = async () => {
    console.log('Fetching form options...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // Refresh functions
  const refreshDashboardData = useCallback(async () => {
    setIsRefreshingDashboard(true);
    try {
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to refresh dashboard data:', err);
    } finally {
      setIsRefreshingDashboard(false);
    }
  }, []);

  const refreshTableData = useCallback(async () => {
    setIsRefreshingTable(true);
    try {
      await fetchTableData();
    } catch (err) {
      console.error('Failed to refresh table data:', err);
    } finally {
      setIsRefreshingTable(false);
    }
  }, []);

  const refreshFormOptions = useCallback(async () => {
    setIsRefreshingForm(true);
    try {
      await fetchFormOptions();
    } catch (err) {
      console.error('Failed to refresh form options:', err);
    } finally {
      setIsRefreshingForm(false);
    }
  }, []);

  // Optionally: a single function to refresh everything at once
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshDashboardData(),
      refreshTableData(),
      refreshFormOptions(),
    ]);
  }, [refreshDashboardData, refreshTableData, refreshFormOptions]);

  return (
    <RefreshContext.Provider
      value={{
        refreshDashboardData,
        refreshTableData,
        refreshFormOptions,
        refreshAll,
        isRefreshingDashboard,
        isRefreshingTable,
        isRefreshingForm,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
};


//useCase
// import React from 'react';
// import { RefreshContext } from '../context/refreshContext.jsx';

// const MyComponent = () => {
//   const {
//     refreshDashboardData,
//     refreshTableData,
//     refreshFormOptions,
//     refreshAll,
//     isRefreshingDashboard,
//     isRefreshingTable,
//     isRefreshingForm,
//   } = React.useContext(RefreshContext);

//   return (
//     <div>
//       <button onClick={refreshDashboardData} disabled={isRefreshingDashboard}>
//         {isRefreshingDashboard ? 'Refreshing Dashboard...' : 'Refresh Dashboard'}
//       </button>
//       <button onClick={refreshTableData} disabled={isRefreshingTable}>
//         {isRefreshingTable ? 'Refreshing Table...' : 'Refresh Table'}
//       </button>
//       <button onClick={refreshFormOptions} disabled={isRefreshingForm}>
//         {isRefreshingForm ? 'Refreshing Form...' : 'Refresh Form Options'}
//       </button>
//       <button onClick={refreshAll}>Refresh All</button>
//     </div>
//   );
// };

// export default MyComponent;

// //setup
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import { RefreshProvider } from './context/refreshContext.jsx';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <RefreshProvider>
//     <App />
//   </RefreshProvider>
// );
