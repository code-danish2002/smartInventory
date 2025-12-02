export const downloadPDF = (dataOrUrl, filename) => {
    if (typeof dataOrUrl === 'string') {
        // CASE 1: Argument is a URL, so we need to fetch it
        fetch(dataOrUrl)
            .then(response => {
                if (!response.ok) {
                    // Throw an error if the S3 URL returns a 4xx or 5xx status
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.blob();
            })
            // ✅ CORRECTION: Pass an anonymous function to .then() 
            // The blobData argument is automatically supplied by the promise chain
            .then(blobData => { 
                triggerDownload(blobData, filename);
            })
            .catch(error => {
                console.error('Download failed (from URL fetch):', error);
                // Optionally add a toast message for download failure
                // addToast({ response: { statusText: 'PDF Download Failed' }, type: 'error', status: '500' });
            });
    } else {
        // CASE 2: Argument is binary data (ArrayBuffer or Blob) from Axios
        try {
            // Create a Blob directly from the data (assuming it's ArrayBuffer or Blob)
            const blobData = new Blob([dataOrUrl], { type: 'application/pdf' });
            triggerDownload(blobData, filename);
        } catch (error) {
            console.error('Download failed (from data processing):', error);
            // addToast(...)
        }
    }
    // fetch(url)
    //     .then(response => {
    //         if (!response.ok) {
    //             // Throw an error if the S3 URL returns a 4xx or 5xx status
    //             throw new Error(`HTTP error! Status: ${response.status}`);
    //         }
    //         return response.blob(); // Get the raw binary data as a Blob
    //     })
    //     .then(blobData => {
    //         // Step 2: Use the Blob data to create a downloadable object URL
    //         const url = URL.createObjectURL(blobData);
            
    //         const a = document.createElement('a');
    //         a.href = url;
    //         a.download = filename;
    //         document.body.appendChild(a);
    //         a.click();
    //         document.body.removeChild(a);

    //         URL.revokeObjectURL(url); // Clean up the object URL
    //     })
    //     .catch(error => {
    //         console.error('Download failed:', error);
    //         // Optionally add a toast message for download failure
    //         // addToast({ response: { statusText: 'PDF Download Failed' }, type: 'error', status: '500' });
    //     });
};

const triggerDownload = (blob, name) => {
    const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
};