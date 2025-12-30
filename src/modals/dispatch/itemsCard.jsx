import React, { useState } from 'react';
import { Clipboard, Package, List, Send, ChevronDown, ChevronUp } from 'lucide-react';

const ItemDispatchCard = ({
    itemDetails,
}) => {
    // Check if the item is part of a cluster (from the LineItemCard logic)
    const isClustered = itemDetails.isClustered && itemDetails.totalClusterCount > 1;
    const serialsCount = itemDetails.totalClusterCount || 1;
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Determine which item details array to use for rendering the bottom section
    const displayDetails = isClustered ? itemDetails.clusterDetails : [itemDetails];

    const itemDetailsInfo = [
        { label: "Part Code", value: itemDetails.item_part_code, icon: <Clipboard className="w-4 h-4 text-blue-500" /> },
        { label: "Make", value: itemDetails.item_make_name, icon: <Package className="w-4 h-4 text-green-500" /> },
        { label: "Model", value: itemDetails.item_model_name, icon: <List className="w-4 h-4 text-purple-500" /> },
        { label: "Project No.", value: itemDetails.project_number, icon: <Send className="w-4 h-4 text-orange-500" /> },
    ];

    const toggleExpansion = () => {
        if (isClustered) {
            setIsExpanded(prev => !prev);
        }
    };

    return (
        <div 
            className={`bg-white px-4 py-2 rounded-xl shadow-lg border mb-4 transition-all duration-300 ${isClustered ? 'border-blue-200 hover:shadow-xl' : 'border-gray-100'}`}
        >
            {/* Header / Collapse Trigger */}
            <div 
                className={`flex justify-between items-center pb-3 border-b border-gray-200 ${isClustered ? 'cursor-pointer' : ''}`}
                onClick={toggleExpansion}
            >
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    {itemDetails.item_type_name} 
                    {/* {isClustered && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                            {serialsCount} Units Clustered
                        </span>
                    )} */}
                </h3>
                
                <div className="flex space-x-3 text-sm font-semibold items-center">
                    {/* Serial Number / Count Display */}
                    <span className={`px-3 py-1 rounded-full ${isClustered ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                        {isClustered ? `${serialsCount} Serial Nos.` : itemDetails.item_serial_number}
                    </span>
                    
                    {/* Expansion Icon */}
                    {isClustered && (isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />)}
                </div>
            </div>

            {/* Common Item Details (Always Visible) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-b border-gray-100">
                {itemDetailsInfo.map(detail => (
                    <div key={detail.label} className="flex items-center space-x-2 text-sm text-gray-600">
                        {detail.icon}
                        <div className='truncate'>
                            <span className="font-medium">{detail.label}:</span>
                            <span className="ml-1">{detail.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Clustered Serial Numbers (Expandable) */}
            {isClustered && (
                <div className={`transition-max-height duration-500 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                    <div className="pt-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Individual Serial Numbers:</h4>
                        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            {itemDetails.clusterDetails.map((detail, index) => (
                                <span 
                                    key={detail.po_item_details_id}
                                    className="text-xs font-mono px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md shadow-sm"
                                >
                                    {detail.item_serial_number}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemDispatchCard;