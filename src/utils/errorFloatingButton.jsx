const ErrorFloatingButton = ({ errorCount, onClick }) => {
  // Hide the button if there are no errors
  if (typeof errorCount !== 'number' || errorCount < 1) {
    return null;
  }

  // Helper text for accessibility and display
  const issuesText = `${errorCount} issue${errorCount !== 1 ? 's' : ''}`;
  
  return (
    <button
      onClick={onClick}
      // Fixed positioning at the bottom-left corner (z-50 ensures it's on top)
      className="fixed bottom-4 left-4 z-50
                 flex items-center space-x-2
                 bg-red-600 hover:bg-red-700
                 text-white font-semibold text-sm
                 py-2 pr-4 pl-3 rounded-full
                 shadow-xl transition-all duration-300 ease-in-out
                 focus:outline-none focus:ring-4 focus:ring-red-500/50"
      aria-live="polite"
      aria-label={`${errorCount} current issues. Click to view details.`}
    >
      {/* The stylized icon/badge part */}
      <div className="flex items-center justify-center w-5 h-5 bg-white text-red-600 rounded-full font-extrabold text-xs">
        {/* Using a simple exclamation mark as the icon in the white circle */}
        !
      </div>
      
      {/* The Text Count part */}
      <span>
        {issuesText}
      </span>
    </button>
  );
};

export default ErrorFloatingButton;