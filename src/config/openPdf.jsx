/**
 * Open a PDF from either a Base64 string or a direct URL.
 *
 * @param {string} dataStr — Base64 PDF string or direct PDF URL
 */
async function openPdf(dataStr) {
  if (dataStr.startsWith("http")) {
    // Case 1: It's a direct URL (like your presigned S3 link)
    try {
      const res = await fetch(dataStr);
      if (!res.ok) throw new Error("Failed to fetch PDF from URL");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const win = window.open(blobUrl, "_blank");
      if (!win) {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.target = "_blank";
        a.click();
      }

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      console.error("Error opening PDF from URL:", err);
    }
  } else {
    // Case 2: Base64 string (your original logic)
    const b64 = dataStr.replace(/^data:application\/pdf;base64,?/, "").trim();
    const binaryString = atob(b64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    const win = window.open(blobUrl, "_blank");
    if (!win) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.target = "_blank";
      a.click();
    }

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  }
}

export default openPdf;
