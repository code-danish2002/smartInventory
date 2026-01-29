import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/authContext.jsx';
import Home from './components/homePage.jsx';
import Lander from './components/lander.jsx';
import { CurrentRenderProvider } from './context/renderContext.jsx';
import Dashboard from './components/dashboard.jsx';
import PurchaseOrderReportsDashboard from './components/certificatesPage.jsx';
import MyInventory from './components/myInventory.jsx';
import RMAPage from './components/RMA/rma_home.jsx';
import MasterDataView from './components/MasterDataView.jsx';

const App = () => {

  const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? children : <Navigate to="/" replace />;
  }

  const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  }

  return (
    <CurrentRenderProvider>
      <Routes>
        <Route path="/login" element={<PublicRoute><Lander /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="certificates" element={<PurchaseOrderReportsDashboard />} />
          <Route path="inventory" element={<MyInventory />} />
          <Route path="rma" element={<RMAPage />} />
          <Route path="master/:type" element={<MasterDataView />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </CurrentRenderProvider>
  );
};

export default App;
