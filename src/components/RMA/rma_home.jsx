import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, Package, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import InitiateRmaForm from './initiateRMAform';
import RmaDashboard from './RMA_dashboard';

// Initial dummy data for existing RMA requests
const initialRmaList = [
  {
    id: 'RMA-9001-ABCD',
    product: 'Core Router- Cisco',
    serialNumber: 'SR3000-X7Y8Z',
    faultDescription: 'Unit frequently shuts down under load. Possible PSU failure.',
    status: 'Pending Review',
    dateRequested: '2024-10-20',
    trackingNumber: null,
    resolution: 'Repair/Replacement requested.',
  },
  {
    id: 'RMA-9002-EFGH',
    product: 'Industrial Sensor Array V2',
    serialNumber: 'ISA-V2-P4Q5R',
    faultDescription: 'Inaccurate readings from sensor 4.',
    status: 'Approved - Awaiting Shipment',
    dateRequested: '2024-10-25',
    trackingNumber: null,
    resolution: 'Approved for return. Send unit to repair center.',
  },
  {
    id: 'RMA-9003-IJKL',
    product: 'Network Switch 48-Port',
    serialNumber: 'NS48P-T1U2V',
    faultDescription: 'Faulty unit received at site. DOA (Dead on Arrival).',
    status: 'In Transit - Repairing',
    dateRequested: '2024-11-01',
    trackingNumber: 'TRK-987654321',
    resolution: 'Received and confirmed DOA. Repair initiated.',
  },
  {
    id: 'RMA-9004-MNOP',
    product: 'Custom CPU Module A1',
    serialNumber: 'CCMA1-W3X4Y',
    faultDescription: 'Overheating issue detected in module.',
    status: 'Completed - Shipped Back',
    dateRequested: '2024-11-10',
    trackingNumber: 'TRK-123456789',
    resolution: 'Component replaced. Unit tested and shipped back via express.',
  },
  {
    id: 'RMA-9005-QRST',
    product: 'Fiber Optic Transceiver',
    serialNumber: 'FOT-Z5A6B',
    faultDescription: 'Incorrect model shipped. Needs replacement with FOT-Z5A7B.',
    status: 'Rejected',
    dateRequested: '2024-11-15',
    trackingNumber: null,
    resolution: 'Issue resolved internally. New unit shipped immediately (not an RMA issue).',
  },
  {
    id: 'RMA-9006-QRST',
    product: 'Fiber Optic Transceiver',
    serialNumber: 'FOT-Z5A6B',
    faultDescription: 'Incorrect model shipped. Needs replacement with FOT-Z5A7B.',
    status: 'Completed - Shipped Back',
    dateRequested: '2024-11-15',
    trackingNumber: null,
    resolution: 'Issue resolved internally. New unit shipped immediately (not an RMA issue).',
  },
  {
    id: 'RMA-9007-QRST',
    product: 'Fiber Optic Transceiver',
    serialNumber: 'FOT-Z5A6B',
    faultDescription: 'Incorrect model shipped. Needs replacement with FOT-Z5A7B.',
    status: 'Pending Review',
    dateRequested: '2024-11-15',
    trackingNumber: null,
    resolution: 'Issue resolved internally. New unit shipped immediately (not an RMA issue).',
  },
  {
    id: 'RMA-9008-QRST',
    product: 'Fiber Optic Transceiver',
    serialNumber: 'FOT-Z5A6B',
    faultDescription: 'Incorrect model shipped. Needs replacement with FOT-Z5A7B.',
    status: 'Completed - Shipped Back',
    dateRequested: '2024-11-15',
    trackingNumber: null,
    resolution: 'Issue resolved internally. New unit shipped immediately (not an RMA issue).',
  },
];

export default function RMAPage() {
  const [rmaList, setRmaList] = useState(initialRmaList);
  const [activeTab, setActiveTab] = useState('initiate'); // 'initiate' or 'track'

  // Function to handle new RMA submission and add to the list
  const handleRmaSubmit = (newRma) => {
    // In a real application, this would be an API call, and the API would return the final newRma object.
    setRmaList(prev => [newRma, ...prev]); // Add new RMA to the top of the list
    setActiveTab('track'); // Switch to tracking view after submission
  };

  const activeClasses = (tabName) =>
    activeTab === tabName
      ? 'border-blue-600 text-blue-600 font-semibold'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';

  return (
    <div className="flex-1 h-[82.5vh] bg-gray-50 p-4 sm:p-6 font-sans">
      <div className="max-w-4xl mx-auto">
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
        {activeTab === 'initiate' && <InitiateRmaForm onRmaSubmit={handleRmaSubmit} />}
        {activeTab === 'track' && <RmaDashboard rmaList={rmaList} />}
      </div>
    </div>
  );
}