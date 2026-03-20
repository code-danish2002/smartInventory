import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { FileText, User, Calendar, ChevronDown, ChevronUp, MapPin, Phone, Mail, Info, Hash } from 'lucide-react';
import { commonSelectProps } from '../../utils/CommonCSS.jsx';

const POSelectionCard = ({
    poNumberValue,
    inspectorValue,
    onPoChange,
    onInspectorChange,
    fetchOptions,
    poData,
    isDisabled = false,
    task
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const poDateFormatted = poData?.po_date
        ? new Date(poData.po_date).toLocaleDateString(undefined, { dateStyle: 'medium' })
        : 'N/A';

    return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md overflow-hidden animate-in fade-in slide-in-from-top-4">
            {/* Top Row: Selectors + Summary Info + Toggle */}
            <div className={`p-4 md:p-6 flex flex-wrap items-end gap-6 transition-colors ${isExpanded ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>

                {/* PO Select */}
                <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Hash size={12} className="text-indigo-500" />
                        PO Number
                    </label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        loadOptions={(val) => fetchOptions(val, 'po_number')}
                        value={poNumberValue ? { value: poNumberValue, label: String(poNumberValue) } : null}
                        onChange={onPoChange}
                        placeholder="Search..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isDisabled={isDisabled}
                        {...commonSelectProps}
                    />
                </div>

                {/* Inspector Select */}
                <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={12} className="text-emerald-500" />
                        Inspector
                    </label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        loadOptions={(val) => fetchOptions(val, 'inspector_id')}
                        value={inspectorValue?.value ? inspectorValue : null}
                        onChange={onInspectorChange}
                        placeholder="Search..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        {...commonSelectProps}
                    />
                </div>

                {/* Summary Info (Visible only when PO is selected) */}
                {poData && (
                    <div className="flex items-end gap-6 h-full pb-1 animate-in fade-in slide-in-from-right-2 duration-500">
                        {/* PO Date */}
                        <div className="flex flex-col">
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase leading-tight">PO Date</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                {poDateFormatted}
                            </span>
                        </div>

                        {/* Firm Name */}
                        <div className="flex flex-col max-w-[200px]">
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase leading-tight">Firm Name</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate" title={poData.firm_name}>
                                {poData.firm_name || 'N/A'}
                            </span>
                        </div>

                        {/* Expand Toggle Button */}
                        <button
                            onClick={toggleExpand}
                            className={`p-2 rounded-xl transition-all shadow-sm ${isExpanded ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500'}`}
                            title={isExpanded ? 'Show less' : 'Show more details'}
                        >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    </div>
                )}
            </div>

            {/* Expanded Content Section */}
            {isExpanded && poData && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 dark:bg-slate-900/50 animate-in slide-in-from-top-2 duration-300">
                    {/* PO Infomation */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <FileText size={14} />
                            PO Information
                        </h4>
                        <div className="space-y-3">
                            <DetailItem label="Tender No" value={poData.tender_no || poData.tender_number} icon={<Hash size={12} />} />
                            <DetailItem label="Issue Date" value={poData.po_date_of_issue || poData.po_date} icon={<Calendar size={12} />} />
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Description</span>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-indigo-200 dark:border-indigo-900 pl-3">
                                    {poData.po_description || 'No description provided.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Firm Details */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Info size={14} />
                            Vendor Details
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            <DetailItem label="Address" value={poData.firm_address} icon={<MapPin size={12} />} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <DetailItem label="Contact Person" value={poData.contact_person_name || poData.contact_person} icon={<User size={12} />} />
                                <DetailItem label="Phone" value={poData.contact_number} icon={<Phone size={12} />} />
                            </div>
                            <DetailItem label="Email" value={poData.email_address || poData.email} icon={<Mail size={12} />} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailItem = ({ label, value, icon }) => (
    <div className="flex items-start gap-2 group">
        <div className="mt-0.5 p-1 bg-white dark:bg-slate-800 rounded shadow-sm text-slate-400 group-hover:text-indigo-500 transition-colors">
            {icon}
        </div>
        <div className="flex flex-col">
            <span className="text-[8px] text-slate-400 font-bold uppercase leading-none">{label}</span>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 break-all">{value || 'N/A'}</span>
        </div>
    </div>
);

export default POSelectionCard;