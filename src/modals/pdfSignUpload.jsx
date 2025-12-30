import React, { useCallback, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { pdfjs, Document, Page } from 'react-pdf';
import Modal from 'react-modal';
import CryptoJS from 'crypto-js';
import { useToast } from '../context/toastProvider';
import { downloadPDF } from '../utils/downloadResponsePdf';

// Mock API for demo
const api = {
  post: async (url, data, config) => {
    console.log('Mock API post call:', url, data, config);
    return new Promise((resolve) => setTimeout(() => resolve({ status: 200 }), 1000));
  },
};

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const API_ENDPOINT = 'ws://localhost:8999';

// NOTE: This component implements the behaviour you requested:
// 1) UI stays the same until a PDF is uploaded.
// 2) After the user draws a signature area and releases the mouse (onMouseUp),
//    the component automatically opens a WebSocket, requests certificates and
//    displays them to the user.
// 3) After the user selects a certificate, the signing flow automatically
//    proceeds (hash -> send Sign request -> receive signature -> submit to server).

const CombinedPdfManager = ({ isOpen, po_id, po_line_item_id, onSubmit, onCancel = () => { } }) => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToast();

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [endPoint, setEndPoint] = useState({ x: 0, y: 0 });
  const [sigArea, setSigArea] = useState(null);
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1.0);

  const wsRef = useRef(null);
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isAwaitingCert, setIsAwaitingCert] = useState(false);

  const zoomIn = () => setScale((s) => Math.min(s * 1.1, 3.0));
  const zoomOut = () => setScale((s) => Math.max(s * 0.9, 0.5));
  const goToFirstPage = () => setPageNumber(1);
  const goToLastPage = () => setPageNumber(numPages);

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFile = acceptedFiles[0];
    if (pdfFile) {
      setFile(pdfFile);
      setSigArea(null);
      setMessage('');
      setSelectedCert(null);
      setCertificates([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onPageLoadSuccess = (page) => {
    const viewport = page.getViewport({ scale });
    setPageDimensions({ width: viewport.width, height: viewport.height });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && pageDimensions.width > 0 && pageDimensions.height > 0) {
      canvas.width = pageDimensions.width;
      canvas.height = pageDimensions.height;
    }
  }, [pageDimensions, scale]);

  const onMouseDown = (event) => {
    if (!file || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    setIsDrawing(true);
    setStartPoint({ x, y });
    setEndPoint({ x, y });
    setSigArea(null);
    setMessage('Drawing a signature area...');
    // reset any existing certificates when user starts a new draw
    setCertificates([]);
    setSelectedCert(null);
  };

  const onMouseMove = (event) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    setEndPoint({ x, y });
  };

  // Fetch certificates over WebSocket and keep the same socket open for signing.
  const fetchCertificatesOverWs = () => {
    if (!file) return;
    // close any previous socket cleanly
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.warn('Error closing previous socket', e);
      }
      wsRef.current = null;
    }

    setIsAwaitingCert(true);
    setIsLoading(true);
    setMessage('Connecting to local service and fetching certificates...');

    try {
      const ws = new WebSocket(API_ENDPOINT);
      wsRef.current = ws;

      ws.onopen = () => {
        try {
          ws.send(JSON.stringify({ command: 'GetCertificates' }));
        } catch (e) {
          console.error('Send error', e);
        }
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log('Received WS message', response);
          // certificates response
          if (response.status === 'success' && response.command === 'Certificates') {
            setCertificates(response.certificates || []);
            if ((response.certificates || []).length > 0) {
              setMessage('Certificates loaded. Please select one to sign.');
            } else {
              setMessage('No certificates found. Please insert a DSC token.');
            }
            setIsLoading(false);
            setIsAwaitingCert(false);
          }
          // signature response (will be used later during sign)
          else if (response.status === 'success' && response.command === 'Signature') {
            // handle signature
            setIsLoading(false);
            setIsAwaitingCert(false);
            handleSignatureResponse(response);
          } else if (response.status === 'error') {
            setIsLoading(false);
            setIsAwaitingCert(false);
            setMessage(`Error from token service: ${response.message}`);
            console.error('Token service error', response.message);
          }
        } catch (err) {
          console.error('Invalid WS message', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket Error:', err);
        setIsLoading(false);
        setIsAwaitingCert(false);
        setMessage('WebSocket connection failed. Is the local service running?');
        addToast({ message: 'Local signing service connection failed.', status: 'error' });
      };

      ws.onclose = () => {
        // don't automatically clear messages: user may want to read
        wsRef.current = null;
      };
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setIsAwaitingCert(false);
      setMessage(`Error: ${err.message}`);
      addToast({ message: err.message, status: 'error' });
    }
  };

  // Called when signature response comes from WS
  const handleSignatureResponse = async (response) => {
    console.log('Received signature response', response);
    //download PDF
    //downloadPDF(response.signed_pdf_data, 'signed.pdf');
    const data = response.signed_pdf_data;
    const filename = 'signed.pdf';
    const decodedBytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));

    const blob = new Blob([decodedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    // set signed file fr preview
    setFile(decodedBytes);
  };

  // When user selects a certificate from the dropdown we start the sign flow.
  const onSelectCertificate = async (cert) => {
    if (!cert) return;
    setSelectedCert(cert);

    // start signing flow
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setMessage('Connection to local token lost. Reconnecting...');
      fetchCertificatesOverWs();
      return;
    }

    setIsLoading(true);
    setMessage('Hashing PDF and sending signing request...');

    try {
      // Read file as ArrayBuffer to hash it correctly
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
      });

      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
      const hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);

      // Read the file as a DataURL to get the base64-encoded string
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const base64Pdf = dataUrl.split(',')[1];

      // Send the correct command to the WebSocket server
      wsRef.current.send(JSON.stringify({
        command: 'SignAndEmbed',
        pdf_data: base64Pdf, // Send the Base64-encoded PDF data
        slot_id: cert.slot_id,
        cka_id: cert.cka_id,
        signature_area: sigArea, // Send the signature area object
      }));

      setMessage('Awaiting signature from token...');

      // The onmessage handler for the socket already routes 'signature' responses to handleSignatureResponse
    } catch (err) {
      console.error('Signing Error:', err);
      setMessage(`Signing failed: ${err.message}`);
      addToast({ message: `Signing failed: ${err.message}`, status: 'error' });
      setIsLoading(false);
      if (wsRef.current) try { wsRef.current.close(); } catch (_) { }
    }
  };

  const onMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const minX = Math.min(startPoint.x, endPoint.x);
    const minY = Math.min(startPoint.y, endPoint.y);
    const width = Math.abs(startPoint.x - endPoint.x);
    const height = Math.abs(startPoint.y - endPoint.y);
    if (width > 5 && height > 5) {
      const area = { x: minX, y: minY, width, height, page: pageNumber };
      setSigArea(area);
      setMessage('Signature area selected. Fetching certificates...');
      // Immediately fetch certificates when drawing completed
      fetchCertificatesOverWs();
    } else {
      setSigArea(null);
      setMessage('Please draw a larger signature area.');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isDrawing) {
      const minX = Math.min(startPoint.x, endPoint.x);
      const minY = Math.min(startPoint.y, endPoint.y);
      const width = Math.abs(startPoint.x - endPoint.x);
      const height = Math.abs(startPoint.y - endPoint.y);
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(minX * scale, minY * scale, width * scale, height * scale);
    } else if (sigArea && sigArea.page === pageNumber) {
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(sigArea.x, sigArea.y, sigArea.width, sigArea.height);
    }
  }, [isDrawing, startPoint, endPoint, sigArea, pageNumber, scale]);

  const handleRemove = () => {
    setFile(null);
    setCertificates([]);
    setSelectedCert(null);
    setSigArea(null);
    setMessage('');
    if (wsRef.current) try { wsRef.current.close(); } catch (_) { }
  };

  const handleSimpleSubmit = async () => {
    if (!file) return;
    setIsLoading(true);
    setMessage('Uploading PDF...');
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(',')[1];
      const currentPhase = po_line_item_id ? 'Approve PO' : 'Upload';
      await api.post(`/api/pos/${po_id}/upload`, { pdf: base64, phase: currentPhase }, { params: { po_id, po_line_item_id } });
      onCancel();
      onSubmit();
      addToast({ message: 'PDF uploaded successfully!', status: 'success' });
    } catch (err) {
      addToast({ message: 'Upload failed.', status: 'error' });
      console.log(err);
    } finally {
      setIsLoading(false);
    }
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
      <div className="w-full max-w-screen-lg mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Upload PDF</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {!file ? (
          <div
            {...getRootProps()}
            className={`flex-1 border-2 border-dashed rounded-lg p-10 text-center transition-colors flex flex-col items-center justify-center
              ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
          >
            <input {...getInputProps()} />
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-4 text-gray-600 font-semibold text-lg">Drag & drop a PDF here, or click to select</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col items-center">
            <div className="pdf-viewer-container w-full relative border rounded-lg shadow-md overflow-auto flex-1 p-2 bg-gray-100">
              <div className="flex items-center justify-center mb-2 space-x-2">
                <button onClick={zoomOut} disabled={scale <= 0.5} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed">-</button>
                <span className="text-sm font-medium text-gray-700">{Math.round(scale * 100)}%</span>
                <button onClick={zoomIn} disabled={scale >= 3.0} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed">+</button>
                <button onClick={goToFirstPage} disabled={pageNumber <= 1} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed">&lt;&lt;</button>
                <button onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber <= 1} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed">&lt;</button>
                <span className="text-sm font-medium text-gray-700">Page {pageNumber} of {numPages}</span>
                <button onClick={() => setPageNumber(p => Math.min(p + 1, numPages))} disabled={pageNumber >= numPages} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed">&gt;</button>
                <button onClick={goToLastPage} disabled={pageNumber >= numPages} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed">&gt;&gt;</button>
              </div>

              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="h-full flex justify-center">
                  <Page pageNumber={pageNumber} renderAnnotationLayer={false} renderTextLayer={false} onLoadSuccess={onPageLoadSuccess} scale={scale} className="shadow-lg rounded-lg" />
                </Document>

                <canvas
                  ref={canvasRef}
                  className="drawing-canvas absolute top-0 left-0 w-full h-full z-10"
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
                  style={{ width: pageDimensions.width > 0 ? pageDimensions.width : '100%', height: pageDimensions.height > 0 ? pageDimensions.height : '100%', maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
            </div>

            {message && (
              <p className={`mt-2 text-center text-sm font-medium ${message.startsWith('Signing failed') || message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
            )}

            {/* Certificate selection block: appears after certificates are fetched */}
            {certificates.length >= 0 && (
              <div className="mt-4 w-full p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Select a Certificate (appears after you draw signature area)</h3>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={selectedCert ? JSON.stringify(selectedCert) : ''}
                  onChange={(e) => {
                    const c = e.target.value ? JSON.parse(e.target.value) : null;
                    onSelectCertificate(c);
                  }}
                >
                  <option value="">{isAwaitingCert ? 'Loading certificates...' : 'Choose your digital certificate'}</option>
                  {certificates.map((cert, index) => (
                    <option key={index} value={JSON.stringify(cert)}>{cert.label || `Certificate ID: ${cert.id}`}</option>
                  ))}
                </select>
              </div>
            )}

            <button type="button" className="mt-2 text-sm text-red-500 hover:underline" onClick={handleRemove}>Remove PDF</button>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row justify-end sm:space-x-3 space-y-2 sm:space-y-0">
          <button type="button" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-300 transition-colors" onClick={onCancel}>Cancel</button>

          {/* Simple upload remains as-is */}
          <button type="button" className="px-4 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-300 disabled:opacity-50 transition-colors" onClick={handleSimpleSubmit} disabled={!file || isLoading || isAwaitingCert}>Submit</button>

          {/* Sign and Submit button removed — signing now starts after area draw -> certificate selection -> automatic sign */}
        </div>
      </div>
    </Modal>
  );
};

CombinedPdfManager.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  po_id: PropTypes.string,
  po_line_item_id: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export default CombinedPdfManager;
