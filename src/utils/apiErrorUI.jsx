import { AlertCircle, RefreshCw } from "lucide-react";
const ErrorState = ({ message, onRetry, loading }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] w-full animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
                {/* Icon Circle */}
                <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                {/* Text Content */}
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Connection Error
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    {message || "We're having trouble loading this page right now. Please check your internet connection or try again."}
                </p>

                {/* Action Button */}
                <button
                    onClick={onRetry}
                    disabled={loading}
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Retrying...' : 'Retry Now'}
                </button>

                <p className="mt-6 text-xs text-gray-400">
                    If the problem persists, please contact support.
                </p>
            </div>
        </div>
    );
};

export default ErrorState;
