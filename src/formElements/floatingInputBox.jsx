const FloatingInput = ({ label, id, type = 'text', value, onChange, ...props }) => {
  return (
    <div className="relative group w-full">
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        className="block px-3 py-1.5 w-full text-xs text-gray-900 dark:text-gray-100 bg-transparent dark:bg-slate-900 rounded-lg border border-gray-300 dark:border-slate-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-500 peer transition-colors"
        style={{ minHeight: '36px' }}
        placeholder=" "
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute text-xs text-gray-500 dark:text-gray-400 duration-200 transform -translate-y-1/2 scale-100 top-1/2 z-10 origin-[0] bg-white dark:bg-slate-900 px-1 left-2.5 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-0 peer-focus:scale-75 peer-focus:-translate-y-1/2 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:-translate-y-1/2 pointer-events-none"
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingInput;