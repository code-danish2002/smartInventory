import { generateDevSigningParams } from './utils/signingParams';
// ... (where you define pdfBody, privateKeyPem, certificatePem, signerName, and position)

const privateKeyPem = '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'; // Your actual private key
const certificatePem = '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'; // Your actual certificate
const signerName = 'Inspection Authority'; // The name of the signer
const signaturePosition = {
    x: 50,    // Example x-coordinate
    y: 700,   // Example y-coordinate (from top of page)
    width: 200, // Example width
    height: 60  // Example height
};

const signing_params = generateDevSigningParams();
console.log("Generated Signing Parameters:", signing_params);

export const inspectionPdfData = {
    pdfBody: {
        po_number: '123456',
        firm_name: 'Example Firm',
        tender_number: '78910',
        date_of_issue: new Date().toISOString().slice(0, 10), // or whatever type currentDateTime is
        inspection_authority_user_name: 'Danish' | null,
        assignee_name: 'Danish' | null,
        po_line_items: [{
            line_item_name: 'PLI542',
            quantity: 2,
            quantity_offered: 1,
            quantity_inspected: 1,
            po_item_details: [{
                item_type: 'Type A',
                item_make: 'Make X',
                item_model: 'Model Y',
                item_part: 'Part Z',
                item_serial_number: ['SN1', 'SN2'], // Assuming this is an array of strings
            }]
        }]
    },
    ...signing_params, // Include the signing parameters
    position: {
        x: 50,            // X-coordinate of the signature field
        y: 700,            // Y-coordinate of the signature field
        width: 200,        // Width of the signature field
        height: 60,       // Height of the signature field
    }
}; // Your main inspection data

// Now, call your function with the combined data
//const pdfBytes = await createInspectionPdf(inspectionPdfData);

// You can then save or display pdfBytes
// e.g., const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//       const url = URL.createObjectURL(blob);
//       window.open(url, '_blank');