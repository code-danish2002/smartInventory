import React, { useMemo } from "react";
export default function ErrorModal({ showErrorModal, setShowErrorModal, submitError = [] }) {
  // remove exact duplicates and keep order
  const uniqueErrors = useMemo(() => Array.from(new Set(submitError)), [submitError]);

  if (!showErrorModal) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center py-10 px-4
                 bg-gray-700/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      {/* Centering container — makes the inner modal size to content but never exceed viewport */}
      <div
        className="inline-block align-top bg-white rounded-2xl shadow-2xl border
                   overflow-hidden w-auto max-w-[95vw] md:max-w-[80vw] lg:max-w-[70vw]
                   min-w-[320px]"
        style={{ boxShadow: "0 12px 30px rgba(0,0,0,0.18)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            {/* icon */}
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.518 11.59A1.75 1.75 0 0 1 17.52 17H2.48a1.75 1.75 0 0 1-1.742-2.311L8.257 3.1zM10 7a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75s.75-.336.75-.75v-3.5A.75.75 0 0 0 10 7zm0 7a.875.875 0 1 0 0 1.75A.875.875 0 0 0 10 14z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-red-600">Submission Errors</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {uniqueErrors.length} error{uniqueErrors.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setShowErrorModal(false)}
            aria-label="Close modal"
            className="p-2 rounded-md hover:bg-gray-100 text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body: allow vertical + horizontal scrolling if needed, wrap long words */}
        <div className="px-6 py-4">
          <div
            className="max-h-[70vh] overflow-auto rounded-lg p-3 bg-gray-50 border
                       text-gray-700 space-y-3 shadow-inner"
            /* important wrapping rules:
               - break-words / break-all to protect against long unbroken strings
               - whitespace-normal to allow wrapping of long text
            */
          >
            <ul className="space-y-4">
              {uniqueErrors.length === 0 ? (
                <li className="text-sm text-gray-600">No errors to show.</li>
              ) : (
                uniqueErrors.map((error, index) => (
                  <li key={index} className="text-sm">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-medium">
                        !
                      </span>

                      {/* Important: use break-words and whitespace-normal so huge words wrap
                          If you want to allow horizontal scrolling instead, replace break-words with 'whitespace-pre' and add overflow-x-auto. */}
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{/* brief title or same text */}</div>
                        <p className="mt-1 text-xs text-gray-500 break-words whitespace-normal">
                          {error}
                        </p>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={() => setShowErrorModal(false)}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}