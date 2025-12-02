import * as yup from 'yup';

export const poSchema = yup.object().shape({
  po_number: yup.string().trim().required('PO Number is required'),
  firm_id: yup.number().required('Firm is required'),
  tender_number: yup.string().trim().required('Tender Number is required'),
  date_of_issue: yup.string().nullable(),
  inspection_authority_user_id: yup
    .number()
    .required('Inspection Authority User is required'),
  assignee_user_id: yup.number().required('Assignee user is required'),
  pop_location: yup.string().nullable(),
  po_line_items: yup
    .array()
    .min(1, 'At least one line item is required')
    .of(
      yup.object().shape({
        line_item_name: yup.string().required('Line item name is required'),
        quantity: yup.number().positive().required('Quantity is required'),
        quantity_offered: yup.number().positive().required('Qty offered is required'),
        quantity_inspected: yup
          .number()
          .required('Qty inspected is required')
          .test(
            'matches-serials',
            'Inspected count must match number of serials',
            function(val) {
              const details = this.parent.po_item_details || [];
              const total = details.reduce(
                (sum, d) => sum + (d.item_serial_number?.length || 0),
                0
              );
              return val === total;
            }
          ),
        po_item_details: yup
          .array()
          .min(1, 'At least one detail is required')
          .of(
            yup.object().shape({
              item_type_id: yup.number().required('Type is required'),
              item_make_id: yup.number().required('Make is required'),
              item_model_id: yup.number().required('Model is required'),
              item_part_id: yup.number().required('Part is required'),
              item_serial_number: yup
                .array()
                .min(1, 'At least one serial number is required')
            })
          )
      })
    )
});