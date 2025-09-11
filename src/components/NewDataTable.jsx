// src/components/MyGrid.jsx
import { useState, useMemo, isValidElement } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import TableHeader from './tableHeader.jsx';
import { CicsSitOverrides, DeleteIcon, Edit, Inspection, Live, Pdf01, PendingActions, PreviewFill, StatusChange, TaskApproved, Transaction, UploadIcon } from '../utils/icons.jsx';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { TbListDetails } from "react-icons/tb";
import MainModal from '../modals/parentModal.jsx';
import openPdf from '../config/openPdf.jsx';
import { useNavigate } from 'react-router-dom';
import { LineItemsInspection } from '../modals/lineItemsApproval.jsx';
import { FaShippingFast } from 'react-icons/fa';
import UploadPDF from '../modals/pdfUpload.jsx';
import SelectItemsModal from '../modals/selectItems.jsx';
import api from '../api/apiCall.js';
import { SendIcon } from 'lucide-react';
import { useToast } from '../context/toastProvider.jsx';

export default function MyGrid({ title, loading, data, total, currentPage, pageSize, onPageChange, onPageSizeChange, onSearchTermChange, refreshData }) {
  const [sortModel, setSortModel] = useState([]);
  const [showSubItems, setShowSubItems] = useState(null);
  const [filterRows, setFilterRows] = useState([{ id: Date.now(), columnField: "", operator: "", value: "" },]);
  const [openInspectionModal, setOpenInspectionModal] = useState({ open: false, po_id: null });
  const [openDispatchModal, setOpenDispatchModal] = useState({ isOpen: false, po_line_item_id: null, po_item_details_id: null });
  const [openUploadModal, setOpenUploadModal] = useState({ open: false, po_id: null });
  const addToast = useToast();
  const navigate = useNavigate();

  const columns = useMemo(() => {
    if (!data?.length) return [];

    // 1. build the base columns from your data keys
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
        width: 150,
        sortable: true,
        editable: true,
        filterable: true,
        headerAlign: 'left',
        renderCell: ({ row }) => {
          const cellValue = row[key];
          if (cellValue === 'Upload' && title === 'Upload') {
            return (
              <div title={cellValue} className="flex items-center justify-center w-full h-full">
                <button
                  className="text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-2 py-1 rounded text-sm"
                  onClick={(e) => { e.stopPropagation(); setShowSubItems({ subItem: { params: { po_id: row.po_id }, table: 'Upload PDF' }, parentRow: row, action: 'upload_pdf' }) }}
                >
                  <UploadIcon />
                </button>
              </div>
            )
          }
          if ((cellValue === 'Receive Pending at Store' || cellValue === 'Receive Pending at Site') && (title === 'At Store' || title === 'On Site')) {
            return (
              <div title={cellValue} className="flex items-center justify-center mt-1.5">
                <button
                  title={cellValue}
                  onClick={(e) => { e.stopPropagation(); setShowSubItems({ subItem: { params: cellValue === 'Recieve Pending at Store' ? { po_item_details_id: row.po_item_details_id } : { po_item_details_id: row.po_item_details_id } }, parentRow: row, action: 'request-approval' }) }}
                  className="inline-block  rounded-lg shadow-md border transition duration-200 ease-in-out text-center leading-normal w-full min-w-[7em] px-[1em] py-[0.5em] bg-amber-100 hover:bg-amber-200"
                >
                  Accept Me <PendingActions className="inline-block ml-0" />
                </button>
              </div>
            );
          }

          if (cellValue === "Received at Store" || cellValue === "Receive Reject at Site" || cellValue === "Receive Reject at Store") {
            return (
              <div title={cellValue} className="flex items-center justify-center mt-1.5">
                <button
                  title={cellValue}
                  onClick={e => { e.stopPropagation(); setOpenDispatchModal({ isOpen: true, po_line_item_id: null, line_item_name: row.line_item_name, po_item_details_id: row.po_item_details_id }) }}
                  className="inline-block  rounded-lg shadow-md border transition duration-200 ease-in-out text-center leading-normal w-full min-w-[7em] px-[1em] py-[0.5em] bg-blue-200 hover:bg-blue-100"
                >
                  Dispatch <FaShippingFast className="inline-block ml-2" />
                </button>
              </div>
            );
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

          if (cellValue === 'Re-Fill') {
            return (
              <div title={cellValue} className="flex items-center justify-center w-full h-full">
                <button
                  className="text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-2 py-1 rounded text-sm"
                  onClick={(e) => { e.stopPropagation(); navigate('/create-new-po', { state: { defaultValues: { ...row }, task: 'Update' } }) }}
                >
                  <CicsSitOverrides />
                </button>
              </div>
            )
          }

          if (cellValue === 'Spare Inventory'){
            return (
              <div title={cellValue} className="flex items-center justify-center mt-1.5">
                <button
                  title={cellValue}
                  onClick={e => { e.stopPropagation(); api.post(`/api/spare_action/${row.po_item_details_id}`, { action: 'live', remarks: '' }).then((res) => { addToast(res); refreshData(); onClose(); }).catch((error) => { addToast(error); onClose(); }); }}
                  className="inline-block  rounded-lg shadow-md border transition duration-200 ease-in-out text-center leading-normal w-full min-w-[7em] px-[1em] py-[0.5em] bg-sky-200 hover:bg-sky  -100"
                >
                  Live <Live className="inline-block ml-2" />
                </button>
              </div>
            )
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

          if (cellValue === 'Received at Site') {
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
                onClick={(e) => { e.stopPropagation(); setShowSubItems({ subItem: { params: row[key], table: key }, parentRow: row, action: 'view' }) }}
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
      'My POs': [{ label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' }],
      'Add PDF': [{ label: 'Upload PDF', key: 'po_id', name: 'Upload PDF', action: 'upload_pdf' }, { label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' },],
      Inspection: [{ label: 'Action', key: 'po_id', name: 'Action', action: 'line-item-inspection' }],
      "Line Item": [{ label: 'Show Items', key: 'po_line_item_id', name: 'Item Details', action: 'view' }],
      "Item Details": [{ label: 'Track History', key: 'po_item_details_id', name: 'Track History', action: 'view-status' }],
      'PO Re-Fills': [{ label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' }, { label: 'Action', key: 'po_id', name: 'Action', action: 'PO Re-Fills' }],
      'At Store': [{ label: 'Track History', key: 'po_item_details_id', name: 'Track History', action: 'view-status' }],
      'On Site': [{ label: 'Re-Locate', key: 'po_item_details_id', name: 'Re-Locate', action: 'send to location' },{ label: 'Track History', key: 'po_item_details_id', name: 'Track History', action: 'view-status' }],
      'Site Rejects': [{ label: 'Track History', key: 'po_item_details_id', name: 'Track History', action: 'view-status' },],
      'Firm': [{ label: 'Edit', key: 'firm_id', name: 'Firm', action: 'update' }, { label: 'Delete', key: 'firm_id', name: 'Firm', action: 'delete' }],
      'Stores': [{ label: 'Edit', key: 'store_id', name: 'Stores', action: 'update' }, { label: 'Delete', key: 'store_id', name: 'Stores', action: 'delete' }],
      'All POs': [{ label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' },],
      'Type': [{ label: 'Delete', key: 'item_type_id', name: 'Type', action: 'delete' }],
      'Make': [{ label: 'Delete', key: 'item_make_id', name: 'Make', action: 'delete' }],
      'Model': [{ label: 'Delete', key: 'item_model_id', name: 'Model', action: 'delete' }],
      'Part': [{ label: 'Delete', key: 'item_part_id', name: 'Part', action: 'delete' }],
      'Users': [{ label: 'Edit', key: 'user_id', name: 'Users', action: 'update' },],
      'Item Requests': [{ label: 'Line Items', key: 'po_id', name: 'Line Item', action: 'view' }, { label: 'Action', key: 'po_id', name: 'Action', action: 'add-item-details' }],
      'Inventory': [{ label: 'Track History', key: 'po_item_details_id', name: 'Track History', action: 'view-status' }],
    };

    extraColumns[title]?.forEach(({ label, name, key, action }) => {
      const field = label.toLowerCase().replace(/\s+/g, '_');

      // Map action to icon/component
      const actionIcons = {
        'upload_pdf': <UploadIcon />,
        'view': { icon: <PreviewFill className="inline-block ml-2" />, label: 'View', bgColor: 'bg-blue-200 hover:bg-blue-100' },
        'view-status': { icon: <StatusChange className="inline-block ml-2" />, label: 'History', bgColor: 'bg-cyan-200 hover:bg-cyan-100' },
        'request-action': <Transaction />,
        'PO Re-Fills': { icon: <CicsSitOverrides className="inline-block ml-2" />, label: 'Edit PO', bgColor: 'bg-amber-200 hover:bg-amber-100' },
        'update': <Edit />,
        'delete': <DeleteIcon />,
        'request-operation': <TaskApproved />,
        'line-item-inspection': { icon: <Inspection className="inline-block ml-2" />, label: 'Inspect', bgColor: 'bg-purple-200 hover:bg-purple-100' },
        'add-item-details': { icon: <TbListDetails className="inline-block ml-2" />, label: 'Add Item', bgColor: 'bg-teal-200 hover:bg-teal-100' },
        'send to location': { icon: <SendIcon className="inline-block ml-2" />, label: 'Send', bgColor: 'bg-sky-200 hover:bg-sky-100' },
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
            else if (action === 'upload_pdf') {
              setOpenUploadModal({ open: true, po_id: row.po_id });
            }
            else if (action === 'PO Re-Fills') {
              api.get(`/api/fullPoDataByPoId/${row.po_id}`)
                .then(response => {
                  const poData = response.data.data;
                  navigate('/po-inspection/update', { state: { defaultValues: poData, task: 'Update Inspection' } });
                }).catch(error => {
                  console.error('Error fetching PO data:', error);
                  alert('Failed to fetch details of PO to be Re-Filled. Please try again later.');
                });
            }
            else if (action === 'add-item-details') {
              api.get(`/api/fullPoDataByPoId/${row.po_id}`)
                .then(response => {
                  const poData = response.data.data;
                  navigate('/po-inspection/add', { state: { defaultValues: poData, task: 'Add Item Details' } });
                }).catch(error => {
                  console.error('Error fetching PO data:', error);
                  alert('Failed to fetch details of PO to be Re-Filled. Please try again later.');
                });
            }
             else {
              setShowSubItems({
                subItem: {
                  params: { ...row, [key]: row[key] },
                  table: name
                },
                parentRow: row,
                action: action
              });
            }
          };

          let buttonView = actionIcons[action];
          let buttonCss = '';
          if (typeof buttonView === 'object' && !isValidElement(buttonView)) {
            buttonCss = `inline-block  rounded-lg shadow-md border transition duration-200 ease-in-out text-center leading-normal w-full min-w-[7em] px-[1em] py-[0.5em] ${actionIcons[action]?.bgColor}`;
            buttonView = (
              <>
                {actionIcons[action]?.label || name}
                {actionIcons[action]?.icon}
              </>
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
    let rows = data.map((row, idx) => ({ id: idx, ...row }));

    // advanced filter
    filterRows.forEach(({ columnField, operator, value }) => {
      if (!columnField || !operator || value === '') return;
      rows = rows.filter((row) => {
        const cell = row[columnField];
        const str = String(cell).toLowerCase();
        const valLower = value.toLowerCase();
        switch (operator) {
          case 'contains': return str.includes(valLower);
          case 'notContains': return !str.includes(valLower);
          case 'equals': return String(cell) === value;
          case 'startsWith': return str.startsWith(valLower);
          case 'endsWith': return str.endsWith(valLower);
          case '>': return parseFloat(cell) > parseFloat(value);
          case '<': return parseFloat(cell) < parseFloat(value);
          default: return true;
        }
      });
    });

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
  }, [data, filterRows, sortModel]);

  const modalTitle = showSubItems?.subItem?.table ?? title
  //console.log('my title', title, 'modalTitle', modalTitle, 'showSubItems', showSubItems);

  return (
    <div className="flex flex-col p-4 space-y-4 bg-gray-50 rounded-lg w-full mx-auto h-full">
      <TableHeader
        tableName={title}
        columns={columns}
        filterRows={filterRows}
        addFilterRow={() => setFilterRows(r => [...r, { id: Date.now(), columnField: '', operator: '', value: '' }])}
        removeFilterRow={id => setFilterRows(r => r.filter(x => x.id !== id))}
        updateFilterRow={(id, key, value) => setFilterRows(r => r.map(x => x.id === id ? { ...x, [key]: value } : x))}
        onSearchTermChange={onSearchTermChange}
        onAction={refreshData}
      />

      {processedRows.length > 0 ? <div className="flex-1 w-full overflow-auto">
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
          rowSelection={false}
          onSortModelChange={setSortModel}
          autoHeight={false}
          loading={loading}
          sx={{
            '& .MuiDataGrid-root': { border: 'none' },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f3f4f6' },
            '& .MuiDataGrid-cell': { whiteSpace: 'normal', wordWrap: 'break-word' },
          }}
        />
      </div> : <div className="flex-1 flex justify-center items-center text-gray-500">No data found</div>}
      {Boolean(showSubItems) && <MainModal modalName={modalTitle} isOpen={Boolean(showSubItems)} onClose={() => setShowSubItems(null)} type={showSubItems?.action} data={showSubItems?.subItem} onAction={refreshData} />}
      {openInspectionModal.open && <LineItemsInspection isOpen={openInspectionModal.open} onCancel={() => setOpenInspectionModal({ open: false, po_id: '' })} po_id={openInspectionModal.po_id} />}
      {openDispatchModal.isOpen && <SelectItemsModal isOpen={openDispatchModal.isOpen} onClose={() => setOpenDispatchModal({ isOpen: false, po_line_item_id: null, po_item_details_id: null })} onModalSubmit={refreshData} po_line_item_id={openDispatchModal.po_line_item_id} line_item_name={openDispatchModal.line_item_name} po_item_details_id={openDispatchModal.po_item_details_id} />}
      {openUploadModal.open && <UploadPDF isOpen={openUploadModal.open} po_id={openUploadModal.po_id} onCancel={() => setOpenUploadModal({ open: false, po_id: null, po_line_item_id: null })} onSubmit={refreshData} />}
    </div>
  );
}