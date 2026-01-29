// src/endpoints.jsx
const endpoints = {
    Dashboard: {
        get: { url: '/api/dashboard/counts', params: {}, body: [] },
        details: { url: '/api/dashboard/{status}', params: ['status'], body: [] },
    },

    Certificates: {
        get: { url: '/api/po_details_for_pdf', params: ['page', 'limit', 'search'], body: [] },
    },

    Users: {
        get: { url: '/api/user_details_full', params: ['page', 'limit'], body: [] },
        update: {
            url: '/api/user-details/{user_id}', params: ['user_id'],
            body: [
                { name: 'user_location', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'User Location', placeholder: 'Enter User Location' },
                { name: 'pop_id', type: 'number', element: 'select', isRequired: true, isDisabled: false, label: 'POP Name' },
            ]
        },
    },

    'All POs': {
        get: { url: '/api/poData', params: ['page', 'limit', 'search'], body: [] },
        details: { url: '/api/poData/{po_id}', params: ['po_id'], body: [] },
    },

    Firm: {
        get: { url: '/api/firm/details', params: ['page', 'limit'], body: [] },
        create: {
            url: '/api/firm/names', params: [],
            body: [
                { name: 'firm_name', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Firm Name', placeholder: 'Enter Name' },
                { name: 'firm_address', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Firm Address', placeholder: 'Enter Address' },
                { name: 'contact_person_name', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Contact Person', placeholder: 'Enter Contact Name' },
                { name: 'contact_number', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Contact Number', placeholder: 'Enter Contact Number' },
                { name: 'email_address', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Email', placeholder: 'Enter Email' },
                { name: 'gstin_number', type: 'string', element: 'input', isRequired: false, isDisabled: false, label: 'GSTIN Number', placeholder: 'Enter GSTIN No' },
            ],
        },
        update: {
            url: '/api/firm/names', params: ['firm_id'],
            body: [
                { name: 'firm_name', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Firm Name' },
                { name: 'firm_address', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Firm Address' },
                { name: 'contact_person_name', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Contact Person' },
                { name: 'contact_number', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Contact Number' },
                { name: 'email_address', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Email' },
                { name: 'gstin_number', type: 'string', element: 'input', isRequired: false, isDisabled: false, label: 'GSTIN Number' },
            ],
        },
        delete: { url: '/api/firm/delete', params: ['firm_id'], body: [] },
    },

    Type: {
        get: { url: '/api/item-types', params: ['page', 'limit'], body: [] },
        create: {
            url: '/api/item-types', params: [],
            body: [
                { name: 'item_type_name', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Type Name' },
            ],
        },
        delete: { url: '/api/item-types/{id}', params: ['item_type_id'], body: [] },
    },

    Make: {
        get: { url: '/api/item-makes', params: ['page', 'limit'], body: [] },
        create: {
            url: '/api/item-makes', params: [],
            body: [
                { name: 'item_type_id', type: 'select', element: 'select', isRequired: true, isDisabled: false, label: 'Type Name', },
                { name: 'item_make_name', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Make Name' },
            ],
        },
        delete: { url: '/api/item-makes/{id}', params: ['item_make_id'], body: [] },
    },

    Model: {
        get: { url: '/api/item-models', params: ['page', 'limit'], body: [] },
        create: {
            url: '/api/item-models', params: [],
            body: [
                { name: 'item_make_id', type: 'select', element: 'select', isRequired: true, isDisabled: false, label: 'Make Name', },
                { name: 'item_model_name', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Model Name' },
            ],
        },
        delete: { url: '/api/item-models/{id}', params: ['item_model_id'], body: [] },
    },

    Part: {
        get: { url: '/api/item-parts', params: ['page', 'limit'], body: [] },
        create: {
            url: '/api/item-parts', params: [],
            body: [
                { name: 'item_model_id', type: 'select', element: 'select', isRequired: true, isDisabled: false, label: 'Model Name', },
                { name: 'item_part_code', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Part Code' },
                { name: 'item_part_description', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Part Description' },
            ],
        },
        delete: { url: '/api/item-parts/{id}', params: ['item_part_id'], body: [] },
    },

    PO: {
        create: { url: '/api/pos', params: {}, body: [] },
        update: { url: '/api/pos-correction/{po_id}', params: ['po_id'], body: [] },
        delete: { url: '/api/po/delete', params: {}, body: [] },
        get: { url: '/api/pos', params: {}, body: [] },
        details: { url: '/api/po/details', params: {}, body: [] },
    },

    'Line Item': {
        create: { url: '/api/po/line-items/create', params: {}, body: [] },
        update: { url: '/api/po/line-items/update', params: {}, body: [] },
        delete: { url: '/api/po/line-items/delete', params: {}, body: [] },
        get: { url: '/api/poLine/{po_id}/line-items', params: ['po_id'], body: [] },
    },

    'Item Details': {
        create: { url: '/api/po/item-details/create', params: {}, body: [] },
        update: { url: '/api/po/item-details/update', params: {}, body: [] },
        delete: { url: '/api/po/item-details/delete', params: {}, body: [] },
        get: { url: '/api/line-items/{po_line_item_id}/items', params: ['po_line_item_id'], body: [] },
    },

    'Upload PDF': {
        'upload_pdf': { url: '/api/pos/{po_id}/upload', params: ['po_id'], body: [] },
    },

    'Approve PO': {
        'request-approval': { url: '/api/inspection/{id}', params: ['id'], body: [] },
        'store': { url: '/api/store-items', params: [], body: [] },
        'dispatch': { url: '/api/dispatches', params: [], body: [] },
    },

    'At Store': {
        'request-approval': { url: '/api/store-items/action', params: [], body: [] },
    },

    Stores: {
        get: { url: '/api/stores', params: ['page', 'limit'], body: [] },
        create: {
            url: '/api/stores', params: [],
            body: [
                { name: 'store_name', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Store Name' },
                { name: 'pop_id', type: 'number', element: 'async-select', isRequired: true, isDisabled: false, label: 'POP Name', placeholder: 'Type & Select Name' },
            ]
        },
        update: {
            url: '/api/stores/{id}', params: ['store_id'],
            body: [
                { name: 'store_name', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Store Name' },
                { name: 'pop_id', type: 'number', element: 'async-select', isRequired: true, isDisabled: false, label: 'POP Name', placeholder: 'Type & Select Name' },
            ]
        },
        delete: { url: '/api/stores/{id}', params: ['store_id'], body: [] },
        details: { url: '/api/stores/{id}', params: ['store_id'], body: [] },
    },

    'On Site': {
        'request-approval': { url: '/api/site-items/action', params: [], body: [] },
    },

    'Track History': {
        'get': { url: '/api/tracking/{po_item_details_id}', params: ['po_item_details_id'], body: [] },
    },

    'RMA History': {
        'get': { url: '/api/tracking/{po_item_details_id}', params: ['po_item_details_id', 'rma_id'], body: [] },
    },
    'Rejected': {
        update: {
            url: '/api/operation/resend', params: [], body: [
                { name: 'po_item_details_id', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'Item ID' },
                { name: 'pop_id', type: 'string', element: 'input', isRequired: true, isDisabled: false, label: 'POP ID' },
            ]
        },
    },
};

export default function getEndpoint(item, method, part, params = {}) {
    console.log('getEndpoint called with:', { item, method, part, params });

    const config = endpoints[item]?.[method];

    if (!config) {
        console.error(`Endpoint for ${item} with method ${method} not found`);
        return null;
    }

    if (part === 'url') {
        return config.url.replace(/{(\w+)}/g, (match, placeholder) => {
            if (item === 'Approve PO' && method === 'request-approval' && placeholder === 'id') return params['po_id'];
            if (item === 'Line Item' && method === 'get' && placeholder === 'po_id') return params['po_id'];
            if (item === 'Item Details' && method === 'get' && placeholder === 'po_line_item_id') return params['po_line_item_id'];
            if (item === 'At Store' && method === 'request-approval' && placeholder === 'stored_item_id') return params['po_item_details_id'];
            if (item === 'On Site' && method === 'request-approval' && placeholder === 'item_received_id') return params['po_item_details_id'];
            if (item === 'Type' && method === 'delete' && placeholder === 'id') return params['item_type_id'];
            if (item === 'Make' && method === 'delete' && placeholder === 'id') return params['item_make_id'];
            if (item === 'Model' && method === 'delete' && placeholder === 'id') return params['item_model_id'];
            if (item === 'Part' && method === 'delete' && placeholder === 'id') return params['item_part_id'];
            if (item === 'Stores' && method === 'delete' && placeholder === 'id') return params['store_id'];
            if (item === 'Stores' && method === 'details' && placeholder === 'id') return params['store_id'];
            if (item === 'Stores' && method === 'update' && placeholder === 'id') return params['store_id'];
            if (item === 'Track History' && method === 'get' && placeholder === 'po_item_details_id') return params['po_item_details_id'];

            const paramValue = params[placeholder];
            if (paramValue === undefined || paramValue === null) {
                // Return original placeholder if not found, to avoid crash or let generic logic handle it
                console.warn(`Missing param for placeholder: ${placeholder}`);
                return match;
            }
            return String(paramValue);
        });
    }


    if (part === 'params') return config.params;
    if (part === 'body') return config.body;

    return `Unsupported part: ${part}`;
}

