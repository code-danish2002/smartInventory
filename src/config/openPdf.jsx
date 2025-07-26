/**
 * Take a Base64 PDF (or a full data: URI), create a Blob in‑memory,
 * and open it via a new blob: URL that the browser will actually allow.
 *
 * @param {string} dataStr — raw Base64, or data:URI, from your DB.
 */
function openPdf(dataStr) {
  // 1) Strip off any "data:application/pdf;base64," prefix:
  const b64 = dataStr.replace(/^data:application\/pdf;base64,?/, '').trim();

  // 2) Decode to a Uint8Array:
  const binaryString = atob(b64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 3) Create a Blob, then a blob: URL:
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);

  // 4) Open in new tab (with popup‑blocker fallback):
  const win = window.open(blobUrl, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    a.click();
  }

  // Optional: revoke the object URL after a while to free memory
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

export default openPdf;