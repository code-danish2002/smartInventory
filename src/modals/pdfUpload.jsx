import { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { pdfjs } from 'react-pdf';
import Modal from 'react-modal';
import api from '../api/apiCall';
import { useToast } from '../context/toastProvider';
import { set } from 'react-hook-form';
import { CheckCircle2, FileSearch, FileText, UploadCloud, X } from 'lucide-react';

// Configure PDF.js worker for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const UploadPDF = ({ isOpen, po_id, po_number, po_line_item_id, onSubmit, onCancel = () => { } }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

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
    const currentPhase = po_line_item_id ? 'Inspection' : 'Inspection'; // Adjust phase as needed

    // 4) Send the JSON payload your API expects:
    //onSubmit({ pdf: base64, phase: 'Upload' });
    await api.post(`/api/pos/${po_id}/upload`, { pdf: base64, phase: currentPhase }, { params: { po_id, po_line_item_id } })
      .then((resp) => { onCancel(); addToast(resp); onSubmit(); })
      .catch((err) => { addToast(err); console.log(err) })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      overlayClassName="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
    >
      {/* DYNAMIC WIDTH: 
          - If no file: max-w-xl (Compact)
          - If file: max-w-5xl (Wide for preview)
      */}
      <div className={`bg-white w-full transition-all duration-300 ease-in-out rounded-2xl shadow-2xl overflow-hidden flex flex-col ${file ? 'max-w-5xl h-[90vh]' : 'max-w-xl'
        }`}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            {file ? 'Review Document' : 'Technical Documentation'}
          </h2>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className={`p-6 flex flex-col ${file ? 'flex-1 overflow-hidden' : ''}`}>
          {!file ? (
            /* COMPACT UPLOAD VIEW */
            <div
              {...getRootProps()}
              className={`cursor-pointer border-2 border-dashed rounded-xl p-10 text-center transition-all
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-400'}`}
            >
              <input {...getInputProps()} />
              <div className="p-3 bg-white rounded-full shadow-sm w-fit mx-auto mb-4">
                <UploadCloud className="text-blue-500" size={28} />
              </div>
              <p className="text-gray-700 font-medium text-base">Drag & Drop PDF here, or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">PO Number: {po_number}</p>
            </div>
          ) : (
            /* EXPANDED PREVIEW VIEW */
            <div className="flex-1 flex flex-col h-full space-y-4 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">PDF</div>
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2 max-w-[300px]"><span className="truncate max-w-[250px]">{file.name.split('.').slice(0, -1).join('.')} </span><span className="text-xs text-gray-400">({(file.size / 1024).toFixed(2)} KB)</span></span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-tighter"
                >
                  remove
                </button>
              </div>

              {/* The "Grown" Previewer */}
              <div className="flex-1 rounded-lg border border-gray-200 bg-slate-100 overflow-hidden shadow-inner">
                <object data={previewUrl} type="application/pdf" className="w-full h-full border-none">
                  <div className="flex items-center justify-center h-full p-6 text-center text-gray-500 text-sm">
                    PDF preview is not supported. <a href={previewUrl} target="_blank" className="text-blue-600 ml-1 underline">Download file</a>
                  </div>
                </object>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className={`px-6 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-sm flex items-center gap-2
              ${!file || loading ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-100'}`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {loading ? 'Uploading...' : 'Upload Now'}
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
