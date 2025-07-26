export const validateForm = ( inspectionDetails, assigneeUserId,lineItems) => {
    const errors = [];
    const inputErrors = {};

    // — Top-level required fields —
    if (!inspectionDetails.po_number?.toString().trim()) {
      //errors.push('PO Number is required.');
      inputErrors.erp_po_id = 'PO Number is required.';
    }
    if (!inspectionDetails.firm_id) {
      //errors.push('Firm is required.');
        inputErrors.firm_id = 'Firm is required.';
    }
    if (!inspectionDetails.tender_number?.toString().trim()) {
      //errors.push('Tender Number is required.');
        inputErrors.tender_number = 'Tender Number is required.';
    }
    if (!assigneeUserId) {
      //errors.push('Assignee user is required.');
        inputErrors.assigneeUserId = 'Assignee user is required.';
    }
    if (!inspectionDetails.inspected_byID) {
      //errors.push('Inspection Authority User is required.');
        inputErrors.inspected_byID = 'Inspection Authority User is required.';
    }

    // — At least one line item —
    const items = Array.isArray(lineItems) ? lineItems : [];
    if (items.length < 1) {
      errors.push('At least one line item is required.');
    }

    // — Per-line-item checks —
    items.forEach((li, idx) => {
      const lineNum = idx + 1;
      if (!li.line_item_name?.toString().trim()) {
        errors.push(`Line ${lineNum}: name is required.`);
      }
      if (typeof li.total_quantity !== 'number' || li.total_quantity <= 0) {
        errors.push(`Line ${lineNum}: total_quantity must be > 0.`);
      }

      // must have at least one detail
      if (!Array.isArray(li.items) || !li.items.length) {
        errors.push(`Line ${lineNum}: at least one item detail is required.`);
      } else {
        // detail-level required fields
        li.items.forEach((sub, j) => {
          const detNum = j + 1;
          if (!sub.item_type_id) {
            errors.push(`Line ${lineNum}, detail ${detNum}: item type is required.`);
          }
          if (!sub.item_make_id) {
            errors.push(`Line ${lineNum}, detail ${detNum}: item make is required.`);
          }
          if (!sub.item_model_id) {
            errors.push(`Line ${lineNum}, detail ${detNum}: item model is required.`);
          }
          if (!sub.item_part_id) {
            errors.push(`Line ${lineNum}, detail ${detNum}: item part is required.`);
          }
          // serials
          const serialCount = Array.isArray(sub.item_serial_number)
            ? sub.item_serial_number.length
            : 0;
          if (serialCount === 0) {
            errors.push(
              `Line Item "${li.line_item_name}", detail ${detNum}: at least one serial number is required.`
            );
          }
        });
      }

      // inspected-vs-serial-count mismatch
      const totalSerials = li.items.reduce(
        (sum, sub) =>
          sum + (Array.isArray(sub.item_serial_number) ? sub.item_serial_number.length : 0),
        0
      );
      if (li.quantity_offered !== totalSerials) {
        errors.push(
          `Line Item "${li.line_item_name}": ${li.quantity_offered} items offered, but the total number of items is ${totalSerials}.`
        );
      }
    });

    return { errors, inputErrors };
  };