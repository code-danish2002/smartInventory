import { useState, useMemo, isValidElement } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { CicsSitOverrides, DeleteIcon, Edit, Inspection, Pdf01, PreviewFill, StatusChange, TaskApproved, Transaction, UploadIcon } from '../utils/icons.jsx';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { TbListDetails } from "react-icons/tb";
import MainModal from '../modals/parentModal.jsx';
import openPdf from '../utils/openPdf.jsx';
import { useNavigate } from 'react-router-dom';
import { FaCogs, FaShippingFast } from 'react-icons/fa';
import UploadPDF from '../modals/pdfUpload.jsx';
import { HardDriveUpload, SendIcon } from 'lucide-react';
import { ItemsAcceptance } from '../modals/itemsApproval.jsx';
import { MdCallReceived } from 'react-icons/md';
import { ContentLoading } from '../globalLoading.jsx';
import NoDataAvailable from '../utils/NoDataUi.jsx';
import ApproveOrReject from '../modals/approve-reject.jsx';
import HierarchyPOFormModal from './create-po/po_initiate_form_modal.jsx';
import DispatchModal from '../modals/dispatch/ItemDispatchModal.jsx';
import ViewHierarchyModal from './create-po/ViewHierarchyModal.jsx';
import { useTableActions } from '../hooks/useTableActions.js';
import { useTheme } from '../context/themeContext.jsx';

export default function MyTable({ title, loading, data, total, currentPage, pageSize, onPageChange, onPageSizeChange, refreshData, onSearchTermChange }) {
  const { isDarkMode } = useTheme();
  const [sortModel, setSortModel] = useState([]);
  const navigate = useNavigate();
  const {
    modalState,
    closeModal,
    handleAction,
    rowSelection,
    setRowSelection,
    clearSelection
  } = useTableActions(refreshData);

  const columns = useMemo(() => {
    if (!data?.length) return [];

    const baseColumns = Object.keys(data[0])
      .filter(key => {
        const k = key.toLowerCase();
        return k !== 'id' && !k.includes('id');
      })
      .map((key) => ({
        field: key,
        headerName:
          (title === 'Re-Fill' && key === 'lineItems')
            ? 'Re-Fill PO'
            : key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        flex: 1,
        minWidth: 150,
        sortable: true,
        filterable: true,
        headerAlign: 'left',
        renderCell: ({ row }) => {
          const cellValue = row[key];
          if (cellValue === 'Upload' && title === 'Upload') {
            return (
              <div className="flex items-center justify-center w-full h-full">
                <button
                  className="text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-2 py-1 rounded text-sm"
                  onClick={(e) => { e.stopPropagation(); handleAction('upload_pdf', row); }}
                >
                  <UploadIcon />
                </button>
              </div>
            );
          }

          if (key === 'pdf') {
            return (
              <div className="flex items-center justify-center w-full h-full">
                <button onClick={(e) => { e.stopPropagation(); openPdf(cellValue); }}>
                  {cellValue ? <Pdf01 /> : 'No PDF'}
                </button>
              </div>
            );
          }

          if (key === 'action') {
            const isApprove = !cellValue;
            return (
              <div className="flex items-center justify-center w-full h-full">
                <button
                  className={`${isApprove ? 'bg-purple-200 hover:bg-purple-100 dark:bg-purple-800 dark:hover:bg-purple-700' : 'bg-blue-200 hover:bg-blue-100 dark:bg-blue-800 dark:hover:bg-blue-700'} transition duration-200 ease-in-out text-center leading-normal w-full min-w-[7em] px-[1em] py-[0.5em] text-sm rounded-lg shadow-md`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(isApprove ? 'line-item-inspection' : 'dispatch-po', row);
                  }}
                >
                  {isApprove ? <>Approve <Inspection className="inline-block ml-0" /></> : <>Dispatch <FaShippingFast className='inline-block ml-0' /></>}
                </button>
              </div>
            );
          }

          if (Array.isArray(cellValue) && cellValue.length > 0 && title === 'PO Re-Fills') {
            return (
              <div className="flex items-center justify-center w-full h-full">
                <button
                  className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 hover:text-blue-700 px-2 py-1 rounded text-sm"
                  onClick={(e) => { e.stopPropagation(); navigate('/create-new-po', { state: { defaultValues: { ...row }, task: 'Update' } }); }}
                >
                  <CicsSitOverrides />
                </button>
              </div>
            );
          }

          if (cellValue === "Item Received at Site") {
            return (
              <div className="flex items-center justify-center mt-1.5">
                <div className="inline-block rounded-lg shadow-md border transition duration-200 ease-in-out text-center leading-normal w-full min-w-[7em] px-[1em] py-[0.5em] bg-green-200 dark:bg-green-800 dark:hover:bg-green-700">
                  Received <AiOutlineCheckCircle className="inline-block ml-0" />
                </div>
              </div>
            );
          }

          if (Array.isArray(cellValue)) {
            return (
              <button
                className="text-blue-500 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 font-medium px-2 py-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  const targetTitle = key === 'po_item_details' ? 'Item Details' : (key === 'po_line_items' ? 'Line Item' : key);
                  handleAction('view', row, { field: key, title: targetTitle });
                }}
              >
                Show {key.replace(/_/g, ' ')}
              </button>
            );
          }
          return (
            <span
              title={cellValue}
              className="truncate hover:whitespace-normal hover:overflow-visible hover:relative hover:z-50 hover:bg-inherit block w-full"
            >
              {cellValue}
            </span>
          );
        },
      }));

    const extraColumns = {
      'My Activities': [{ label: 'Line Items', action: 'view' }],
      'Upload PDF': [{ label: 'Line Items', action: 'view' }, { label: 'Upload PDF', action: 'upload_pdf' }],
      "Approve PO": [{ label: 'Line Items', action: 'view' }],
      "Line Item": [{ label: 'Show Items', action: 'view' }],
      "Item Details": [{ label: 'Track History', action: 'view-status' }],
      'PO Re-Fills': [{ label: 'Line Items', action: 'view' }, { label: 'Action', action: 'PO Re-Fills' }],
      'At Store': [{ label: 'Line Items', action: 'view' }, { label: 'Accept', action: 'acceptance' }, { label: 'Dispatch', action: 'dispatch-po' }],
      'On Site': [{ label: 'Line Items', action: 'view' }, { label: 'Accept', action: 'acceptance' }, { label: 'Dispatch', action: 'dispatch-po' }],
      'Site Rejects': [{ label: 'Track History', action: 'view-status' }],
      'Stores': [{ label: 'Edit', action: 'update' }, { label: 'Delete', action: 'delete' }],
      'Make': [{ label: 'Delete', action: 'delete' }],
      'Model': [{ label: 'Delete', action: 'delete' }],
      'Part': [{ label: 'Delete', action: 'delete' }],
      'Users': [{ label: 'Edit', action: 'update' }],
      'Item Requests': [{ label: 'Line Items', action: 'view' }, { label: 'Action', action: 'add-item-details' }],
      'OEM Spare': [{ label: 'Line Items', action: 'view' }, { label: 'Dispatch', action: 'dispatch-po' }],
      'Live': [{ label: 'Line Items', action: 'view' }, { label: 'Dispatch', action: 'dispatch-po' }],
    };

    const actionIcons = {
      'upload_pdf': {
        icon: <HardDriveUpload size={20} className="inline-block ml-2" />,
        label: 'Upload',
        bgColor: 'bg-blue-200 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-200'
      },
      'view': {
        icon: <PreviewFill className="inline-block ml-2" />,
        label: 'View',
        bgColor: 'bg-blue-200 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-200'
      },
      'view-status': { icon: <StatusChange className="inline-block ml-2" />, label: 'History', bgColor: 'bg-cyan-200 hover:bg-cyan-100 dark:bg-cyan-900/40 dark:hover:bg-cyan-900/60 dark:text-cyan-200' },
      'PO Re-Fills': { icon: <CicsSitOverrides className="inline-block ml-2" />, label: 'Edit PO', bgColor: 'bg-amber-200 hover:bg-amber-100 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 dark:text-amber-200' },
      'update': <Edit />,
      'delete': <DeleteIcon />,
      'line-item-inspection': { icon: <Inspection className="inline-block ml-2" />, label: 'Inspect', bgColor: 'bg-purple-200 hover:bg-purple-100 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 dark:text-purple-200' },
      'dispatch-po': { icon: <FaShippingFast className="inline-block ml-2" />, label: 'Dispatch', bgColor: 'bg-blue-200 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-200' },
      'add-item-details': { icon: <TbListDetails className="inline-block ml-2" />, label: 'Add S.No.', bgColor: 'bg-teal-200 hover:bg-teal-100 dark:bg-teal-900/40 dark:hover:bg-teal-900/60 dark:text-teal-200' },
      'send to location': { icon: <SendIcon className="inline-block ml-2 h-4 w-4" />, label: 'Send', bgColor: 'bg-sky-200 hover:bg-sky-100 dark:bg-sky-900/40 dark:hover:bg-sky-900/60 dark:text-sky-200' },
      'acceptance': { icon: <div className="flex flex-row items-center"><MdCallReceived className="inline-block ml-1" /><FaCogs className="inline-block" /></div>, label: 'Accept', bgColor: 'bg-amber-200 hover:bg-amber-100 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 dark:text-amber-200' },
      'request-action': <Transaction />,
      'request-operation': <TaskApproved />,
    };

    extraColumns[title]?.forEach(({ label, action }) => {
      const field = label.toLowerCase().replace(/\s+/g, '_');
      baseColumns.push({
        field,
        headerName: label,
        width: 150,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => {
          let buttonView = actionIcons[action];
          let buttonCss = '';
          if (typeof buttonView === 'object' && !isValidElement(buttonView)) {
            buttonCss = `inline-block rounded-lg shadow-md border border-gray-200 transition duration-200 ease-in-out text-center leading-normal w-full min-w-[7em] px-[1em] py-[0.5em] 
  ${buttonView.bgColor} 
  dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700`;
            buttonView = (
              <div className='flex items-center justify-center gap-1'>
                {buttonView.label}
                {buttonView.icon}
              </div>
            );
          }
          const isDisabled = action === 'send to location' && row.action === 'Receive Pending at Site';
          const viewTitleMap = {
            'My Activities': 'Line Item',
            'Upload PDF': 'Line Item',
            'Approve PO': 'Line Item',
            'Line Item': 'Item Details',
            'PO Re-Fills': 'Line Item',
            'At Store': 'Line Item',
            'On Site': 'Line Item',
            'Item Requests': 'Line Item',
            'OEM Spare': 'Line Item',
            'Live': 'Line Item',
            'Item Details': 'Track History',
            'Site Rejects': 'Track History',
          };

          return (
            <div className="flex items-center justify-center w-full h-full" >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const targetTitle = (action === 'view' || action === 'view-status') ? (viewTitleMap[title] || label) : title;
                  handleAction(action, row, {
                    field: action === 'view' || action === 'view-status' ? field : undefined,
                    title: targetTitle
                  });
                }}
                className={buttonCss}
                disabled={isDisabled}
              >
                {buttonView}
              </button>
            </div >
          );
        }
      });
    });

    return baseColumns;
  }, [data, title, handleAction, navigate]);

  const processedRows = useMemo(() => {
    if (!data?.length) return [];
    let rows = data.map((row, idx) => ({ id: row?.po_item_details_id || row?.po_id || row?.po_line_item_id || idx, ...row }));
    sortModel.forEach(({ field, sort }) => {
      rows.sort((a, b) => {
        const aVal = a[field]; const bVal = b[field];
        const aNum = parseFloat(aVal); const bNum = parseFloat(bVal);
        const res = (!isNaN(aNum) && !isNaN(bNum)) ? aNum - bNum : String(aVal).localeCompare(String(bVal));
        return sort === 'asc' ? res : -res;
      });
    });
    return rows;
  }, [data, sortModel]);

  const enableBulkButton = title === 'Item Details';

  return (
    <div className="flex flex-col p-2 space-y-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg w-full mx-auto h-full">
      {enableBulkButton && rowSelection.selectedIds.length > 0 && (
        <div className="flex space-x-2 p-2 bg-white dark:bg-slate-800 rounded-md shadow">
          <button
            onClick={() => handleAction('edit-project-number', rowSelection.selectedIds)}
            className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Edit Project # ({rowSelection.selectedIds.length}) <Edit className="ml-1 w-4 h-4" />
          </button>
        </div>
      )}
      {loading ? (<ContentLoading />) :
        processedRows.length > 0 ? (
          <div className="flex-1 w-full overflow-auto">
            <DataGrid
              rows={processedRows}
              columns={columns}
              rowCount={total}
              pageSizeOptions={[10, 25, 50, 100]}
              paginationModel={{ page: currentPage ?? 0, pageSize: pageSize ?? 10 }}
              paginationMode="server"
              onPaginationModelChange={({ page, pageSize }) => { onPageChange(page); onPageSizeChange(pageSize); }}
              disableVirtualization
              sortingMode="server"
              filterMode="client"
              sortModel={sortModel}
              onSortModelChange={setSortModel}
              checkboxSelection={enableBulkButton}
              rowSelectionModel={rowSelection.selectionModel}
              keepNonExistentRowsSelected
              isRowSelectable={(params) => {
                const isEditProjectNumber = title === 'Item Details';
                if (!enableBulkButton) return true;
                if (isEditProjectNumber) return true;

                const status = params.row.action;
                const isPending = ['Item Dispatched from Store', 'Item Dispatched from Site', 'Item Received at Site'].includes(status);

                // If no rows are selected, only pending rows are selectable
                if (!rowSelection.status) return isPending;

                // If rows are already selected, only allow selecting rows with the same status
                return isPending && status === rowSelection.status;
              }}
              onRowSelectionModelChange={(newModel) => {
                const ids = Array.isArray(newModel) ? newModel : (newModel?.ids ? Array.from(newModel.ids) : []);
                const firstRow = processedRows.find(r => r.id === ids[0]);
                setRowSelection({ selectedIds: ids, selectionModel: newModel, status: firstRow?.action || null });
              }}
              sx={{
                border: 'none',
                backgroundColor: 'transparent',
                '& .MuiDataGrid-main': {
                  borderRadius: '12px',
                  backgroundColor: isDarkMode ? '#0f172a' : 'white',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${isDarkMode ? '#1e293b' : '#f1f5f9'}`,
                  color: isDarkMode ? '#cbd5e1' : 'inherit',
                  '&:focus': { outline: 'none' },
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                  borderBottom: `2px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                  color: isDarkMode ? '#f1f5f9' : '#1e293b',
                  fontSize: '0.75rem',
                  textTransform: 'capitalize',
                  letterSpacing: '0.025em',
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                  '&:focus, &:focus-within': { outline: 'none' },
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  color: isDarkMode ? '#f8fafc' : '#1e293b',
                  fontWeight: 700,
                },
                '& .MuiCheckbox-root': {
                  color: isDarkMode ? '#64748b' : 'inherit',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `1px solid ${isDarkMode ? '#1e293b' : '#e2e8f0'}`,
                  backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                  color: isDarkMode ? '#cbd5e1' : 'inherit',
                },
                '& .MuiTablePagination-root': {
                  color: isDarkMode ? '#cbd5e1' : 'inherit',
                },
                '& .MuiTablePagination-selectIcon': {
                  color: isDarkMode ? '#cbd5e1' : 'inherit',
                },
                '& .MuiTablePagination-actions .MuiIconButton-root': {
                  color: isDarkMode ? '#f8fafc' : 'inherit',
                  '&.Mui-disabled': {
                    color: isDarkMode ? '#475569' : 'rgba(0, 0, 0, 0.26)',
                  },
                },
                '& .MuiIconButton-root': {
                  color: isDarkMode ? '#94a3b8' : 'inherit',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                },
                '& .MuiDataGrid-row.Mui-selected': {
                  backgroundColor: isDarkMode ? 'rgba(30, 58, 138, 0.4)' : undefined,
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(30, 58, 138, 0.6)' : undefined,
                  },
                },
              }}
            />
          </div>
        ) : <NoDataAvailable />
      }

      {/* Unified Modal Rendering */}
      {modalState.isOpen && (
        <>
          {modalState.type === 'main' && (
            <MainModal
              modalName={modalState.tableName || title}
              isOpen={modalState.isOpen}
              onClose={closeModal}
              type={modalState.extra?.type}
              data={modalState.data}
              onAction={() => { clearSelection(); refreshData(); }}
            />
          )}
          {modalState.type === 'inspection' && (
            <ApproveOrReject
              isOpen={modalState.isOpen}
              onClose={closeModal}
              params={{ po_id: modalState.extra?.po_id }}
              onSuccess={() => { clearSelection(); refreshData(); }}
            />
          )}
          {modalState.type === 'upload' && (
            <UploadPDF
              isOpen={modalState.isOpen}
              po_id={modalState.extra?.po_id}
              po_number={modalState.extra?.po_number}
              onCancel={closeModal}
              onSubmit={() => { clearSelection(); refreshData(); }}
            />
          )}
          {modalState.type === 'acceptance' && (
            <ItemsAcceptance
              isOpen={modalState.isOpen}
              onCancel={closeModal}
              po_id={modalState.extra?.po_id}
              onSubmit={() => { clearSelection(); refreshData(); }}
              phase={title}
            />
          )}
          {modalState.type === 'poEdit' && (
            <HierarchyPOFormModal
              isOpen={modalState.isOpen}
              onClose={closeModal}
              defaultValues={modalState.data}
              task={modalState.extra?.task}
              onSuccess={() => { clearSelection(); refreshData(); }}
            />
          )}
          {modalState.type === 'dispatch' && (
            <DispatchModal
              po_id={modalState.extra?.po_id}
              onClose={closeModal}
              onSubmit={() => { clearSelection(); refreshData(); }}
              phaseName={title}
            />
          )}
          {modalState.type === 'view-hierarchy' && (
            <ViewHierarchyModal
              isOpen={modalState.isOpen}
              onClose={closeModal}
              po_line_items_id={modalState.extra?.po_line_item_id}
              lineItemName={modalState.data?.line_item_name || modalState.data?.description}
            />
          )}
        </>
      )}
    </div>
  );
}