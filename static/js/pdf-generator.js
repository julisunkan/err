
// Enhanced PDF Generator for Business Documents
console.log('Loading Enhanced PDF Generator...');

class EnhancedPDFGenerator {
    constructor() {
        this.jsPDF = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
        if (!this.jsPDF) {
            throw new Error('jsPDF library not loaded');
        }
        console.log('EnhancedPDFGenerator initialized');
    }

    async generatePDF(documentData) {
        try {
            console.log('Generating PDF with data:', documentData);

            const doc = new this.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Set document properties
            doc.setProperties({
                title: `${this.getDocumentTitle(documentData.type)} ${documentData.number}`,
                subject: `Business Document`,
                author: documentData.business.businessName || 'Business Documents',
                creator: 'Business Documents Generator'
            });

            // Generate PDF content step by step
            await this.addHeader(doc, documentData);
            this.addDocumentInfo(doc, documentData);
            this.addClientInfo(doc, documentData);
            this.addItemsTable(doc, documentData);
            this.addTotals(doc, documentData);
            await this.addFooter(doc, documentData);

            console.log('PDF content generation completed successfully');
            return doc;

        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }

    async downloadPDF(documentData) {
        try {
            const doc = await this.generatePDF(documentData);
            const fileName = `${documentData.type.toLowerCase()}-${documentData.number}-${Date.now()}.pdf`;
            
            // Download the PDF
            doc.save(fileName);
            console.log('PDF downloaded successfully:', fileName);
            return true;

        } catch (error) {
            console.error('Error downloading PDF:', error);
            throw error;
        }
    }

    generateHTML(documentData) {
        try {
            console.log('Generating HTML with data:', documentData);

            const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.getDocumentTitle(documentData.type)} ${documentData.number}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
        .business-info h1 { margin: 0; font-size: 24px; color: #000; }
        .business-info p { margin: 5px 0; color: #666; }
        .business-logo img { max-width: 150px; max-height: 100px; }
        .document-title { font-size: 28px; font-weight: bold; margin: 20px 0; }
        .document-info { margin-bottom: 30px; }
        .client-info { margin-bottom: 30px; }
        .client-info h3 { margin-bottom: 10px; font-size: 16px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .items-table th { background-color: #f8f8f8; font-weight: bold; }
        .items-table .text-right { text-align: right; }
        .items-table .text-center { text-align: center; }
        .totals { float: right; width: 300px; margin-bottom: 30px; }
        .totals table { width: 100%; }
        .totals td { padding: 5px 10px; }
        .totals .total-row { font-weight: bold; border-top: 2px solid #333; }
        .footer { clear: both; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; }
        .signature { margin-top: 30px; }
        .signature img { max-width: 200px; max-height: 80px; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="business-info">
            <h1>${documentData.business.businessName || 'Your Business Name'}</h1>
            ${documentData.business.businessAddress ? `<p>${documentData.business.businessAddress}</p>` : ''}
            ${documentData.business.businessPhone ? `<p>Phone: ${documentData.business.businessPhone}</p>` : ''}
            ${documentData.business.businessEmail ? `<p>Email: ${documentData.business.businessEmail}</p>` : ''}
        </div>
        ${documentData.business.businessLogoUrl ? `
        <div class="business-logo">
            <img src="${documentData.business.businessLogoUrl}" alt="Business Logo">
        </div>
        ` : ''}
    </div>

    <div class="document-title">${this.getDocumentTitle(documentData.type)}</div>

    <div class="document-info">
        <p><strong>Number:</strong> ${documentData.number}</p>
        <p><strong>Date:</strong> ${documentData.date}</p>
        ${documentData.dueDate && documentData.type === 'invoice' ? `<p><strong>Due Date:</strong> ${documentData.dueDate}</p>` : ''}
    </div>

    <div class="client-info">
        <h3>BILL TO:</h3>
        ${documentData.client.name ? `<p><strong>${documentData.client.name}</strong></p>` : ''}
        ${documentData.client.address ? `<p>${documentData.client.address}</p>` : ''}
        ${documentData.client.phone ? `<p>Phone: ${documentData.client.phone}</p>` : ''}
        ${documentData.client.email ? `<p>Email: ${documentData.client.email}</p>` : ''}
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-center">Disc%</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            ${documentData.items.map(item => `
            <tr>
                <td>${item.description || ''}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${this.formatCurrency(item.price, documentData.currency)}</td>
                <td class="text-center">${item.discount}%</td>
                <td class="text-right">${this.formatCurrency(item.total, documentData.currency)}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td class="text-right">${this.formatCurrency(documentData.totals.subtotal, documentData.currency)}</td>
            </tr>
            <tr>
                <td>Tax (${documentData.totals.taxRate}%):</td>
                <td class="text-right">${this.formatCurrency(documentData.totals.taxAmount, documentData.currency)}</td>
            </tr>
            <tr class="total-row">
                <td><strong>TOTAL:</strong></td>
                <td class="text-right"><strong>${this.formatCurrency(documentData.totals.grandTotal, documentData.currency)}</strong></td>
            </tr>
        </table>
    </div>

    <div class="footer">
        ${documentData.business.signatureUrl ? `
        <div class="signature">
            <img src="${documentData.business.signatureUrl}" alt="Authorized Signature">
            <p>Authorized Signature</p>
        </div>
        ` : ''}
        <p style="text-align: center; font-style: italic; margin-top: 30px;">Thank you for your business!</p>
    </div>
</body>
</html>`;

            console.log('HTML generated successfully');
            return html;

        } catch (error) {
            console.error('Error generating HTML:', error);
            throw error;
        }
    }

    downloadHTML(documentData) {
        try {
            const html = this.generateHTML(documentData);
            const fileName = `${documentData.type.toLowerCase()}-${documentData.number}-${Date.now()}.html`;
            
            // Create blob and download
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('HTML downloaded successfully:', fileName);
            return true;

        } catch (error) {
            console.error('Error downloading HTML:', error);
            throw error;
        }
    }

    async addHeader(doc, documentData) {
        const margin = 20;

        // Business name (top left)
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const businessName = (documentData.business && documentData.business.businessName && documentData.business.businessName.trim() !== '') 
            ? documentData.business.businessName 
            : 'Your Business Name';
        doc.text(businessName, margin, margin + 8);

        // Business details (below name)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(64, 64, 64);

        let y = margin + 18;
        if (documentData.business.businessAddress) {
            doc.text(documentData.business.businessAddress, margin, y);
            y += 5;
        }
        if (documentData.business.businessPhone) {
            doc.text(`Phone: ${documentData.business.businessPhone}`, margin, y);
            y += 5;
        }
        if (documentData.business.businessEmail) {
            doc.text(`Email: ${documentData.business.businessEmail}`, margin, y);
        }

        // Business logo (top right) - show if available
        const hasBusinessLogo = documentData.business && documentData.business.businessLogoUrl && documentData.business.businessLogoUrl.trim() !== '';
        if (hasBusinessLogo) {
            try {
                const logoImg = await this.loadImage(documentData.business.businessLogoUrl);
                doc.addImage(logoImg, 'JPEG', 150, margin, 40, 30);
                console.log('Business logo added to PDF successfully');
            } catch (error) {
                console.warn('Could not load business logo:', error);
            }
        }

        // Header line
        doc.setDrawColor(128, 128, 128);
        doc.setLineWidth(0.5);
        doc.line(margin, 65, 190, 65);
    }

    addDocumentInfo(doc, documentData) {
        const margin = 20;
        let y = 75;

        // Document title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(this.getDocumentTitle(documentData.type), margin, y);

        y += 15;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Document details
        doc.text(`Number: ${documentData.number}`, margin, y);
        y += 5;
        doc.text(`Date: ${documentData.date}`, margin, y);

        if (documentData.dueDate && documentData.type === 'invoice') {
            y += 5;
            doc.text(`Due Date: ${documentData.dueDate}`, margin, y);
        }
    }

    addClientInfo(doc, documentData) {
        const margin = 20;
        let y = 115;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('BILL TO:', margin, y);

        y += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(64, 64, 64);

        if (documentData.client.name) {
            doc.setFont('helvetica', 'bold');
            doc.text(documentData.client.name, margin, y);
            doc.setFont('helvetica', 'normal');
            y += 5;
        }

        if (documentData.client.address) {
            doc.text(documentData.client.address, margin, y);
            y += 5;
        }

        if (documentData.client.phone) {
            doc.text(`Phone: ${documentData.client.phone}`, margin, y);
            y += 5;
        }

        if (documentData.client.email) {
            doc.text(`Email: ${documentData.client.email}`, margin, y);
        }
    }

    addItemsTable(doc, documentData) {
        const margin = 20;
        const startY = 160;
        const tableWidth = 170;

        // Column widths
        const colWidths = [80, 20, 30, 20, 20];
        const headers = ['Description', 'Qty', 'Price', 'Disc%', 'Total'];

        // Table header
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, startY, tableWidth, 8, 'F');

        doc.setDrawColor(128, 128, 128);
        doc.setLineWidth(0.3);
        doc.rect(margin, startY, tableWidth, 8);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);

        let x = margin + 2;
        headers.forEach((header, i) => {
            if (i === 0) {
                doc.text(header, x, startY + 5);
            } else {
                doc.text(header, x + colWidths[i]/2, startY + 5, { align: 'center' });
            }
            x += colWidths[i];
        });

        // Table rows
        let y = startY + 12;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(64, 64, 64);

        documentData.items.forEach((item, index) => {
            if (index % 2 === 1) {
                doc.setFillColor(248, 248, 248);
                doc.rect(margin, y - 3, tableWidth, 10, 'F');
            }

            doc.setDrawColor(192, 192, 192);
            doc.setLineWidth(0.1);
            doc.rect(margin, y - 3, tableWidth, 10);

            x = margin + 2;

            // Description
            const desc = item.description || '';
            if (desc.length > 35) {
                doc.text(desc.substring(0, 35) + '...', x, y + 2);
            } else {
                doc.text(desc, x, y + 2);
            }
            x += colWidths[0];

            // Quantity
            doc.text(item.quantity.toString(), x + colWidths[1]/2, y + 2, { align: 'center' });
            x += colWidths[1];

            // Price
            doc.text(this.formatCurrency(item.price, documentData.currency), x + colWidths[2] - 2, y + 2, { align: 'right' });
            x += colWidths[2];

            // Discount
            doc.text(`${item.discount}%`, x + colWidths[3]/2, y + 2, { align: 'center' });
            x += colWidths[3];

            // Total
            doc.text(this.formatCurrency(item.total, documentData.currency), x + colWidths[4] - 2, y + 2, { align: 'right' });

            y += 10;
        });

        // Table bottom border
        doc.setDrawColor(128, 128, 128);
        doc.setLineWidth(0.5);
        doc.line(margin, y - 3, margin + tableWidth, y - 3);
    }

    addTotals(doc, documentData) {
        const margin = 20;
        const totals = documentData.totals;
        const x = 130;
        let y = 190 + (documentData.items.length * 10);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(64, 64, 64);

        // Subtotal
        doc.text('Subtotal:', x, y);
        doc.text(this.formatCurrency(totals.subtotal, documentData.currency), 190, y, { align: 'right' });
        y += 7;

        // Tax
        doc.text(`Tax (${totals.taxRate}%):`, x, y);
        doc.text(this.formatCurrency(totals.taxAmount, documentData.currency), 190, y, { align: 'right' });
        y += 10;

        // Total line
        doc.setDrawColor(128, 128, 128);
        doc.setLineWidth(0.5);
        doc.line(x, y - 2, 190, y - 2);

        // Grand total
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('TOTAL:', x, y + 5);
        doc.text(this.formatCurrency(totals.grandTotal, documentData.currency), 190, y + 5, { align: 'right' });
    }

    async addFooter(doc, documentData) {
        const margin = 20;
        const y = 260;

        // Footer line
        doc.setDrawColor(192, 192, 192);
        doc.setLineWidth(0.3);
        doc.line(margin, y, 190, y);

        // Business signature - show if signature URL exists
        const hasBusinessSignature = documentData.business && documentData.business.signatureUrl && documentData.business.signatureUrl.trim() !== '';
        
        if (hasBusinessSignature) {
            try {
                const signatureImg = await this.loadImage(documentData.business.signatureUrl);
                doc.addImage(signatureImg, 'JPEG', margin, y + 5, 50, 20);

                doc.setFontSize(8);
                doc.setTextColor(128, 128, 128);
                doc.text('Authorized Signature', margin, y + 30);
                console.log('Business signature added to PDF successfully');
            } catch (error) {
                console.warn('Could not load signature:', error);
            }
        }

        // Thank you message
        doc.setFontSize(10);
        doc.setTextColor(64, 64, 64);
        doc.setFont('helvetica', 'italic');
        doc.text('Thank you for your business!', 105, y + 15, { align: 'center' });

        // Page number
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Page 1 of 1', 190, 287, { align: 'right' });
    }

    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                try {
                    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataURL);
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = url;
        });
    }

    getDocumentTitle(type) {
        const titles = {
            invoice: 'INVOICE',
            quotation: 'QUOTATION',
            purchase_order: 'PURCHASE ORDER',
            receipt: 'RECEIPT'
        };
        return titles[type] || 'DOCUMENT';
    }

    formatCurrency(amount, currency) {
        const formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        if (currency === 'NGN') {
            return `NGN ${formatted}`;
        }

        const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
        const symbol = symbols[currency] || '$';
        return `${symbol}${formatted}`;
    }
}

// Initialize when jsPDF is available
function initializeEnhancedPDFGenerator() {
    if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
        try {
            window.EnhancedPDFGenerator = new EnhancedPDFGenerator();
            console.log('EnhancedPDFGenerator ready');
        } catch (error) {
            console.error('Error initializing EnhancedPDFGenerator:', error);
        }
    } else {
        setTimeout(initializeEnhancedPDFGenerator, 100);
    }
}

initializeEnhancedPDFGenerator();
