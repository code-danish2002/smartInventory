/**
 * Utility to handle saving PO as draft.
 * This logic is separated to keep the main modal component clean.
 */

/**
 * Recursive helper to reconstruct tree from payload structure
 * Supports both nested and flat items.
 */
export const reconstructHierarchy = (subItems = [], allItemDetails = [], lineNumber, currentCode = null, nestedItems = []) => {
    const nodes = [];
    const generateId = (type, index) => `${type}-${lineNumber}-${currentCode || 'root'}-${index}-${Math.random().toString(36).substr(2, 5)}`;

    // 1. Add Levels
    subItems.forEach((si, idx) => {
        if (!si) return;
        nodes.push({
            id: generateId('level', idx),
            line_number: lineNumber,
            type: 'level',
            code: si.sub_item_number,
            description: si.sub_item_description,
            quantity: si.sub_item_quantity,
            unit: si.sub_item_unit_of_measurement,
            // Recurse: pass nested children and nested items (if any exist in this branch)
            subItems: reconstructHierarchy(
                si.sub_items || si.children || [],
                allItemDetails, // Keep passing the flat array
                lineNumber,
                si.sub_item_number,
                si.item_details || si.po_item_details || [] // Pass local nested items
            )
        });
    });

    // 2. Add Items belonging to this specific level/node
    const flatMatchedItems = allItemDetails.filter(id => (id.sub_item_code || null) === (currentCode || null));

    // Consolidate unique items (priority to flat matched items if overlap exists)
    const uniqueMap = new Map();
    [...flatMatchedItems, ...nestedItems].forEach(item => {
        const key = item.po_item_details_id || item.id || JSON.stringify(item);
        if (!uniqueMap.has(key)) uniqueMap.set(key, item);
    });

    const uniqueItems = Array.from(uniqueMap.values());

    uniqueItems.forEach((id, idx) => {
        if (!id) return;
        nodes.push({
            id: generateId('item', idx),
            line_number: lineNumber,
            type: 'item',
            item_type_id: id.item_type_id,
            item_make_id: id.item_make_id,
            item_model_id: id.item_model_id,
            item_part_id: id.item_part_id,
            item_type_name: id.item_type_name || '',
            item_make_name: id.item_make_name || '',
            item_model_name: id.item_model_name || '',
            item_part_code: id.item_part_code || '',
            item_serial_number: [...(id.item_serial_number || [])],
            remarks: id.remarks || '',
            subItems: []
        });
    });

    return nodes;
};

const transformHierarchy = (nodes, currentSubItemCode = null) => {
    let subItems = [];
    let flatItemDetails = [];

    nodes.forEach(node => {
        if (node.type === 'level') {
            const { subItems: children, flatItemDetails: nestedItems } =
                transformHierarchy(node.subItems || [], node.code);

            const subItem = {
                sub_item_number: node.code,
                sub_item_description: node.description,
                sub_item_quantity: parseFloat(node.quantity) || 0,
                sub_item_unit_of_measurement: node.unit,
                children: children.length > 0 ? children : undefined
            };

            subItems.push(subItem);
            flatItemDetails = [...flatItemDetails, ...nestedItems];
        } else {
            // This is an 'item' (leaf node)
            flatItemDetails.push({
                item_type_id: node.item_type_id || null,
                item_make_id: node.item_make_id || null,
                item_model_id: node.item_model_id || null,
                item_part_id: node.item_part_id || null,
                item_type_name: node.item_type_name || null,
                item_make_name: node.item_make_name || null,
                item_model_name: node.item_model_name || null,
                item_part_code: node.item_part_code || null,
                sub_item_code: currentSubItemCode,
                quantity_inspected: node.item_serial_number?.length || 0,
                item_serial_number: node.item_serial_number || [],
                remarks: node.remarks || ''
            });
        }
    });

    return { subItems, flatItemDetails };
};

export const handleSaveDraft = async ({
    poDetails,
    poData,
    lineItemTrees,
    assigneeUserId,
    api,
    addToast,
    task
}) => {
    if (!poDetails.po_number && !poData?.po_id) {
        addToast({ response: { statusText: 'Please select a PO first' }, type: 'error', status: '400' });
        return;
    }

    try {
        const poLineItems = poDetails.po_line_items?.map(item => {
            const treeId = item.summary_id || item.po_line_item_id;
            const tree = lineItemTrees[treeId] || [];
            const { subItems, flatItemDetails } = transformHierarchy(tree);

            return {
                po_line_item_id: item.po_line_item_id || item.summary_id,
                line_number: item.line_number,
                line_item_name: item.line_item_name || item.item_name || item.item_description,
                description: item.description || item.item_description,
                unit_price: item.unit_price,
                unit_measurement: item.unit_measurement || item.unit_of_measure,
                total_quantity: item.total_quantity,
                quantity_offered: item.quantity_offered,
                sub_items: subItems.length > 0 ? subItems : null,
                po_item_details: flatItemDetails.length > 0 ? flatItemDetails : []
            };
        }) || [];

        const draftData = {
            po_number: poDetails.po_number,
            po_description: poDetails.po_description,
            firm_id: poData?.firm_id,
            tender_number: poData?.tender_number || poData?.tender_no,
            po_date_of_issue: poData?.po_date_of_issue || poData?.po_date,
            purchaser_id: assigneeUserId,
            inspector_id: poDetails.inspector_id,
            pdf_sign_type: poDetails.pdf_sign_type || "Physically_Sign",
            po_line_items: poLineItems
        };

        const payload = {
            draft_data: draftData
        };

        console.log('Final Draft Payload:', payload);

        const poId = poDetails.po_id || poData?.po_id;
        const url = task === 'Create Inspection' ? '/api/pos-create-draft' : `/api/pos-draft/${poId}`
        const response = await api.post(url, payload);

        addToast(response);
        return response;
    } catch (error) {
        console.error('Error saving draft:', error);
        addToast(error);
        throw error;
    }
};
