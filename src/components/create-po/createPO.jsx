import { useState, useEffect } from 'react';
import LineItemForm from './lineItemForm.jsx';
import api from '../../api/apiCall.js';
import { useAuth } from '../../context/authContext.jsx';
import { useToast } from '../../context/toastProvider.jsx';
import { generatePDF } from '../../utils/pdfGenerator.js';
import { useLocation } from 'react-router-dom';
import { generateDevSigningParams } from '../../utils/signingParams.jsx';
import Select from 'react-select';
import { validateAddDataForm, validateInspectionForm } from '../../utils/validatePoForm.js';
import { downloadPDF } from '../../utils/downloadResponsePdf.js';
import { extractResponseInfo } from '../../utils/responseInfo.js';

const CreatePO = () => {
  const { state } = useLocation();
  const { defaultValues, task } = state || {};
  const [poDetails, setPoDetails] = useState({ ...(defaultValues || {}), po_created_at: new Date().toISOString().slice(0, 10) });
  const [assigneeUserId, setAssigneeUserId] = useState(null);
  const [assigneeName, setAssigneeName] = useState(null);
  const [formLoading, setFormLoading] = useState(true);
  const [submitError, setSubmitError] = useState(null);
  const [formError, setFormError] = useState({});

  const { name } = useAuth();
  const addToast = useToast();

  const myElements = [
    { name: 'erp_po_id', real_name: 'po_number', label: 'PO Number', type: 'select', isDisabled: false, isRequired: true, placeholder: 'PO12345' },
    { name: 'tender_number', label: 'Tender Number', type: 'show', isDisabled: true, isRequired: true, placeholder: 'TN12345' },
    { name: 'data_operator_id', label: 'Data Entry Operator', type: 'select', isDisabled: false, isRequired: true, placeholder: 'in options', },
    { name: 'po_created_at', label: 'Date of Inspection', type: 'show', isDisabled: false, isRequired: true, placeholder: 'YYYY-MM-DD' },
    { name: 'po_date_of_issue', label: 'PO Date of Issue', type: 'show', isDisabled: true, isRequired: true, placeholder: 'YYYY-MM-DD' },
  ];

  const firmElements = [
    { name: 'firm_name', label: 'Firm Name', type: 'show', isDisabled: true, isRequired: true, placeholder: 'RCIL' },
    { name: 'firm_address', label: 'Firm Address', type: 'show', isDisabled: true, isRequired: true, placeholder: 'Delhi, India-110000', value: 'New Delhi' },
    { name: 'contact_person_name', label: 'Contact Person', type: 'show', isDisabled: true, isRequired: true, placeholder: 'John Doe', value: 'Danish' },
    { name: 'contact_number', label: 'Contact Number', type: 'show', isDisabled: true, isRequired: true, placeholder: '+91-1234567890', value: '1234567890' },
    { name: 'email_address', label: 'Email', type: 'show', isDisabled: true, isRequired: true, placeholder: 'john@example.com', value: '2i6lD@example.com' },
    { name: 'gstin_number', label: 'GSTIN Number', type: 'show', isDisabled: true, isRequired: false, placeholder: 'GSTIN12345678', value: 'GSTIN12345678' },
  ]

  const [options, setOptions] = useState({
    data_operator_id: [],
    erp_po_id: [],
  });

  useEffect(() => {
    Promise.all([
      api.get('/api/poNumberData'),
      api.get('/api/user-details'),
    ])
      .then(([poNumberRes, userDetailsRes]) => {
        const poNumberData = poNumberRes.data.data;
        const poNumberOptions = poNumberData.map(po => ({
          value: po.erp_po_id,
          label: po.po_number,
        }))

        const userDetails = userDetailsRes.data.data;
        const inspectionAuthorityOptions = userDetails.map(user => ({
          value: user.user_id,
          label: user.user_name || 'Unknown User',
        }));

        setOptions(prev => ({ ...prev, erp_po_id: poNumberOptions, data_operator_id: inspectionAuthorityOptions, }));
      })
      .catch(err => { console.error(err); alert('Failed to fetch Inspection Authority: ', err); })
      .finally(() => setFormLoading(false));
  }, []);

  useEffect(() => {
    if (poDetails.erp_po_id) {
      api.get(`/api/poCreatedData/${poDetails.erp_po_id}`)
        .then(response => {
          setPoDetails(prev => ({ ...prev, ...response.data.data }));
        }).catch(error => {
          addToast(error);
          console.error('Error fetching PO data:', error);
        });
    } else {
      setPoDetails({
        po_created_at: new Date().toISOString().slice(0, 10),
        erp_po_id: '',
        po_line_items: []
      });
    }
  }, [poDetails.erp_po_id]);

  useEffect(() => {
    if (name) {
      //const fullName = name ? `${name}` : 'Unknown User';
      api.get(`/api/user-details-by-name/${name}`).then((response) => {
        const assigneeId = response.data.data.user_id;
        const assigneeName = response.data.data.user_name;
        setAssigneeUserId(assigneeId);
        setAssigneeName(assigneeName);
      }
      ).catch((error) => {
        console.error('Error fetching user details:', error);
        alert('Failed to fetch user details: ', error);
      });
    }
  }, [name]);

  useEffect(() => {
    if (poDetails.data_operator_id) {
      setPoDetails({ ...poDetails, inspected_by: options.data_operator_id.find(option => option.value === poDetails.data_operator_id)?.label });
    }
  }, [poDetails.data_operator_id, poDetails.inspected_by]);

  const handleConfirmSubmit = async (e, lineItems, esign) => {
    e.preventDefault();
    setFormLoading(true);

    // Validate form
    let errors = [];
    

    const currentDateTime = new Date().toISOString().slice(0, 10); // Format as YYYY-MM-DD

    // Construct API body
    const apiBody = {
      po_number: poDetails?.po_number || '',
      firm_id: poDetails?.firm_id || null,
      tender_number: poDetails.tender_number,
      po_date_of_issue: poDetails.po_date_of_issue,
      inspector_id: poDetails.inspector_id || assigneeUserId || null,
      data_operator_id: poDetails.data_operator_id || null,
      pdf_sign_type: esign ? esign : "Physically_Sign",
      //line_items
      po_line_items: lineItems?.map(item => ({
        po_line_item_id: item.po_line_item_id,
        line_item_name: item.line_item_name || '',
        total_quantity: item.total_quantity || 0,
        quantity_offered: item.quantity_offered || 0,
        quantity_inspected: item.quantity_inspected || 0,
        description: item.description || '',
        unit_measurement: item.unit_measurement || '',
        unit_price: item.unit_price || 0,
        warranty_start: item.warranty_start || null,
        // items
        po_item_details: item?.items?.map(subItem => ({
          po_item_details_id: subItem.po_item_details_id || 0,
          item_type_id: subItem.item_type_id || 0,
          item_make_id: subItem.item_make_id || 0,
          item_model_id: subItem.item_model_id || 0,
          item_part_id: subItem.item_part_id || 0,
          item_serial_number: subItem.item_serial_number || [],
          remarks: subItem.remarks || '',
        }))
      }))
    };

    console.log('API Body:', apiBody, assigneeUserId, poDetails.inspector_id);
    if (task === 'Create Inspection' || task === 'Update Inspection') {
      errors = validateInspectionForm(apiBody);
    }
    if (task === 'Add Item Details') {
      errors = validateAddDataForm(apiBody);
    }

    if (errors.errors?.length || Object.keys(errors.inputErrors).length) {
      console.log('Form validation errors:', errors, 'inputErrors:', errors.inputErrors);
      setSubmitError(errors.errors ?? []);
      setFormError(errors.inputErrors ?? {});
      setFormLoading(false);
      return;
    }
    setSubmitError(null);

    // API call
    const method = task === 'Create Inspection' ? 'post' : 'put';
    const url = task === 'Create Inspection' ? '/api/pos' : task === 'Add Item Details' ? `/api/pos-dataEntry/${poDetails?.po_id}` : `/api/pos-correction/${poDetails?.po_id}`;
    const params = task === 'Create Inspection' ? {} : { po_id: poDetails?.po_id };

    const expectsPdf = task === 'Add Item Details' || task === 'Update Inspection';

    const config = {
      ...(expectsPdf ? { responseType: 'arraybuffer' } : {}),
    };

    console.log('API Call:', method.toUpperCase(), url, 'params:', params, 'body:', apiBody);

    try {
      const response = await api[method](url, apiBody, config);

      // Use Axios response handling
      if (response.headers['content-type'] === 'application/pdf' && task !== 'Create Inspection') {
        const { filename, message} = extractResponseInfo(response, 'Inspection Certificate.pdf');
        console.log(filename, message, response?.headers, response);
        downloadPDF(response.data, filename);
        addToast({ response: {statusText: 'Form Submitted!'}, type: 'success', status: '200' });
      } else {
        // Handle non-PDF responses, such as for 'Create Inspection' or 'po-correction' tasks
        addToast(response);
      }

      // Move window.history.back() outside the PDF logic
      // so it always runs on a successful API call.
      window.history.back();

    } catch (error) {
      addToast(error);
    } finally {
      setFormLoading(false);
    }
  };

    const commonSelectProps = {
      menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
      menuPosition: 'absolute',
      styles: {
        menuPortal: base => ({ ...base, zIndex: 10000 }),
        control: base => ({ ...base, minHeight: '42px', maxHeight: '65px', overflowY: 'auto' }),
        valueContainer: base => ({ ...base, maxHeight: '65px', overflowY: 'auto' }),
        menu: base => ({ ...base, maxHeight: '200px', overflowY: 'auto', zIndex: 10000 }),
        menuList: base => ({ ...base, maxHeight: '200px', overflowY: 'auto', scrollbarWidth: 'none', zIndex: 10000 }),
        indicatorSeparator: base => ({ ...base, display: 'none' }),
        indicatorsContainer: base => ({ ...base, }),
        multiValue: base => ({ ...base, maxWidth: '95%' }),
      }
    };

    console.log('poDetails', poDetails, 'formError', formError, 'assigneeUserId', assigneeUserId,);

    return (
      <>
        <div className="relative w-full bg-white rounded h-full overflow-auto max-w-[100vw]">
          <div className="flex justify-center my-2 px-4">
            <div className="w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">{task}</h2>
              </div>


              {/* Static Form Section */}
              <div className="w-full flex flex-col xl:flex-row mb-8 gap-4">
                {/* First section for PO details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 gap-4 border rounded-md shadow">
                  {myElements.map((element, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {element.label}
                      </label>

                      {element.type === 'select' ? (
                        <>
                          <Select
                            options={options[element.name] || []}
                            name={element.name}
                            value={
                              options?.[element.name]?.find(
                                (opt) => opt.value === poDetails[element.name]
                              )
                              || options.erp_po_id.find(opt => opt.label === poDetails[element.real_name])
                              || null
                            }
                            onChange={(e) => {
                              if (task !== 'Add Item Details') {
                                setPoDetails({
                                  ...poDetails,
                                  [element.name]: e?.value ?? '',
                                });
                              }
                            }
                            }
                            isClearable
                            className={`react-select-container mt-1 w-full ${element.isDisabled ? 'pointer-events-none' : ''} ${formError?.[element.name] ? 'border-red-500' : ''}`}
                            classNamePrefix="react-select"
                            placeholder={element.placeholder}
                            isDisabled={element.isDisabled}
                            {...commonSelectProps}
                          />
                          {options[element.name]?.length === 0 && !formLoading ? (
                            <p className="text-red-500 text-sm mt-1">
                              {element.label} is not available
                            </p>
                          ) : formError?.[element.name] ? (
                            <p className="text-red-500 text-sm mt-1">
                              {formError?.[element.name]}
                            </p>
                          )
                            : (
                              <p className="text-sm mt-1">&nbsp;</p>
                            )}
                        </>
                      ) : element.type === 'show' ? (
                        <p className="text-gray-800 p-2 border border-gray-300 rounded-md bg-gray-50 min-h-[42px] flex items-center">
                          {poDetails?.[element.name] || `e.g. ${element.placeholder}`}
                        </p>
                      ) : (
                        <input
                          type={element.type === 'date' ? 'date' : 'text'}
                          value={poDetails?.[element.name] || ''}
                          onChange={(e) =>
                            setPoDetails({
                              ...poDetails,
                              [element.name]: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          placeholder={element.placeholder}
                          readOnly={element.isDisabled}
                          required={element.isRequired}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Second section for Firm details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 p-4 gap-4 mt-4 xl:mt-0 border rounded-md shadow">
                  {firmElements.map((element, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {element.label}
                      </label>

                      {element.type === 'select' ? (
                        <>
                          <Select
                            options={options[element.name] || []}
                            name={element.name}
                            value={
                              options[element.name]?.find(
                                (opt) => opt.value === poDetails[element.name]
                              ) || null
                            }
                            onChange={(e) =>
                              setPoDetails({
                                ...poDetails,
                                [element.name]: e?.value ?? '',
                              })
                            }
                            isClearable
                            className="react-select-container mt-1 w-full"
                            classNamePrefix="react-select"
                            placeholder={element.placeholder}
                            isDisabled={element.isDisabled}
                            {...commonSelectProps}
                          />
                          {options[element.name]?.length === 0 && !formLoading ? (
                            <p className="text-red-500 text-sm mt-1">
                              No {element.label} available
                            </p>
                          ) : (
                            <p className="text-sm mt-1">&nbsp;</p>
                          )}
                        </>
                      ) : element.type === 'show' ? (
                        <p className="text-gray-800 p-2 border border-gray-300 rounded-md bg-gray-50 min-h-[42px] flex items-center">
                          {poDetails?.[element.name] || `e.g. ${element.placeholder}`}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <LineItemForm defaultValues={poDetails?.po_line_items} onSubmit={handleConfirmSubmit} onCancel={() => window.history.back()} loading={formLoading} task={task} />

              <div className="text-red-600 font-medium mb-4">
                {submitError ? submitError.map((error, index) => <p key={index}>{error}</p>) : "\u00A0"}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  export default CreatePO;