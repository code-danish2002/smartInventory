import jsPDF from 'jspdf';

import 'jspdf-autotable';

import { PDFDocument, StandardFonts } from 'pdf-lib';

import * as forge from 'node-forge';



export const generatePDF = async (data, signingParams = {}) => {

    const {

        po_number,

        firm_name,

        tender_number,

        date_of_issue,

        inspection_authority_user_name,

        assignee_name,

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

    doc.setFontSize(18).setFont('helvetica', 'bold');

    const title = 'Inspection Detail';

    const titleWidth = doc.getTextWidth(title);

    doc.text(title, (pageWidth - titleWidth) / 2, currentY);

    currentY += 20;



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

        `Date of Issue : ${new Date(date_of_issue).toLocaleDateString()}`

    );

    addHeaderRow(

        `Firm Name : ${firm_name || 'N/A'}`,

        `Inspection Authority : ${inspection_authority_user_name || 'N/A'}`

    );

    addHeaderRow(

        `Tender Number : ${tender_number || 'N/A'}`,

        `Assignee : ${assignee_name || 'N/A'}`

    )

    currentY += 20;



    // PO Entries Table

    doc.setFontSize(14).setFont('helvetica', 'bold');

    doc.text('PO Entries', headerLeftX, currentY);

    currentY += 5;



    doc.autoTable({

        head: [['Line Item', 'Qty', 'Qty Offered', 'Qty Inspected', 'Details']],

        body: po_line_items.map((po, idx) => [

            po.line_item_name || 'N/A',

            po.quantity || 'N/A',

            po.quantity_offered || 'N/A',

            po.quantity_inspected || 'N/A',

            `Anexure ${idx + 1}`

        ]),

        startY: currentY,

        styles: { halign: 'center', fontSize: 10 },

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

    currentY = doc.lastAutoTable.finalY + 10;



    // Annexures

    po_line_items.forEach((po, index) => {

        doc.setFontSize(14).setFont('helvetica', 'bold')

            .text(`Anexure ${index + 1}`, headerLeftX, currentY);

        currentY += 5;



        // inside your po_line_items forEach loop for each series of items

        doc.autoTable({

            head: [['Serial No.', 'Type ID', 'Make ID', 'Model ID', 'Part ID',]],

            body: po.po_item_details.flatMap(item => {

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

            }),

            startY: currentY,

            styles: { halign: 'center', fontSize: 10 },

            headStyles: { fillColor: [41, 128, 185], textColor: 255 },

            margin: { left: margins.left + contentGap, right: margins.right + contentGap }

        });



        currentY = doc.lastAutoTable.finalY + 10;

    });



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



                downloadPDF(signedPdf, `Inspection_Report_${po_number}_signed.pdf`);

            } catch (error) {

                console.error('Signing failed:', error);

                doc.save(`Inspection_Report_${po_number}.pdf`);

            }

        } else {

            doc.save(`Inspection_Report_${po_number}.pdf`);

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