import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, Package, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import InitiateRmaForm from './initiateRMAform';
import RmaDashboard from './RMA_dashboard';
import { useAuth } from '../../context/authContext';

export default function RMAPage() {
  const { groups } = useAuth();
  const isRelationshipEngineer = groups.includes('item-inspection-relation-engineer');
  const [activeTab, setActiveTab] = useState(isRelationshipEngineer ? 'initiate' : 'track');

  const activeClasses = (tabName) =>
    activeTab === tabName
      ? 'border-blue-600 text-blue-600 font-semibold'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';

  return (
    <div className="flex-1 h-full bg-gray-50 p-4 sm:p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center">
            <RefreshCw className="w-8 h-8 mr-3 text-red-500" />
            RMA
          </h1>
          <p className="text-gray-600">Manage returns and repairs for faulty or new DOA (Dead on Arrival) site equipment.</p>
        </header> */}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('initiate')}
              disabled={!isRelationshipEngineer}
              className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm transition duration-150 ${activeClasses('initiate')}`}
            >
              Initiate New RMA
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm transition duration-150 ${activeClasses('track')}`}
            >
              Track Return Status
            </button>
          </nav>
        </div>

        {/* Content Area */}
        {activeTab === 'initiate' && <InitiateRmaForm />}
        {activeTab === 'track' && <RmaDashboard />}
      </div>
    </div>
  );
}