// src/components/MyGrid.jsx
import { useState, useMemo, isValidElement, act } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { CicsSitOverrides, DeleteIcon, Edit, Inspection, Pdf01, PreviewFill, StatusChange, TaskApproved, Transaction, UploadIcon } from '../utils/icons.jsx';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { TbListDetails } from "react-icons/tb";
import MainModal from '../modals/parentModal.jsx';
import openPdf from '../config/openPdf.jsx';
import { useNavigate } from 'react-router-dom';
import { FaCogs, FaShippingFast, FaShoppingBag } from 'react-icons/fa';
import UploadPDF from '../modals/pdfUpload.jsx';
import SelectItemsModal from '../modals/selectItems.jsx';
import api from '../api/apiCall.js';
import { CarTaxiFront, HardDriveUpload, RadioReceiver, SendIcon, UploadCloud } from 'lucide-react';
import { ItemsAcceptance } from '../modals/itemsApproval.jsx';
import { MdCallReceived, } from 'react-icons/md';
import { ContentLoading } from '../globalLoading.jsx';
import NoDataAvailable from '../utils/NoDataUi.jsx';
import ApproveOrReject from '../modals/approve-reject.jsx';
import PurchaseOrderFormModal from './create-po/PO-form.jsx';
import DispatchModal from '../modals/dispatch/ItemDispatchModal.jsx';

export default function MyGrid({ title, loading, data, total, currentPage, pageSize, onPageChange, onPageSizeChange, refreshData, isSearching }) {
  const [sortModel, setSortModel] = useState([]);
  const [openMainModal, setOpenMainModal] = useState({ open: false, type: null, data: null, parentRow: null, table: null });
  const [selectedRows, setSelectedRows] = useState([]);
  const [rowSelectionModel, setRowSelectionModel] = useState({ type: 'include', ids: new Set() });
  const [openInspectionModal, setOpenInspectionModal] = useState({ open: false, po_id: null });
  const [openDispatchModal, setOpenDispatchModal] = useState({ isOpen: false, po_id: null, po_line_item_id: null, po_item_details_id: null });
  const [openUploadModal, setOpenUploadModal] = useState({ open: false, po_id: null, po_number: null });
  const [openAcceptanceModal, setOpenAcceptanceModal] = useState({ open: false, po_id: null });
  const [openPoEditModal, setOpenPoEditModal] = useState({ open: false, data: null, task: '' });
  const [selectionStatus, setSelectionStatus] = useState(null);
  const navigate = useNavigate();
  const columns = useMemo(() => {
    if (!data?.length) return [];

    const baseColumns = Object.keys(data[0])
      // 1) drop any key that contains “id” (case‑insensitive), including the auto‑added row “id”
      .filter(key => {
        const k = key.toLowerCase();
        return k !== 'id' && !k.includes('id');
      })
      .map((key) => ({
        field: key,
        headerName:
          (title === 'Re-Fill' && key === 'lineItems')
            ? 'Re-Fill PO'
            : key
              .replace(/_/g, ' ')
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase()),
        flex: 1,
        minWidth: 150,
        sortable: true,
        editable: key === "project_number",
        filterable: true,
        headerAlign: 'left',
        renderCell: ({ row }) => {
          const cellValue = row[key];
          if (cellValue === 'Upload' && title === 'Upload') {
            return (
              <div title={cellValue} className="flex items-center justify-center w-full h-full">
                <button
                  className="text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-2 py-1 rounded text-sm"
                  onClick={(e) => { e.stopPropagation(); setOpenMainModal({ open: true, type: 'upload_pdf', data: { params: { po_id: row.po_id }, parentRow: row, table: 'Upload PDF' } }) }}
                >
                  <UploadIcon />
                </button>
              </div>
            )
          }

          if (key === 'pdf') {
            // const b64 = cellValue && cellValue.replace(/^.*?base64,?/, '').trim();

            // // Decode just the first few bytes:
            // const snippet = atob(b64).slice(0, 5);
            // console.log('First five chars:', snippet);
            return (
              <div title={cellValue} className="flex items-center justify-center w-full h-full">
                <button
                  onClick={(e) => { e.stopPropagation(); openPdf(cellValue) }}
                >
                  {cellValue ? <Pdf01 /> : 'No PDF'}
                </button>
              </div>
            );
          }

          // Action column
          if (key === 'action') {
            if (!cellValue) {
              return (
                <div title={cellValue} className="flex items-center justify-center w-full h-full">
                  <button
                    className="bg-purple-200 hover:bg-purple-100 transition duration-200 ease-in-out text-center leading-normal w-full min-w-[7em] px-[1em] py-[0.5em] text-sm rounded-lg shadow-md"
                    onClick={() => {
                      setOpenInspectionModal({ open: true, po_id: row.po_id })
                    }}
                  >
                    Approve <Inspection className="inline-block ml-0" />
                  </button>
                </div>
              )
            } else {
              return (
                <div title={cellValue} className="flex items-center justify-center w-full h-full">
                  <button
                    className="bg-blue-200 hover:bg-blue-100 transition duration-200 ease-in-out text-center leading-normal w-full min-w-[7em] px-[1em] py-[0.5em] text-sm rounded-lg shadow-md"
                    onClick={() => {
                      setOpenDispatchModal({ isOpen: true, po_id: row.po_id, po_line_item_id: null, line_item_name: null, po_item_details_id: null });
                    }}
                  >
                    Dispatch <FaShippingFast className='inline-block ml-0' />
                  </button>
                </div>
              )
            }
          }

          if (Array.isArray(cellValue) && cellValue.length > 0 && title === 'PO Re-Fills') {
            return (
              <div title={'Re-Fill PO'} className="flex items-center justify-center w-full h-full">
                <button
                  className="text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-2 py-1 rounded text-sm"
                  onClick={(e) => { e.stopPropagation(); navigate('/create-new-po', { state: { defaultValues: { ...row }, task: 'Update' } }) }}
                >
                  <CicsSitOverrides />
                </button>
              </div>
            )
          }

          if (cellValue === "Item Received at Site") {
            return (
              <div title={cellValue} className="flex items-center justify-center mt-1.5">
                <div
                  title={cellValue}
                  className="inline-block  rounded-lg shadow-md border transition duration-200 ease-in-out text-center leading-normal w-full min-w-[7em] px-[1em] py-[0.5em] bg-green-200"
                >
                  Received <AiOutlineCheckCircle className="inline-block ml-0" />
                </div>
              </div>
            );
          }

          if (Array.isArray(cellValue)) {
            return (
              <button
                className="text-blue-500 hover:bg-blue-100 hover:text-blue-700"
                onClick={(e) => { e.stopPropagation(); setOpenMainModal({ open: true, type: 'view', data: { params: row[key] }, parentRow: row, table: key }) }}
              >
                Show {key.split('_')[1]}s
              </button>
            );
          }
          return <span>{cellValue}</span>;
        },
      }));

    // 2. prepend an Action column
    const extraColumns = {
      'My Activities': [{ label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' }],
      'Upload PDF': [{ label: 'Upload PDF', key: 'po_id', name: 'Upload PDF', action: 'upload_pdf' }, { label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' },],
      "Approve PO": [{ label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' },], // { label: 'Action', key: 'po_id', name: 'Action', action: 'line-item-inspection' }, { label: 'Dispatch', key: 'po_id', name: 'Dispatch', action: 'dispatch-po' }
      "Line Item": [{ label: 'Show Items', key: 'po_line_item_id', name: 'Item Details', action: 'view' }],
      "Item Details": [{ label: 'Track History', key: 'po_item_details_id', name: 'Track History', action: 'view-status' }],
      'PO Re-Fills': [{ label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' }, { label: 'Action', key: 'po_id', name: 'Action', action: 'PO Re-Fills' }],
      'At Store': [{ label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' }, { label: 'Accept', key: 'po_id', name: 'Accept', action: 'acceptance' }, { label: 'Dispatch', key: 'po_id', name: 'Dispatch', action: 'dispatch-po' }],
      'On Site': [{ label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' }, { label: 'Accept', key: 'po_id', name: 'Accept', action: 'acceptance' }, { label: 'Dispatch', key: 'po_id', name: 'Dispatch', action: 'dispatch-po' }],
      'Site Rejects': [{ label: 'Track History', key: 'po_item_details_id', name: 'Track History', action: 'view-status' },],
      'Stores': [{ label: 'Edit', key: 'store_id', name: 'Stores', action: 'update' }, { label: 'Delete', key: 'store_id', name: 'Stores', action: 'delete' }],
      'Make': [{ label: 'Delete', key: 'item_make_id', name: 'Make', action: 'delete' }],
      'Model': [{ label: 'Delete', key: 'item_model_id', name: 'Model', action: 'delete' }],
      'Part': [{ label: 'Delete', key: 'item_part_id', name: 'Part', action: 'delete' }],
      'Users': [{ label: 'Edit', key: 'user_id', name: 'Users', action: 'update' },],
      'Item Requests': [{ label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' }, { label: 'Action', key: 'po_id', name: 'Action', action: 'add-item-details' }],
      'OEM Spare': [{ label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' }, { label: 'Dispatch', key: 'po_id', name: 'Dispatch', action: 'dispatch-po' }],
      'Live': [{ label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' }, { label: 'Dispatch', key: 'po_id', name: 'Dispatch', action: 'dispatch-po' }],
    };

    extraColumns[title]?.forEach(({ label, name, key, action }) => {
      const field = label.toLowerCase().replace(/\s+/g, '_');

      // Map action to icon/component
      const actionIcons = {
        'upload_pdf': { icon: <HardDriveUpload size={20} className="inline-block ml-2" />, label: 'Upload', bgColor: 'bg-blue-200 hover:bg-blue-100' },
        'view': { icon: <PreviewFill className="inline-block ml-2" />, label: 'View', bgColor: 'bg-blue-200 hover:bg-blue-100' },
        'view-status': { icon: <StatusChange className="inline-block ml-2" />, label: 'History', bgColor: 'bg-cyan-200 hover:bg-cyan-100' },
        'request-action': <Transaction />,
        'PO Re-Fills': { icon: <CicsSitOverrides className="inline-block ml-2" />, label: 'Edit PO', bgColor: 'bg-amber-200 hover:bg-amber-100' },
        'update': <Edit />,
        'delete': <DeleteIcon />,
        'request-operation': <TaskApproved />,
        'line-item-inspection': { icon: <Inspection className="inline-block ml-2" />, label: 'Inspect', bgColor: 'bg-purple-200 hover:bg-purple-100' },
        'dispatch-po': { icon: <FaShippingFast className="inline-block ml-2" />, label: 'Dispatch', bgColor: 'bg-blue-200 hover:bg-blue-100' },
        'add-item-details': { icon: <TbListDetails className="inline-block ml-2" />, label: 'Add S.No.', bgColor: 'bg-teal-200 hover:bg-teal-100' },
        'send to location': { icon: <SendIcon className="inline-block ml-2 h-4 w-4" />, label: 'Send', bgColor: 'bg-sky-200 hover:bg-sky-100' },
        'acceptance': { icon: <div className="flex flex-row items-center"><MdCallReceived className="inline-block ml-1" /><FaCogs className="inline-block" /></div>, label: 'Accept', bgColor: 'bg-amber-200 hover:bg-amber-100' },
      };

      baseColumns.push({
        field,
        headerName: label,
        width: 150,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => {
          const handleClick = (e) => {
            e.stopPropagation();
            if (action === 'line-item-inspection') {
              setOpenInspectionModal({ open: true, po_id: row.po_id });
            }
            else if (action === 'dispatch-po') {
              setOpenDispatchModal({ isOpen: true, po_id: row.po_id, po_line_item_id: null, line_item_name: null, po_item_details_id: null });
            }
            else if (action === 'acceptance') {
              setOpenAcceptanceModal({ open: true, po_id: row.po_id });
            }
            else if (action === 'upload_pdf') {
              setOpenUploadModal({ open: true, po_id: row.po_id, po_number: row.po_number });
            }
            else if (action === 'PO Re-Fills') {
              api.get(`/api/fullPoDataByPoId/${row.po_id}`)
                .then(response => {
                  const poData = response.data.data;
                  console.log('PO REFILL FORM')
                  setOpenPoEditModal({ open: true, data: poData, task: 'Update Inspection' });
                }).catch(error => {
                  console.error('Error fetching PO data:', error);
                  alert('Failed to fetch details of PO to be Re-Filled. Please try again later.');
                });
            }
            else if (action === 'add-item-details') {
              api.get(`/api/fullPoDataByPoId/${row.po_id}`)
                .then(response => {
                  const poData = response.data.data;
                  setOpenPoEditModal({ open: true, data: poData, task: 'Add Item Details' });
                }).catch(error => {
                  console.error('Error fetching PO data:', error);
                  alert('Failed to fetch details of PO to be Re-Filled. Please try again later.');
                });
            }
            else if (action === 'send to location') {
              setOpenMainModal({ open: true, type: action, data: { body: [row[key]] }, parentRow: row, table: name });
            }
            else {
              setOpenMainModal({ open: true, type: action, data: { params: { ...row, [key]: row[key] } }, parentRow: row, table: name });
            }
          };

          let buttonView = actionIcons[action];
          let buttonCss = '';
          if (typeof buttonView === 'object' && !isValidElement(buttonView)) {
            buttonCss = `inline-block  rounded-lg shadow-md border transition duration-200 ease-in-out text-center leading-normal w-full min-w-[7em] px-[1em] py-[0.5em] ${actionIcons[action]?.bgColor}`;
            buttonView = (
              <div className='flex items-center justify-center gap-1'>
                {actionIcons[action]?.label || name}
                {actionIcons[action]?.icon}
              </div>
            )
          }

          const isDisabled = action === 'send to location' && row.action === 'Receive Pending at Site';

          return (
            <div title={name} className="flex items-center justify-center w-full h-full">
              <button
                title={name}
                onClick={handleClick}
                className={buttonCss}
                disabled={isDisabled}
              >
                {buttonView}
              </button>
            </div>
          );
        }
      });
    });

    return baseColumns;
  }, [data, title]);

  let initialVisibility = useMemo(
    () => columns.reduce((vis, col, idx) => { vis[col.field] = idx < 10; return vis; }, {}),
    [columns]
  );

  initialVisibility = {
    ...initialVisibility,
    'Track History': true,
    'Action': true,
  };

  const processedRows = useMemo(() => {
    if (!data?.length) return [];
    let rows = data.map((row, idx) => ({ id: row?.po_item_details_id || row?.po_id || row?.po_line_item_id || idx, ...row }));

    // sorting
    sortModel.forEach(({ field, sort }) => {
      rows.sort((a, b) => {
        const aVal = a[field]; const bVal = b[field];
        const aNum = parseFloat(aVal); const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sort === 'asc' ? aNum - bNum : bNum - aNum;
        }
        return sort === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    });

    return rows;
  }, [data, sortModel]);

  const modalTitle = openMainModal?.table ?? title;
  const enableBulkButton = title === 'Item Details';
  const isEditProjectNumber = title === 'Item Details';

  const clearSelection = () => {
    setRowSelectionModel({ type: 'include', ids: new Set() });
    setSelectedRows([]);
    setSelectionStatus(null);
  };

  const isDrawerItem = ['Dashboard', 'Certificates', 'Type', 'Make', 'Model', 'Part', 'Firm', 'Stores', 'Users'].includes(title);

  return (
    <div className="flex flex-col p-2 space-y-4 bg-gray-50 rounded-lg w-full mx-auto h-full">
      {enableBulkButton && selectedRows.length > 0 && (<div className="flex space-x-2 p-2 bg-white rounded-md shadow">
        {isEditProjectNumber && selectedRows.length > 0 &&
          <button
            onClick={() => setOpenMainModal({ open: true, type: 'edit-project-number', data: { body: selectedRows }, parentRow: null })}
            className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Edit Project # ({selectedRows.length}) <Edit className="ml-1 w-4 h-4" />
          </button>}
      </div>)}
      {loading ? (<ContentLoading />) :
        processedRows.length > 0 ? (<div className="flex-1 w-full overflow-auto">
          <DataGrid
            rows={processedRows}
            columns={columns}
            rowCount={total}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={{ page: currentPage ?? 0, pageSize: pageSize ?? 10 }}
            paginationMode="server"
            onPaginationModelChange={({ page, pageSize }) => {
              onPageChange(page);
              onPageSizeChange(pageSize);
            }}
            disableVirtualization
            sortingMode="server"
            filterMode="client"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            checkboxSelection={enableBulkButton}
            rowSelectionModel={rowSelectionModel}
            keepNonExistentRowsSelected
            isRowSelectable={(params) => {
              if (!enableBulkButton) return true; // Only apply logic for store/site tables
              if (isEditProjectNumber) return true; // All rows selectable in Item Details for project number edit

              const status = params.row.action;
              const isPending = status === 'Item Dispatched from Store' || status === 'Item Dispatched from Site' || status === "Item Received at Site";
              // 1. If no rows are selected, only pending rows are selectable
              if (!selectionStatus) {
                return isPending;
              }

              // 2. If rows are already selected, only allow selecting rows with the same status
              return isPending && status === selectionStatus;
            }}
            onRowSelectionModelChange={(newSelectionModel) => {
              setRowSelectionModel(newSelectionModel);
              // Extract IDs from the selection model object
              const newSelectedRows = Array.isArray(newSelectionModel) ? newSelectionModel : (newSelectionModel?.ids ? Array.from(newSelectionModel.ids) : []);
              setSelectedRows(newSelectedRows);

              if (newSelectedRows.length > 0) {
                const firstSelectedRow = processedRows.find(row => row.id === newSelectedRows[0]);
                setSelectionStatus(firstSelectedRow?.action || null); // Use the 'action' field as the status
              } else {
                setSelectionStatus(null); // Clear status if no rows are selected
              }
            }}
            autoHeight={false}
            loading={loading}
            sx={{
              '& .MuiDataGrid-root': { border: 'none' },
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f3f4f6' },
              '& .MuiDataGrid-cell': { whiteSpace: 'normal', wordWrap: 'break-word', py: 1 },
              width: '100%',
              overflow: 'auto',
            }}
          />
        </div>)
          : <NoDataAvailable />
      }

      {openMainModal?.open && <MainModal modalName={modalTitle} isOpen={openMainModal?.open} onClose={() => setOpenMainModal({ open: false, type: null, data: null, parentRow: null, table: null })} type={openMainModal?.type} data={openMainModal?.data} onAction={() => { clearSelection(); refreshData(); }} />}
      {openInspectionModal.open && <ApproveOrReject isOpen={openInspectionModal.open} onClose={() => setOpenInspectionModal({ open: false, po_id: '' })} params={{ po_id: openInspectionModal.po_id }} onSuccess={() => { clearSelection(); refreshData(); }} />}
      {openUploadModal.open && <UploadPDF isOpen={openUploadModal.open} po_id={openUploadModal.po_id} po_number={openUploadModal.po_number} onCancel={() => setOpenUploadModal({ open: false, po_id: null, po_number: null, po_line_item_id: null })} onSubmit={() => { clearSelection(); refreshData(); }} />}
      {openAcceptanceModal.open && <ItemsAcceptance isOpen={openAcceptanceModal.open} onCancel={() => setOpenAcceptanceModal({ open: false, po_id: null, po_line_item_id: null })} po_id={openAcceptanceModal.po_id} onSubmit={() => { clearSelection(); refreshData(); }} phase={title} />}
      {openPoEditModal.open && <PurchaseOrderFormModal isOpen={openPoEditModal.open} onClose={() => setOpenPoEditModal({ open: false, data: null, task: null })} defaultValues={openPoEditModal.data} task={openPoEditModal.task} onSuccess={() => { clearSelection(); refreshData(); }} />}
      {openDispatchModal.isOpen && <DispatchModal po_id={openDispatchModal?.po_id} onClose={() => setOpenDispatchModal({ isOpen: false, po_id: null, po_line_item_id: null, po_item_details_id: null })} onSubmit={() => { clearSelection(); refreshData(); }} phaseName={title} />}
    </div>
  );
}