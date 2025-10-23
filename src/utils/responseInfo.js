export function extractResponseInfo(response, defaultFilename = null) {
  const extractFilenameFromCD = (contentDisposition = '') => {
    if (!contentDisposition) return null;
    // filename* (RFC5987)
    const fnStarMatch = contentDisposition.match(/filename\*=(?:UTF-8'')?([^;'\n]+)/i);
    if (fnStarMatch && fnStarMatch[1]) {
      const raw = fnStarMatch[1].replace(/(^["']|["']$)/g, '').trim();
      try { return decodeURIComponent(raw); } catch (e) { return raw; }
    }
    // simple filename=
    const fnMatch = contentDisposition.match(/filename=(?:["']?)([^;"'\n]+)/i);
    if (fnMatch && fnMatch[1]) return fnMatch[1].replace(/(^["']|["']$)/g, '').trim();
    return null;
  };

  if (!response) return { filename: defaultFilename, message: null };

  // 1) If Fetch Response.headers (Headers object)
  if (response.headers && typeof response.headers.get === 'function') {
    const cd = response.headers.get('content-disposition') || response.headers.get('Content-Disposition') || null;
    const msg = response.headers.get('x-success-message') || response.headers.get('X-Success-Message') || null;
    return { filename: extractFilenameFromCD(cd) || defaultFilename, message: msg || null };
  }

  // 2) Axios-style: try to get a plain headers object
  let headersObj = response.headers || {};
  if (headersObj && typeof headersObj.toJSON === 'function') {
    try { headersObj = headersObj.toJSON(); } catch (e) { /* ignore */ }
  }

  // normalize keys to lowercase
  const normalized = {};
  Object.keys(headersObj || {}).forEach(k => normalized[String(k).toLowerCase()] = headersObj[k]);

  let contentDisposition = normalized['content-disposition'] || normalized['content-disposition'.toLowerCase()] || null;
  let message = normalized['x-success-message'] || normalized['x-success'] || null;

  // 3) XHR fallback: sometimes response.request has getResponseHeader available
  try {
    if ((!contentDisposition || !message) && response.request) {
      const req = response.request;
      if (typeof req.getResponseHeader === 'function') {
        if (!contentDisposition) contentDisposition = req.getResponseHeader('Content-Disposition') || req.getResponseHeader('content-disposition') || contentDisposition;
        if (!message) message = req.getResponseHeader('X-Success-Message') || req.getResponseHeader('x-success-message') || req.getResponseHeader('x-success') || message;
      }
      // some XHRs allow reading raw headers:
      if ((!contentDisposition || !message) && typeof req.getAllResponseHeaders === 'function') {
        const all = req.getAllResponseHeaders();
        if (all) {
          // parse approximate values from the raw header string if present
          const cdMatch = all.match(/content-disposition:\s*([^\n\r]+)/i);
          if (cdMatch && cdMatch[1] && !contentDisposition) contentDisposition = cdMatch[1].trim();
          const msgMatch = all.match(/x-success-message:\s*([^\n\r]+)/i);
          if (msgMatch && msgMatch[1] && !message) message = msgMatch[1].trim();
        }
      }
    }
  } catch (e) {
    // ignore fallback errors
    console.warn('Header fallback failed', e);
  }

  const filename = extractFilenameFromCD(contentDisposition) || defaultFilename;
  return { filename, message: message || null };
}