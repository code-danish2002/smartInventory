import React from 'react';
import Modal from 'react-modal';
import { MyInput } from '../elements';
import Select from 'react-select';
import { RoundAddCircle } from '../utils/icons';
import api from '../api/apiCall';
import { useToast } from '../context/toastProvider';

export default function AddERP({ isOpen, onClose }) {
    const [erpData, setErpData] = React.useState();
    const [loading, setLoading] = React.useState(false);
    const addToast = useToast();
    const [options, setOptions] = React.useState({
        firm_id: [],
        unit_measurement: [
            { value: 'Bags', label: 'Bags' },
            { value: 'Bale', label: 'Bale' },
            { value: 'Bundles', label: 'Bundles' },
            { value: 'Buckles', label: 'Buckles' },
            { value: 'Billions of Units', label: 'Billions of Units' },
            { value: 'Box', label: 'Box' },
            { value: 'Bottles', label: 'Bottles' },
            { value: 'Bunches', label: 'Bunches' },
            { value: 'Cans', label: 'Cans' },
            { value: 'Cubic Meter', label: 'Cubic Meter' },
            { value: 'Cubic Centimeter', label: 'Cubic Centimeter' },
            { value: 'Centimeter', label: 'Centimeter' },
            { value: 'Cartons', label: 'Cartons' },
            { value: 'Dozen', label: 'Dozen' },
            { value: 'Drum', label: 'Drum' },
            { value: 'Great Gross', label: 'Great Gross' },
            { value: 'Grams', label: 'Grams' },
            { value: 'Gross', label: 'Gross' },
            { value: 'Gross Yards', label: 'Gross Yards' },
            { value: 'Kilograms', label: 'Kilograms' },
            { value: 'Kiloliter', label: 'Kiloliter' },
            { value: 'Kilometre', label: 'Kilometre' },
            { value: 'Millilitre', label: 'Millilitre' },
            { value: 'Meters', label: 'Meters' },
            { value: 'Metric Tons', label: 'Metric Tons' },
            { value: 'Numbers', label: 'Numbers' },
            { value: 'Packs', label: 'Packs' },
            { value: 'Pieces', label: 'Pieces' },
            { value: 'Pairs', label: 'Pairs' },
            { value: 'Quintal', label: 'Quintal' },
            { value: 'Rolls', label: 'Rolls' },
            { value: 'Sets', label: 'Sets' },
            { value: 'Square Feet', label: 'Square Feet' },
            { value: 'Square Meters', label: 'Square Meters' },
            { value: 'Square Yards', label: 'Square Yards' },
            { value: 'Tablets', label: 'Tablets' },
            { value: 'Ten Gross', label: 'Ten Gross' },
            { value: 'Thousands', label: 'Thousands' },
            { value: 'Tonnes', label: 'Tonnes' },
            { value: 'Tubes', label: 'Tubes' },
            { value: 'US Gallons', label: 'US Gallons' },
            { value: 'Units', label: 'Units' },
            { value: 'Yards', label: 'Yards' },
            { value: 'Others', label: 'Others' }
        ],
    });
    const elements = [
        { name: 'po_number', label: 'PO Number', type: 'input', isDisabled: false, isRequired: true, placeholder: 'PO Number' },
        { name: 'tender_number', label: 'Tender Number', type: 'input', isDisabled: false, isRequired: true, placeholder: 'Tender Number' },
        { name: 'firm_id', label: 'Firm Name', type: 'select', isDisabled: false, isRequired: true, placeholder: 'Firm Name' },
    ];

    const lineItemsElements = [
        { name: 'line_item_name', label: 'Line Item Name', type: 'input', isDisabled: false, isRequired: true, placeholder: 'Line Item Name' },
        { name: 'description', label: 'Description', type: 'input', isDisabled: false, isRequired: true, placeholder: 'Description' },
        { name: 'total_quantity', label: 'Quantity', type: 'input', isDisabled: false, isRequired: true, placeholder: 'Quantity', inputType: 'number' },
        { name: 'unit_measurement', label: 'Unit Measurement', type: 'select', isDisabled: false, isRequired: true, placeholder: 'Unit Measurement', },
        { name: 'unit_price', label: 'Unit Price(₹)', type: 'input', isDisabled: false, isRequired: true, placeholder: 'Unit Price in Rs', inputType: 'number' },
    ]

    React.useEffect(() => {
        api.get('/api/firm/names', { params: { page: 1, limit: 100 } }).then((response) => {
            const firms = response.data.data.map((item) => ({ value: item.firm_id, label: item.firm_name }));
            setOptions({ ...options, firm_id: firms });
        });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        api.post('/api/posCreate', erpData).then((response) => { addToast(response); onClose(); }).catch((error) => { addToast(error); onClose(); });
        console.log(erpData, 'erpData');
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

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center p-4 max-h-full overflow-auto"
            overlayClassName="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
            shouldCloseOnEsc={true}
            shouldCloseOnOverlayClick={true}
        >
            <div className="bg-white shadow-2xl overflow-hidden flex flex-col w-max max-w-6xl rounded-2xl">
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Add New ERP</h2>
                    <button onClick={onClose} className="text-gray-500 px-3 py-1 rounded-lg hover:text-gray-700 hover:bg-gray-300 text-lg">
                        &times;
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 w-full max-h-[80vh] overflow-auto mb-6 p-4 border rounded-lg bg-gray-50">

                    {elements.map((element, index) => (
                        <div key={index} className="flex flex-col gap-2 mb-4 min-w-[250px] max-w-full">
                            <label className="block text-sm font-medium text-gray-900">{element.label}</label>
                            {element.type === 'input' ? (
                                <input
                                    type={element.inputType || 'text'}
                                    id={element.name}
                                    name={element.name}
                                    placeholder={element.placeholder}
                                    value={erpData?.[element.name] || ''}
                                    onChange={(e) => setErpData({ ...erpData, [element.name]: e.target.value })}
                                    required={element.isRequired}
                                    className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                />
                            ) : element.type === 'select' ? (
                                <Select
                                    options={options[element.name] || []}
                                    value={options[element.name]?.find((option) => option.value === erpData?.[element.name]) || null}
                                    onChange={selectedOption => setErpData({ ...erpData, [element.name]: selectedOption?.value })}
                                    id={element.name}
                                    name={element.name}
                                    isClearable={true}
                                    isDisabled={element.isDisabled}
                                    className="mt-1 basic-multi-select min-w-36"
                                    classNamePrefix="select"
                                    maxMenuHeight={200}  // Maximum height before scrolling starts
                                    menuPlacement="auto" // Smart positioning
                                    {...commonSelectProps}
                                />
                            ) : null}
                        </div>
                    ))}

                    <div className="flex mb-4 w-full border-dashed border-2 border-gray-300"></div>
                    <label className="block text-sm font-medium text-gray-900">Line Items</label>


                    {erpData?.po_line_items?.map((lineItem, index) => (
                        <div key={index} className="w-full flex flex-col p-4 bg-white rounded-lg shadow-sm mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold mb-2">Line Item {index + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updatedLineItems = [...erpData.po_line_items];
                                        updatedLineItems.splice(index, 1);
                                        setErpData({ ...erpData, po_line_items: updatedLineItems });
                                    }}
                                    className="text-red-500 hover:text-red-700 mb-2"
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {lineItemsElements.map((element, idx) => (
                                    <div key={idx} className="flex flex-col gap-2 mb-4">
                                        <label className="block text-sm font-medium text-gray-900">{element.label}</label>
                                        {element.type === 'input' ? <MyInput
                                            property={element}
                                            value={lineItem[element.name] || ''}
                                            handleInputChange={(name, value) => {
                                                const updatedLineItems = [...erpData.po_line_items];
                                                updatedLineItems[index][name] = value;
                                                setErpData({ ...erpData, po_line_items: updatedLineItems });
                                            }}
                                        />
                                            : element.type === 'select' ? <Select
                                                options={options[element.name] || []}
                                                value={options[element.name]?.find((option) => option.value === lineItem[element.name]) || null}
                                                onChange={selectedOption => {
                                                    const updatedLineItems = [...erpData.po_line_items];
                                                    updatedLineItems[index][element.name] = selectedOption?.value;
                                                    setErpData({ ...erpData, po_line_items: updatedLineItems });
                                                }}
                                                id={element.name}
                                                name={element.name}
                                                isClearable={true}
                                                isDisabled={element.isDisabled}
                                                className="mt-1 basic-multi-select min-w-36"
                                                classNamePrefix="select"
                                                maxMenuHeight={200}  // Maximum height before scrolling starts
                                                menuPlacement="auto" // Smart positioning
                                                {...commonSelectProps}
                                            />
                                                : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => {
                            setErpData({ ...erpData, po_line_items: [...(erpData?.po_line_items || []), {}] });
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                        <RoundAddCircle />
                        <span>Line Item</span>
                    </button>

                    <div className="flex justify-end w-full">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`inline-flex items-center justify-center px-6 py-2 ${loading ? 'bg-blue-300 opacity-50 cursor-not-allowed' : 'bg-blue-400'} text-white font-semibold rounded-lg hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            disabled={loading}
                        >
                            {loading ? <OnSubmitLoading /> : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}