import { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { pdfjs } from 'react-pdf';
import Modal from 'react-modal';
import api from '../api/apiCall';
import { useToast } from '../context/toastProvider';

// Configure PDF.js worker for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const UploadPDF = ({ isOpen, po_id, po_line_item_id, onSubmit, onCancel = () => { } }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const addToast = useToast();

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFile = acceptedFiles[0];
    if (pdfFile) setFile(pdfFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleRemove = () => setFile(null);
  const handleSubmit = async () => {
    if (!file) return;

    // 1) Read the file as a data URL:
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    // 2) Strip the "data:application/pdf;base64," prefix:
    const base64 = dataUrl.split(',')[1];

    // 3) (Optional) Log the size in KB
    console.log(`Uploading PDF: ${(file.size / 1024).toFixed(1)} KB`, 'on Po ID:', po_id, 'on Po Line Item ID:', po_line_item_id);
    const currentPhase = po_line_item_id ? 'Inspection' : 'Upload';

    // 4) Send the JSON payload your API expects:
    //onSubmit({ pdf: base64, phase: 'Upload' });
    await api.post(`/api/pos/${po_id}/upload`, { pdf: base64, phase: currentPhase }, { params: { po_id, po_line_item_id } })
      .then((resp) => { onCancel(); addToast(resp); onSubmit(); })
      .catch((err) => { addToast(err); console.log(err) });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      ariaHideApp={false}
      className="fixed inset-0 flex items-center justify-center p-4 max-h-full overflow-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
      contentLabel="Add Item Details"
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
    >
      <div className="w-full max-w-screen-lg mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 overflow-hidden max-h-[90vh]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-semibold">Upload PDF</h2>
        </div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded p-6 text-center transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
        >
          <input {...getInputProps()} />
          {file ? (
            <p className="text-gray-700">{file.name}</p>
          ) : (
            <div>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-gray-600">Drag & drop a PDF here, or click to select</p>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="mt-2 w-full h-[40vh] sm:h-[60vh] overflow-hidden rounded border">
            <object
              data={previewUrl}
              type="application/pdf"
              className="w-full h-full"
            >
              <p className="text-red-500">Preview not available.</p>
            </object>
            <button
              type="button"
              className="mt-2 text-sm text-red-500 hover:underline"
              onClick={handleRemove}
            >
              Remove PDF
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row justify-end sm:space-x-3 space-y-2 sm:space-y-0">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-300 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!file}
          >
            Submit
          </button>
        </div>

      </div>
    </Modal>
  );
};

UploadPDF.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export default UploadPDF;
