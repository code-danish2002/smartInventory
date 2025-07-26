// src/components/TableHeader.jsx
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { Trash2, PlusCircle } from 'lucide-react';
import { FaFilter } from 'react-icons/fa';
import { AddSquare } from '../utils/icons.jsx';
import ParentModal from '../modals/parentModal.jsx';

export default function TableHeader({
    tableName,
    columns,
    filterRows,
    addFilterRow,
    removeFilterRow,
    updateFilterRow,
    onSearchTermChange,
    onAction
}) {
    const [searchValue, setSearchValue] = useState('');
    const [openFilter, setOpenFilter] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const filterRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearchTermChange(searchValue.trim());
        }
    };

    // close filter panel
    useEffect(() => {
        const handleClick = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setOpenFilter(false);
            }
        };
        if (openFilter) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [openFilter]);

    const ALL_OPERATORS = [
        { value: 'contains', label: 'contains' },
        { value: 'notContains', label: 'does not contain' },
        { value: 'equals', label: 'equals' },
        { value: 'startsWith', label: 'starts with' },
        { value: 'endsWith', label: 'ends with' },
        { value: '>', label: '>' },
        { value: '<', label: '<' },
    ];

    const columnOptions = columns.map(c => ({ value: c.field, label: c.headerName }));

    return (
        <div className="w-full p-4 bg-white shadow-sm rounded-lg border border-gray-200">
            {openModal && (<ParentModal modalName={tableName} isOpen={openModal} onClose={() => setOpenModal(false)} type='create' onAction={onAction} />)}
            <div className="flex md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-800">{tableName}</h2>
                    {/* <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search..."
                        className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    /> */}
                </div>

                <div className="flex items-center gap-2">
                    {/* Add Button */}
                    {['Firm', 'Type', 'Make', 'Model', 'Part', 'Stores'].includes(tableName) && <button
                        onClick={() => { setOpenModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                    >
                        <AddSquare className="h-5 w-5" />
                    </button>}
                    <div className="relative">
                        {/* Add row button */}
                        {/* <button
                            onClick={() => setOpenFilter(!openFilter)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                            <FaFilter className="h-4 w-4" />

                            {filterRows.length > 0 && (
                                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    {filterRows.length}
                                </span>
                            )}
                        </button> */}

                        {/* Filter dropdown */}
                        {openFilter && (
                            <div ref={filterRef} className="absolute right-0 mt-2 w-full min-w-[400px] max-h-[600px] bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-y-auto">
                                <div className="p-4 space-y-4">
                                    {filterRows.map(row => (
                                        <div
                                            key={row.id}
                                            className="flex flex-col sm:flex-row sm:items-center gap-2"
                                        >
                                            <div className="flex-1">
                                                <Select
                                                    options={columnOptions}
                                                    placeholder="Column"
                                                    value={columnOptions.find(o => o.value === row.columnField)}
                                                    onChange={opt => updateFilterRow(row.id, 'columnField', opt?.value)}
                                                    isClearable
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <Select
                                                    options={ALL_OPERATORS}
                                                    placeholder="Operator"
                                                    value={ALL_OPERATORS.find(o => o.value === row.operator)}
                                                    onChange={opt => updateFilterRow(row.id, 'operator', opt?.value)}
                                                    isClearable
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                />
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Value"
                                                value={row.value}
                                                onChange={e => updateFilterRow(row.id, 'value', e.target.value)}
                                                className="flex-1 w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />

                                            <button
                                                onClick={() => removeFilterRow(row.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={addFilterRow}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    >
                                        <PlusCircle className="h-5 w-5" />
                                        <span>Add Filter</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
