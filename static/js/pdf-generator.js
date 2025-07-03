// Minimal Black & White PDF Generator
console.log('Loading Minimal PDF Generator...');

// Ensure jsPDF is available
function ensureJsPDFLoaded() {
    if (typeof window.jsPDF === 'undefined' && typeof window.jspdf !== 'undefined') {
        window.jsPDF = window.jspdf.jsPDF;
    }
    return typeof window.jsPDF !== 'undefined';
}

class MinimalPDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.currentY = this.margin;
        this.lineHeight = 6;
        this.fontSize = {
            title: 18,
            subtitle: 14,
            normal: 10,
            small: 8
        };
        console.log('Minimal PDF Generator initialized');
        this.ready = false;
        this.checkJsPDF();
    }

    // Initialize new PDF document
    initializeDocument() {
        if (typeof window.jsPDF === 'undefined') {
            throw new Error('jsPDF library not loaded');
        }
        this.doc = new window.jsPDF('p', 'mm', 'a4');
        this.currentY = this.margin;
        return this.doc;
    }

    // Set font with size and style
    setFont(size, style = 'normal') {
        this.doc.setFontSize(size);
        this.doc.setFont('helvetica', style);
        this.doc.setTextColor(0, 0, 0); // Always black
    }

    // Add text with proper spacing
    addText(text, x, y, options = {}) {
        const {
            maxWidth = this.pageWidth - (2 * this.margin),
            align = 'left'
        } = options;

        if (!text) return y;

        this.doc.setTextColor(0, 0, 0);
        const lines = this.doc.splitTextToSize(String(text), maxWidth);

        for (let i = 0; i < lines.length; i++) {
            const lineY = y + (i * this.lineHeight);
            let xPos = x;

            if (align === 'center') {
                xPos = x + (maxWidth / 2) - (this.doc.getTextWidth(lines[i]) / 2);
            } else if (align === 'right') {
                xPos = x + maxWidth - this.doc.getTextWidth(lines[i]);
            }

            this.doc.text(lines[i], xPos, lineY);
        }

        return y + (lines.length * this.lineHeight);
    }

    // Add simple header with business logo
    async addSimpleHeader(businessData) {
        const headerStartY = this.currentY;
        let logoAdded = false;

        // Add business logo at top right if URL provided
        if (businessData.businessLogoUrl) {
            try {
                const logoData = await this.loadImage(businessData.businessLogoUrl);
                if (logoData) {
                    const logoSize = 25; // Appropriate size for header
                    const logoX = this.pageWidth - this.margin - logoSize;
                    const logoY = this.currentY;

                    // Add logo with border
                    this.doc.setLineWidth(0.5);
                    this.doc.setDrawColor(200, 200, 200);
                    this.doc.rect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);
                    
                    this.doc.addImage(logoData, 'JPEG', logoX, logoY, logoSize, logoSize);
                    logoAdded = true;
                }
            } catch (error) {
                console.warn('Failed to load business logo:', error);
            }
        }

        // Company name (left side)
        if (businessData.businessName) {
            this.setFont(this.fontSize.title, 'bold');
            const maxWidth = logoAdded ? this.pageWidth - (2 * this.margin) - 30 : this.pageWidth - (2 * this.margin);
            const nameLines = this.doc.splitTextToSize(businessData.businessName, maxWidth);
            for (let i = 0; i < nameLines.length; i++) {
                this.doc.text(nameLines[i], this.margin, this.currentY);
                this.currentY += 8;
            }
            this.currentY += 2;
        }

        // Contact information
        this.setFont(this.fontSize.small, 'normal');
        const maxContactWidth = logoAdded ? this.pageWidth - (2 * this.margin) - 30 : this.pageWidth - (2 * this.margin);

        if (businessData.businessAddress) {
            const addressLines = this.doc.splitTextToSize(businessData.businessAddress, maxContactWidth);
            for (let i = 0; i < addressLines.length; i++) {
                this.doc.text(addressLines[i], this.margin, this.currentY);
                this.currentY += 5;
            }
        }

        if (businessData.businessPhone || businessData.businessEmail) {
            let contactLine = '';
            if (businessData.businessPhone) {
                contactLine += 'Phone: ' + businessData.businessPhone;
            }
            if (businessData.businessEmail) {
                if (contactLine) contactLine += ' | ';
                contactLine += 'Email: ' + businessData.businessEmail;
            }
            
            const contactLines = this.doc.splitTextToSize(contactLine, maxContactWidth);
            for (let i = 0; i < contactLines.length; i++) {
                this.doc.text(contactLines[i], this.margin, this.currentY);
                this.currentY += 5;
            }
            this.currentY += 3;
        }

        // Ensure adequate spacing after header, especially when logo is present
        if (logoAdded) {
            this.currentY = Math.max(this.currentY, headerStartY + 30);
        }

        // Separator line
        this.doc.setLineWidth(1);
        this.doc.setDrawColor(0, 0, 0);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 15;
    }

    // Add document section
    addDocumentSection(documentData) {
        // Document type and number
        this.setFont(this.fontSize.subtitle, 'bold');
        const docType = documentData.type.charAt(0).toUpperCase() + 
                       documentData.type.slice(1).replace('_', ' ');
        this.doc.text(docType.toUpperCase(), this.margin, this.currentY);

        // Document number on the right
        const docNumberText = `# ${documentData.number}`;
        const docNumberWidth = this.doc.getTextWidth(docNumberText);
        this.doc.text(docNumberText, this.pageWidth - this.margin - docNumberWidth, this.currentY);

        this.currentY += 10;

        // Date
        this.setFont(this.fontSize.normal, 'normal');
        const formattedDate = this.formatDate(documentData.date);
        this.doc.text('Date: ' + formattedDate, this.margin, this.currentY);

        this.currentY += 15;
    }

    // Add client section
    addClientSection(clientData) {
        this.setFont(this.fontSize.normal, 'bold');
        this.doc.text('BILL TO:', this.margin, this.currentY);
        this.currentY += 8;

        // Client information
        if (clientData.name) {
            this.setFont(this.fontSize.normal, 'bold');
            this.doc.text(clientData.name, this.margin, this.currentY);
            this.currentY += 6;
        }

        if (clientData.address) {
            this.setFont(this.fontSize.small, 'normal');
            const addressLines = this.doc.splitTextToSize(clientData.address, this.pageWidth - (2 * this.margin));
            for (let i = 0; i < addressLines.length; i++) {
                this.doc.text(addressLines[i], this.margin, this.currentY);
                this.currentY += 5;
            }
        }

        if (clientData.phone || clientData.email) {
            this.setFont(this.fontSize.small, 'normal');
            if (clientData.phone) {
                this.doc.text('Phone: ' + clientData.phone, this.margin, this.currentY);
                this.currentY += 5;
            }
            if (clientData.email) {
                this.doc.text('Email: ' + clientData.email, this.margin, this.currentY);
                this.currentY += 5;
            }
        }

        this.currentY += 10;
    }

    // Add items table
    addItemsTable(items, currency = 'USD') {
        if (!items || items.length === 0) {
            this.setFont(this.fontSize.normal, 'normal');
            this.doc.text('No items added', this.margin, this.currentY);
            this.currentY += 15;
            return;
        }

        const tableX = this.margin;
        const tableWidth = this.pageWidth - (2 * this.margin);
        const rowHeight = 8;
        const headerHeight = 10;

        // Define columns
        const columns = [
            { name: 'DESCRIPTION', width: tableWidth * 0.48, align: 'left' },
            { name: 'QTY', width: tableWidth * 0.12, align: 'center' },
            { name: 'UNIT PRICE', width: tableWidth * 0.20, align: 'right' },
            { name: 'AMOUNT', width: tableWidth * 0.20, align: 'right' }
        ];

        // Calculate column positions
        let currentX = tableX;
        columns.forEach(col => {
            col.x = currentX;
            currentX += col.width;
        });

        // Table header
        const headerY = this.currentY;

        // Header background
        this.doc.setFillColor(240, 240, 240);
        this.doc.rect(tableX, headerY, tableWidth, headerHeight, 'F');

        // Header border
        this.doc.setLineWidth(0.5);
        this.doc.setDrawColor(0, 0, 0);
        this.doc.rect(tableX, headerY, tableWidth, headerHeight);

        // Header text
        this.setFont(this.fontSize.normal, 'bold');
        columns.forEach(col => {
            let textX = col.x + 2;
            if (col.align === 'center') {
                textX = col.x + (col.width / 2) - (this.doc.getTextWidth(col.name) / 2);
            } else if (col.align === 'right') {
                textX = col.x + col.width - 2 - this.doc.getTextWidth(col.name);
            }
            this.doc.text(col.name, textX, headerY + 7);
        });

        // Column separators
        let lineX = tableX;
        for (let i = 1; i < columns.length; i++) {
            lineX += columns[i-1].width;
            this.doc.line(lineX, headerY, lineX, headerY + headerHeight);
        }

        this.currentY = headerY + headerHeight;

        // Table rows
        this.setFont(this.fontSize.normal, 'normal');

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const price = parseFloat(item.price) || 0;
            const quantity = parseFloat(item.quantity) || 0;
            const total = price * quantity;
            const rowY = this.currentY;

            // Row border
            this.doc.setLineWidth(0.2);
            this.doc.setDrawColor(0, 0, 0);
            this.doc.rect(tableX, rowY, tableWidth, rowHeight);

            // Column separators
            let lineX = tableX;
            for (let j = 1; j < columns.length; j++) {
                lineX += columns[j-1].width;
                this.doc.line(lineX, rowY, lineX, rowY + rowHeight);
            }

            // Row data
            const rowData = [
                item.description || 'No description',
                quantity.toString(),
                this.formatCurrency(price, currency),
                this.formatCurrency(total, currency)
            ];

            // Draw each cell
            columns.forEach((col, colIndex) => {
                let text = rowData[colIndex];
                let textX = col.x + 2;

                // Truncate description if too long
                if (colIndex === 0) {
                    const maxWidth = col.width - 4;
                    const textWidth = this.doc.getTextWidth(text);
                    if (textWidth > maxWidth) {
                        while (this.doc.getTextWidth(text + '...') > maxWidth && text.length > 0) {
                            text = text.slice(0, -1);
                        }
                        text += '...';
                    }
                }

                if (col.align === 'center') {
                    textX = col.x + (col.width / 2) - (this.doc.getTextWidth(text) / 2);
                } else if (col.align === 'right') {
                    textX = col.x + col.width - 2 - this.doc.getTextWidth(text);
                }

                this.doc.text(text, textX, rowY + 6);
            });

            this.currentY += rowHeight;
        }

        this.currentY += 10;
    }

    // Add totals section
    addTotals(totals, currency = 'USD') {
        const totalsX = this.pageWidth - this.margin - 60;
        const totalsWidth = 60;

        let currentY = this.currentY;

        // Subtotal
        const subtotal = parseFloat(totals.subtotal) || 0;
        this.setFont(this.fontSize.normal, 'normal');
        this.doc.text('Subtotal:', totalsX, currentY);
        const subtotalText = this.formatCurrency(subtotal, currency);
        const subtotalWidth = this.doc.getTextWidth(subtotalText);
        this.doc.text(subtotalText, totalsX + totalsWidth - subtotalWidth, currentY);
        currentY += 6;

        // Tax if applicable
        if (totals.taxRate > 0) {
            const taxAmount = subtotal * (parseFloat(totals.taxRate) / 100);
            this.doc.text(`Tax (${totals.taxRate}%):`, totalsX, currentY);
            const taxText = this.formatCurrency(taxAmount, currency);
            const taxWidth = this.doc.getTextWidth(taxText);
            this.doc.text(taxText, totalsX + totalsWidth - taxWidth, currentY);
            currentY += 6;
        }

        // Separator line
        this.doc.setLineWidth(0.5);
        this.doc.setDrawColor(0, 0, 0);
        this.doc.line(totalsX, currentY + 1, totalsX + totalsWidth, currentY + 1);
        currentY += 6;

        // Grand total
        const grandTotal = parseFloat(totals.grandTotal) || 
                          subtotal + (subtotal * (parseFloat(totals.taxRate || 0) / 100));

        this.setFont(this.fontSize.normal, 'bold');
        this.doc.text('TOTAL:', totalsX, currentY);
        const totalText = this.formatCurrency(grandTotal, currency);
        const totalWidth = this.doc.getTextWidth(totalText);
        this.doc.text(totalText, totalsX + totalsWidth - totalWidth, currentY);

        this.currentY = currentY + 15;
    }

    // Add simple footer with signature
    async addSimpleFooter(notes = '', businessData = {}) {
        // Notes section
        if (notes && notes.trim()) {
            this.setFont(this.fontSize.normal, 'bold');
            this.doc.text('NOTES:', this.margin, this.currentY);
            this.currentY += 8;

            this.setFont(this.fontSize.small, 'normal');
            const maxWidth = this.pageWidth - (2 * this.margin);
            const noteLines = this.doc.splitTextToSize(notes, maxWidth);

            for (let i = 0; i < noteLines.length; i++) {
                this.doc.text(noteLines[i], this.margin, this.currentY);
                this.currentY += 5;
            }

            this.currentY += 10;
        }

        // Footer area
        const footerY = this.pageHeight - 40;
        let signatureAdded = false;

        // Add signature at bottom right if URL provided
        if (businessData.signatureUrl) {
            try {
                const signatureData = await this.loadImage(businessData.signatureUrl);
                if (signatureData) {
                    const signatureWidth = 30;
                    const signatureHeight = 15;
                    const signatureX = this.pageWidth - this.margin - signatureWidth;
                    const signatureY = footerY - 5;

                    // Add signature with subtle border
                    this.doc.setLineWidth(0.3);
                    this.doc.setDrawColor(220, 220, 220);
                    this.doc.rect(signatureX - 1, signatureY - 1, signatureWidth + 2, signatureHeight + 2);
                    
                    this.doc.addImage(signatureData, 'JPEG', signatureX, signatureY, signatureWidth, signatureHeight);
                    
                    // Add "Authorized Signature" label below
                    this.setFont(this.fontSize.small, 'normal');
                    this.doc.text('Authorized Signature', signatureX, signatureY + signatureHeight + 5);
                    signatureAdded = true;
                }
            } catch (error) {
                console.warn('Failed to load signature image:', error);
            }
        }

        // Thank you message at bottom center
        this.setFont(this.fontSize.normal, 'normal');
        const thankYou = 'Thank you for your business!';
        const textWidth = this.doc.getTextWidth(thankYou);
        const thankYouX = signatureAdded ? this.margin : (this.pageWidth - textWidth) / 2;
        this.doc.text(thankYou, thankYouX, footerY + 10);
    }

    // Generate complete PDF
    async generatePDF(documentData) {
        try {
            this.initializeDocument();

            // Set document properties
            this.doc.setProperties({
                title: `${documentData.type} ${documentData.number}`,
                subject: documentData.type,
                author: documentData.business.businessName || 'Business Documents Generator',
                creator: 'Minimal PDF Generator'
            });

            // Add sections (header and footer are now async)
            await this.addSimpleHeader(documentData.business);
            this.addDocumentSection(documentData);
            this.addClientSection(documentData);
            this.addItemsTable(documentData.items, documentData.business.currency);
            this.addTotals(documentData.totals, documentData.business.currency);
            await this.addSimpleFooter(documentData.notes, documentData.business);

            // Add page numbers
            const pageCount = this.doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                this.doc.setPage(i);

                this.setFont(this.fontSize.small, 'normal');
                this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth - 25, this.pageHeight - 10);

                // Generation info
                const generatedDate = new Date().toLocaleDateString();
                let currentUsername = 'Unknown User';

                try {
                    const response = await fetch('/api/get-current-user');
                    if (response.ok) {
                        const userData = await response.json();
                        if (userData.success) {
                            currentUsername = userData.username;
                        }
                    }
                } catch (error) {
                    console.warn('Could not fetch current user:', error);
                }

                this.doc.text(`Generated on ${generatedDate} by ${currentUsername}`, 20, this.pageHeight - 10);
            }

            return this.doc;

        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }

    // Download PDF
    async downloadPDF(documentData) {
        try {
            const doc = await this.generatePDF(documentData);
            const filename = `${documentData.type}-${documentData.number}.pdf`;
            doc.save(filename);

            // Save document info to backend
            try {
                const documentInfo = {
                    document_type: documentData.type.toLowerCase(),
                    document_title: `${documentData.type} ${documentData.number}`
                };

                fetch('/api/save-generated-document', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(documentInfo)
                }).then(response => response.json())
                  .then(data => {
                      if (data.success) {
                          console.log('Document info saved successfully');
                      }
                  }).catch(error => {
                      console.error('Failed to save document info:', error);
                  });
            } catch (error) {
                console.error('Error saving document info:', error);
            }

            return filename;
        } catch (error) {
            console.error('Error downloading PDF:', error);
            throw error;
        }
    }

    // Helper: Format currency
    formatCurrency(amount, currency = 'USD') {
        const numAmount = parseFloat(amount) || 0;

        try {
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            return formatter.format(numAmount);
        } catch (error) {
            const symbols = {
                'USD': '$', 'EUR': '€', 'GBP': '£', 'NGN': '₦', 'CAD': 'C$',
                'AUD': 'A$', 'INR': '₹', 'JPY': '¥', 'CNY': '¥'
            };
            const symbol = symbols[currency] || `${currency} `;
            const formatted = numAmount.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            });
            return `${symbol}${formatted}`;
        }
    }

    // Helper: Load image from URL
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    ctx.drawImage(img, 0, 0);
                    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataURL);
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = function() {
                reject(new Error('Failed to load image'));
            };
            
            img.src = url;
        });
    }

    // Helper: Format date
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    checkJsPDF() {
        const checkInterval = setInterval(() => {
            if (ensureJsPDFLoaded() && typeof window.jsPDF !== 'undefined') {
                clearInterval(checkInterval);
                this.ready = true;
                console.log('MinimalPDFGenerator ready');
            }
        }, 100);

        setTimeout(() => {
            if (!this.ready) {
                clearInterval(checkInterval);
                console.error('jsPDF not loaded after 10 seconds');
                if (ensureJsPDFLoaded()) {
                    this.ready = true;
                    console.log('MinimalPDFGenerator ready (fallback)');
                }
            }
        }, 10000);
    }
}

// Initialize and expose globally
console.log('Loading Minimal PDF Generator...');
window.EnhancedPDFGenerator = new MinimalPDFGenerator();
console.log('MinimalPDFGenerator initialized');

// Wait for jsPDF to be available
function waitForJsPDF() {
    if (typeof window.jsPDF !== 'undefined') {
        console.log('MinimalPDFGenerator ready');
        return true;
    }
    return false;
}

if (!waitForJsPDF()) {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        if (waitForJsPDF() || attempts > 50) {
            clearInterval(checkInterval);
            if (attempts > 50) {
                console.error('jsPDF failed to load after 5 seconds');
            }
        }
    }, 100);
}