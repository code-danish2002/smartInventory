import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

const MAX_VISIBLE = 50;

/**
 * FloatingSelect – searchable dropdown with a floating label.
 * The menu is portalled to document.body to escape parent overflow/z-index stacking.
 * onChange is called as: { target: { value } }
 */
const FloatingSelect = ({ label, id, options = [], value, onChange, disabled, ...props }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [menuStyle, setMenuStyle] = useState({});
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedLabel = useMemo(
    () => options.find(o => String(o.value) === String(value))?.label ?? '',
    [options, value]
  );

  // Position the portalled menu under the trigger
  const updateMenuPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !document.getElementById(`fs-portal-${id}`)?.contains(e.target)
      ) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [id]);

  // Reposition when open or on scroll/resize
  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [open, updateMenuPosition]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;
    return result.slice(0, MAX_VISIBLE);
  }, [options, search]);

  const handleSelect = useCallback((opt) => {
    onChange?.({ target: { value: opt.value } });
    setOpen(false);
    setSearch('');
  }, [onChange]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    updateMenuPosition();
    setOpen(prev => !prev);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [disabled, updateMenuPosition]);

  const hasValue = Boolean(value);

  const menu = open && createPortal(
    <div
      id={`fs-portal-${id}`}
      style={menuStyle}
      className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden"
    >
      {/* Search */}
      <div className="p-1.5 border-b border-gray-100 dark:border-slate-800">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-full text-xs px-2 py-1 border border-gray-200 dark:border-slate-800 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
        />
      </div>
      {/* Options */}
      <ul className="max-h-40 overflow-y-auto">
        {filtered.length === 0 ? (
          <li className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 text-center">No options</li>
        ) : (
          filtered.map(opt => (
            <li
              key={opt.value}
              onMouseDown={() => handleSelect(opt)}
              className={`px-3 py-1.5 text-xs cursor-pointer transition-colors
                ${String(opt.value) === String(value)
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400'}`}
            >
              {opt.label}
            </li>
          ))
        )}
      </ul>
      {options.length > MAX_VISIBLE && !search && (
        <div className="px-3 py-1 text-[10px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-slate-800 text-center">
          Type to narrow {options.length} options
        </div>
      )}
    </div>,
    document.body
  );

  return (
    <div ref={containerRef} className="relative group w-full" {...props}>
      {/* Display box */}
      <div
        onClick={handleOpen}
        className={`flex items-center px-3 py-1.5 w-full text-xs rounded-lg border bg-transparent cursor-pointer transition-colors
          ${open ? 'border-blue-600 ring-1 ring-blue-600/30 dark:border-blue-500 dark:ring-blue-500/30' : 'border-gray-300 dark:border-slate-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-800' : 'hover:border-gray-400 dark:hover:border-slate-600'}`}
        style={{ minHeight: '36px' }}
      >
        <span className={`flex-1 truncate ${hasValue ? 'text-gray-900 dark:text-gray-100' : 'text-transparent'}`}>
          {selectedLabel || '\u00a0'}
        </span>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Floating label */}
      <label
        htmlFor={id}
        onClick={handleOpen}
        className={`absolute text-gray-500 dark:text-gray-400 duration-200 transform bg-white dark:bg-slate-900 px-1 pointer-events-auto cursor-pointer z-10 origin-[0] transition-all text-xs
          ${(hasValue || open)
            ? 'top-0 -translate-y-1/2 scale-75 text-blue-600 dark:text-blue-400 left-2.5'
            : 'top-1/2 -translate-y-1/2 scale-100 left-3'
          }`}
      >
        {label}
      </label>

      {menu}
    </div>
  );
};

export default FloatingSelect;