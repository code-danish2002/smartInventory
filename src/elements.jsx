import React from "react";
import Select from "react-select";
import { DeleteIcon } from "./utils/icons.jsx";

export const MySelect = ({ property, value, options, handleInputChange }) => {
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
            indicatorsContainer: base => ({ ...base,  }),
            multiValue: base => ({ ...base, maxWidth: '95%' }),
        }
    };
    return (
        <Select
            id={property.name}
            name={property.name}
            isMulti={property.isMulti}
            isClearable={true}
            isDisabled={property.isDisabled}
            options={options}
            placeholder={property.placeholder}
            value={
                property.isMulti
                    ? options?.[property.name]?.filter(option => value.includes(option.value))
                    : options?.[property.name]?.find(option => option.value === value)
            }
            onChange={selected => {
                const val = property.isMulti
                    ? selected.map(s => s.value)
                    : selected?.value || '';
                handleInputChange(property.name, val);
            }}
            className="mt-1 basic-multi-select min-w-36"
            classNamePrefix="select"
            maxMenuHeight={200}  // Maximum height before scrolling starts
            menuPlacement="auto" // Smart positioning
            {...commonSelectProps}
            // styles={{
            //     control: (base) => ({
            //         ...base,
            //         minHeight: '42px', // Minimum height
            //         maxHeight: '65px', // Maximum height before control scroll
            //         overflowY: 'auto', // Enable scroll in control
            //         scrollbarWidth: 'none', // Control scrollbar width
            //     }),

            //     valueContainer: (base) => ({
            //         ...base,
            //         maxHeight: '65px',
            //         marginRight: '5%',
            //         overflowY: 'auto',
            //         scrollbarWidth: 'none',
            //     }),
            //     indicatorsContainer: (base) => ({
            //         ...base,
            //         position: 'absolute',
            //         right: '0',
            //         top: '0',
            //         height: '100%',
            //     }),
            //     menu: (base) => ({
            //         ...base,
            //         maxHeight: '200px', // Match maxMenuHeight
            //         scrollbarWidth: 'none',
            //     }),
            //     multiValue: (base) => ({
            //         ...base,
            //         maxWidth: '95%', // Prevent overflow of selected items
            //     }),
            //     menuList: (base) => ({
            //         ...base,
            //         maxHeight: '200px', // Match maxMenuHeight
            //         scrollbarWidth: 'none',
            //     })
            // }}
        />
    );
};

export const MyInput = ({ property, value, handleInputChange }) => {
    return (
        <input
            id={property.name}
            name={property.name}
            type={property.type}
            placeholder={property.placeholder || property.label}
            disabled={property.isDisabled}
            required={property.isRequired}
            value={value}
            onChange={e => handleInputChange(property.name, e.target.value)}
            className="mt-1 p-2 border rounded-md focus:ring focus:ring-opacity-50"
        />
    );
};

export const MyMultiItem = ({
    lineItemId,
    elements,
    itemDetails = [],
    poLineItems = [],
    itemDetailsOptions = [],
    onLineItemChange,
    onItemDetailsChange,
    onDelete,
    disableDelete = false
}) => {
    const getValue = (name) => {
        //console.log(name);
        //console.log('getValue', name, itemDetails, lineItemId, poLineItems, itemDetailsOptions);
        if (name === 'line_item_id') {
            //console.log(poLineItems.find(opt => opt.value === Number(lineItemId)));
            return poLineItems.find(opt => opt.value === Number(lineItemId)) || null;
        } else if (name === 'item_details_id') {
            //console.log(itemDetailsOptions.find(opt => opt.value === Number(lineItemId)), lineItemId, itemDetailsOptions, itemDetails);
            return itemDetailsOptions.filter(opt => itemDetails.includes(opt.value));
        }
        return null;
    };

    const handleChange = (name, selected) => {
        if (name === 'line_item_id') {
            // selected is a single option object (or null)
            const newId = selected ? selected.value : '';
            onLineItemChange(newId);
        }
        else if (name === 'item_details_id') {
            // selected is an array of option‐objects (or null)
            const newArray = selected ? selected.map(opt => opt.value) : [];
            onItemDetailsChange(newArray);
        }
    };

    return (
        <div className="w-full mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex flex-row w-full gap-2 items-end">
                {elements.map((el, index) => (
                    <div key={index} className="flex flex-col space-y-2 flex-1">
                        <label className="font-medium text-gray-700 mb-1">
                            {el.label}
                            {el.isRequired && <span className="text-red-500">*</span>}
                        </label>
                        {el.type === 'select' && (
                            <Select
                                options={el.name === 'line_item_id' ? poLineItems : itemDetailsOptions}
                                value={getValue(el.name)}
                                isDisabled={el.isDisabled}
                                isRequired={el.isRequired}
                                isMulti={el.isMulti}
                                isClearable={true}
                                onChange={(selected) => handleChange(el.name, selected)}
                                placeholder={`Select ${el.label}`}
                                className="w-full"
                            />
                        )}
                        {/* Extend for other types if needed */}
                    </div>
                ))}

                <div className="flex flex-row space-x-2">
                    <button
                        type="button"
                        onClick={onDelete}
                        className="text-red-600 hover:text-red-800 mr-2 mb-1"
                        disabled={disableDelete}
                    >
                        <DeleteIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};
