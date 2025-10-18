import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import * as forge from 'node-forge';
import logo from "../assets/railtel_1.svg";

export const GenerateInspectionPDF = async (data, signingParams = {}) => {
    const {
        po_number,
        firm_name,
        tender_number,
        po_date_of_issue,
        inspected_by,
        po_created_by,
        po_line_items
    } = data;

    console.log('Generating PDF with data:', data, signingParams);
    const doc = new jsPDF();

    // Original Layout Configuration
    const margins = { top: 5, right: 5, bottom: 5, left: 5 };
    const contentGap = 5;
    const titleSpacing = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Border Handling

    const drawBorder = () => {
        doc.setLineWidth(0.5);
        doc.rect(
            margins.left,
            margins.top,
            pageWidth - margins.left - margins.right,
            pageHeight - margins.top - margins.bottom
        );
    };

    const originalAddPage = doc.addPage.bind(doc);
    doc.addPage = function (...args) {
        originalAddPage(...args);
        drawBorder();
    };

    drawBorder();

    // Content Generation
    let currentY = margins.top + contentGap + titleSpacing;

    // Title
    const logoSize = 20;      // display size in PDF pts
    const gap = 25;       // space between logo & text
    const headerY = margins.top + titleSpacing;  // Y position for both
    //add logo to title
    const targetDisplaySize = 20;            // how big it appears in mm/pt
    const internalScale = 4;             // 4× resolution => super-sharp
    const canvasPixelSize = targetDisplaySize * internalScale;

    // 1) create an offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = canvasPixelSize;
    canvas.height = canvasPixelSize;
    const ctx = canvas.getContext('2d');

    // 2) load the SVG into an <img>
    await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // draw it scaled up (so our internal resolution is high)
            ctx.drawImage(img, 0, 0, canvasPixelSize, canvasPixelSize);
            resolve();
        };
        img.onerror = reject;
        img.src = logo;
    });

    // 3) extract a high-res PNG data-URI
    const pngData = canvas.toDataURL('image/png');

    // --- ADD THE LOGO TO THE PDF AT THE SMALLER DISPLAY SIZE ---
    const xLogo = margins.left + 5;
    doc.addImage(pngData, 'PNG', xLogo, headerY, logoSize, logoSize);

//     doc.addImage(pngData, 'PNG',
//   15,     // X position
//   20,     // Y position
//   30,     // width = 30 pt
//   15      // height = 15 pt (you can squash or stretch)
// );

    doc.setFontSize(18).setFont('helvetica', 'bold');
    const title = 'Line Item Inspection Report';
    const textX = xLogo + logoSize + gap;
    const textY = headerY + (logoSize * 0.6);  // tweak 0.55–0.65 to fine‐tune
    doc.text(title, textX, textY);

    // advance your cursor for the body
    currentY = headerY + logoSize + 10;
    // Header Info
    doc.setFontSize(12).setFont('helvetica', 'normal');
    const headerLeftX = margins.left + contentGap;
    const headerRightX = pageWidth - margins.right - contentGap;

    const addHeaderRow = (leftText, rightText) => {
        doc.text(leftText, headerLeftX, currentY);
        doc.text(rightText, headerRightX - doc.getTextWidth(rightText), currentY);
        currentY += 7;
    };

    addHeaderRow(
        `PO Number : ${po_number || 'N/A'}`,
        `PO Date of Issue : ${new Date(po_date_of_issue).toLocaleDateString()}`
    );

    addHeaderRow(
        `Firm Name : ${firm_name || 'N/A'}`,
        `Inspection Authority : ${inspected_by || 'N/A'}`
    );

    addHeaderRow(
        `Tender Number : ${tender_number || 'N/A'}`,
        `Assignee : ${po_created_by || 'N/A'}`
    )
    currentY += 20;



    // PO Entries Table
    doc.setFontSize(14).setFont('helvetica', 'bold');
    doc.text('Line Items & Items', headerLeftX, currentY);
    currentY += 5;

    for (const [index, po] of po_line_items.entries()) {
        // Line Item Row
        doc.autoTable({
            head: [['Line Item', 'Qty', 'Qty Offered', 'Qty Inspected']],
            body: [[
                po.line_item_name || 'N/A',
                po.total_quantity || 'N/A',
                po.quantity_offered || 'N/A',
                po.quantity_inspected || 'N/A',
            ]],
            startY: currentY,
            styles: { fontSize: 10, halign: 'center' },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            margin: { left: margins.left + contentGap, right: margins.right + contentGap },
            didDrawPage: (data) => {
                if (data.pageNumber > 1) {
                    drawBorder();
                    doc.setFontSize(18).setFont('helvetica', 'bold')
                        .text(title, (pageWidth - titleWidth) / 2, margins.top + contentGap + titleSpacing);
                    doc.setFontSize(12).setFont('helvetica', 'normal');
                }
            }
        });

        currentY = doc.lastAutoTable.finalY + 2;

        // Now show its item details table just below
        const itemDetails = po.po_item_details.flatMap(item => {
            const serials = Array.isArray(item.item_serial_number)
                ? item.item_serial_number
                : [item.item_serial_number || 'N/A'];

            return serials.map(serial => [
                serial || 'N/A',
                item.item_type || 'N/A',
                item.item_make || 'N/A',
                item.item_model || 'N/A',
                item.item_part || 'N/A',
            ]);
        });

        if (itemDetails.length > 0) {
            doc.autoTable({
                head: [['Serial No.', 'Type ID', 'Make ID', 'Model ID', 'Part ID']],
                body: itemDetails,
                startY: currentY,
                styles: { fontSize: 10, halign: 'center' },
                headStyles: { fillColor: [220, 220, 220], textColor: 0 },
                margin: { left: margins.left + contentGap, right: margins.right + contentGap },
            });

            currentY = doc.lastAutoTable.finalY + 10;
        } else {
            currentY += 10; // spacing if no item details
        }
    }
    // Signature Section

    const addSignature = async () => {
        let signatureY = currentY + 10;
        if (signatureY > pageHeight - margins.bottom - 50) {
            doc.addPage();
            drawBorder();
            signatureY = margins.top + contentGap + titleSpacing;
        }

        // Visible Signature Box
        const sigWidth = 80;
        const sigHeight = 20;
        const sigX = pageWidth - margins.right - sigWidth - 10;

        doc.setDrawColor(41, 128, 185)
            .setLineWidth(0.5)
            .rect(sigX, signatureY, sigWidth, sigHeight);

        doc.setFontSize(10)
            .text(`Signed by: ${signingParams.signerName || 'Authorized'}`, sigX + 5, signatureY + 10)
            .text(`Date: ${new Date().toLocaleDateString()}`, sigX + 5, signatureY + 15);


            const lineItemName = po_line_items[0]?.line_item_name?.replace(/\s+/g, '_') || 'Report';
            const fileBase     = `Line_Item_Inspection_Report_${lineItemName}`;
        // Digital Signature
        if (signingParams.certificatePem && signingParams.privateKeyPem) {
            try {
                const pdfBytes = doc.output('arraybuffer');
                const signedPdf = await applyDigitalSignature(pdfBytes, {
                    signerName: signingParams.signerName,
                    certificatePem: signingParams.certificatePem,
                    privateKeyPem: signingParams.privateKeyPem,
                    position: { x: sigX, y: signatureY, width: sigWidth, height: sigHeight }
                });
                // Download the signed PDF
                downloadPDF(signedPdf, `${fileBase}_signed.pdf`);
            } catch (error) {
                console.error('Signing failed:', error);
                doc.save(`${fileBase}.pdf`);
            }
        } else {
            doc.save(`${fileBase}.pdf`);
        }
    };
    await addSignature();

};

// Digital Signature Implementation
const applyDigitalSignature = async (pdfBytes, params) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];

    // Prepare crypto materials
    const privateKey = forge.pki.privateKeyFromPem(params.privateKeyPem);
    const certificate = forge.pki.certificateFromPem(params.certificatePem);
    const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();

    // Signature Appearance
    const form = pdfDoc.context.formXObject();
    form.Matrix = [1, 0, 0, 1, 0, 0];
    form.BBox = [0, 0, params.position.width, params.position.height];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const stream = pdfDoc.context.stream(

        `q 0 0 ${params.position.width} ${params.position.height} re W n
0.2 0.5 0.8 RG 1 w 0 0 ${params.position.width} ${params.position.height} re S
BT /Helv 10 Tf 5 25 Td (Signed by: ${params.signerName}) Tj 5 15 Td (Date: ${new Date().toLocaleDateString()}) Tj ET Q`,
        { filters: [] }
    );
    form.setContents(stream);

    // Signature Field
    const signatureField = pdfDoc.context.register(
        pdfDoc.context.obj({
            FT: 'Sig',
            Type: 'Annot',
            Subtype: 'Widget',
            Rect: [
                params.position.x,
                lastPage.getHeight() - params.position.y - params.position.height,
                params.position.x + params.position.width,
                lastPage.getHeight() - params.position.y
            ],
            F: 4,
            P: lastPage.ref,
            AP: { N: form },
            V: await createPkcs7Signature(pdfDoc, privateKey, certDer)
        })
    );
    lastPage.node.Annots().push(signatureField);
    return pdfDoc.save();
};



const createPkcs7Signature = async (pdfDoc, privateKey, certDer) => {
    const pdfBytes = await pdfDoc.save();
    const p7 = forge.pkcs7.createSignedData();
    p7.content = forge.util.createBuffer(pdfBytes);
    p7.addCertificate({ type: 'certificate', data: certDer });
    p7.addSigner({
        key: privateKey,
        certificate: certDer,
        digestAlgorithm: forge.pki.oids.sha256,
        authenticatedAttributes: [
            { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
            { type: forge.pki.oids.messageDigest },
            { type: forge.pki.oids.signingTime, value: new Date() }
        ]
    });
    p7.sign();
    return pdfDoc.context.embedPkcs7(forge.asn1.toDer(p7.toAsn1()).getBytes());

};

const downloadPDF = (pdfBytes, fileName) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
};