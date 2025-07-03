// Professional Business Documents PDF Generator - Clean Black and White Design
// PDF Generator using jsPDF - Version 2.0
console.log('Loading Professional PDF Generator v2.0...');

// Ensure jsPDF is available
function ensureJsPDFLoaded() {
    if (typeof window.jsPDF === 'undefined' && typeof window.jspdf !== 'undefined') {
        window.jsPDF = window.jspdf.jsPDF;
    }
    return typeof window.jsPDF !== 'undefined';
}

class SimplePDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 25; // Increased margin for professional look
        this.currentY = this.margin;
        this.lineHeight = 7; // Better line spacing
        this.fontSize = {
            title: 18,
            subtitle: 14,
            normal: 11,
            small: 9
        };
        console.log('Professional PDF Generator v2.0 initialized');
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

    // Load image from URL
    async loadImage(url) {
        return new Promise((resolve, reject) => {
            if (!url || !url.trim()) {
                resolve(null);
                return;
            }

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
                    console.warn('Failed to convert image to dataURL:', error);
                    resolve(null);
                }
            };

            img.onerror = () => {
                console.warn('Failed to load image:', url);
                resolve(null);
            };

            img.src = url;
        });
    }

    // Add professional header with logo support
    async addSimpleHeader(businessData) {
        let headerY = this.currentY;
        let logoAdded = false;

        // Add business logo if available - positioned at top right with better sizing
        if (businessData.businessLogoUrl && businessData.businessLogoUrl.trim()) {
            try {
                const logoData = await this.loadImage(businessData.businessLogoUrl);
                if (logoData) {
                    const logoSize = 35; // Professional logo size
                    const logoX = this.pageWidth - this.margin - logoSize;

                    // Add subtle border around logo
                    this.doc.setLineWidth(0.5);
                    this.doc.setDrawColor(200, 200, 200);
                    this.doc.rect(logoX - 2, headerY - 2, logoSize + 4, logoSize + 4);

                    this.doc.addImage(logoData, 'JPEG', logoX, headerY, logoSize, logoSize);
                    logoAdded = true;
                }
            } catch (error) {
                console.warn('Failed to add logo:', error);
            }
        }

        // Company name - prominent and professional with better styling
        if (businessData.businessName) {
            this.setFont(this.fontSize.title, 'bold');
            const maxNameWidth = logoAdded ? this.pageWidth - (2 * this.margin) - 40 : this.pageWidth - (2 * this.margin);
            const nameLines = this.doc.splitTextToSize(businessData.businessName, maxNameWidth);

            // Add company name with enhanced spacing
            for (let i = 0; i < nameLines.length; i++) {
                this.doc.text(nameLines[i], this.margin, headerY + 8 + (i * 10));
            }
            headerY += (nameLines.length * 10) + 12;

            // Add subtle underline for company name
            this.doc.setLineWidth(0.8);
            this.doc.setDrawColor(0, 0, 0);
            this.doc.line(this.margin, headerY - 5, this.margin + (maxNameWidth * 0.6), headerY - 5);
            headerY += 5;
        }

        // Adjust headerY if logo was added to ensure proper spacing
        if (logoAdded) {
            headerY = Math.max(headerY, this.currentY + 35);
        }

        // Company details section with proper spacing
        this.setFont(this.fontSize.normal, 'normal');

        // Business address with proper line spacing
        if (businessData.businessAddress) {
            const maxAddressWidth = this.pageWidth - (2 * this.margin);
            const addressLines = this.doc.splitTextToSize(businessData.businessAddress, maxAddressWidth);

            for (let i = 0; i < addressLines.length; i++) {
                this.doc.text(addressLines[i], this.margin, headerY + (i * 6));
            }
            headerY += (addressLines.length * 6) + 4;
        }

        // Contact information with professional formatting
        if (businessData.businessPhone || businessData.businessEmail) {
            const contactY = headerY;

            if (businessData.businessPhone) {
                this.doc.text(`Phone: ${businessData.businessPhone}`, this.margin, contactY);
                headerY += 6;
            }

            if (businessData.businessEmail) {
                this.doc.text(`Email: ${businessData.businessEmail}`, this.margin, headerY);
                headerY += 6;
            }
        }

        // Professional separator line with proper spacing
        headerY += 8;
        this.doc.setLineWidth(1);
        this.doc.setDrawColor(0, 0, 0);
        this.doc.line(this.margin, headerY, this.pageWidth - this.margin, headerY);

        this.currentY = headerY + 20;
    }

    // Add document title and details
    addDocumentSection(documentData) {
        const sectionY = this.currentY;

        // Document type - left aligned
        this.setFont(this.fontSize.subtitle, 'bold');
        const docType = documentData.type.charAt(0).toUpperCase() + 
                       documentData.type.slice(1).replace('_', ' ');
        this.doc.text(docType.toUpperCase(), this.margin, sectionY);

        // Document number and date - right aligned
        this.setFont(this.fontSize.normal, 'normal');

        const rightX = this.pageWidth - this.margin;

        // Document number
        const docNumberText = `#${documentData.number}`;
        const docNumberWidth = this.doc.getTextWidth(docNumberText);
        this.doc.text(docNumberText, rightX - docNumberWidth, sectionY);

        // Date - properly aligned below document number
        const formattedDate = this.formatDate(documentData.date);
        const dateWidth = this.doc.getTextWidth(formattedDate);
        this.doc.text(formattedDate, rightX - dateWidth, sectionY + 6);

        this.currentY = sectionY + 20;
    }

    // Add client information with professional formatting
    addClientSection(clientData) {
        // Bill To section header
        this.setFont(this.fontSize.subtitle, 'bold');
        this.doc.text('BILL TO:', this.margin, this.currentY);
        this.currentY += 12;

        // Client name - prominent
        if (clientData.name) {
            this.setFont(this.fontSize.normal, 'bold');
            this.doc.text(clientData.name, this.margin, this.currentY);
            this.currentY += 8;
        }

        // Client address with proper spacing
        if (clientData.address) {
            this.setFont(this.fontSize.normal, 'normal');
            const maxAddressWidth = this.pageWidth - (2 * this.margin);
            const addressLines = this.doc.splitTextToSize(clientData.address, maxAddressWidth);

            for (let i = 0; i < addressLines.length; i++) {
                this.doc.text(addressLines[i], this.margin, this.currentY + (i * 6));
            }
            this.currentY += (addressLines.length * 6) + 4;
        }

        // Client contact information - properly formatted
        this.setFont(this.fontSize.normal, 'normal');
        if (clientData.phone) {
            this.doc.text(`Phone: ${clientData.phone}`, this.margin, this.currentY);
            this.currentY += 6;
        }

        if (clientData.email) {
            this.doc.text(`Email: ${clientData.email}`, this.margin, this.currentY);
            this.currentY += 6;
        }

        this.currentY += 15;
    }

    // Professional items table with clean formatting
    addSimpleItemsTable(items, currency = 'USD') {
        if (!items || items.length === 0) {
            this.setFont(this.fontSize.normal, 'normal');
            this.doc.text('No items added', this.margin, this.currentY);
            this.currentY += 15;
            return;
        }

        const tableX = this.margin;
        const tableWidth = this.pageWidth - (2 * this.margin);
        const rowHeight = 10;
        const headerHeight = 12;

        // Define column structure with optimized widths for better readability
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

        // Table header with enhanced professional styling
        this.setFont(this.fontSize.normal, 'bold');
        const headerY = this.currentY + 8;

        // Professional header background - darker gray for better contrast
        this.doc.setFillColor(240, 240, 240);
        this.doc.rect(tableX, headerY - 6, tableWidth, headerHeight + 2, 'F');

        // Strong header border with double line effect
        this.doc.setLineWidth(1.5);
        this.doc.setDrawColor(0, 0, 0);
        this.doc.rect(tableX, headerY - 6, tableWidth, headerHeight + 2);

        // Inner border for professional look
        this.doc.setLineWidth(0.5);
        this.doc.rect(tableX + 1, headerY - 5, tableWidth - 2, headerHeight);

        // Draw clean vertical lines for columns
        let lineX = tableX;
        for (let i = 1; i < columns.length; i++) {
            lineX += columns[i-1].width;
            this.doc.line(lineX, headerY - 4, lineX, headerY + headerHeight - 4);
        }

        // Header text with proper alignment
        columns.forEach(col => {
            let textX = col.x + 4; // Left padding
            if (col.align === 'center') {
                textX = col.x + (col.width / 2);
            } else if (col.align === 'right') {
                textX = col.x + col.width - 4; // Right padding
            }

            if (col.align === 'center') {
                const textWidth = this.doc.getTextWidth(col.name);
                textX -= textWidth / 2;
            } else if (col.align === 'right') {
                textX -= this.doc.getTextWidth(col.name);
            }

            this.doc.text(col.name, textX, headerY + 2);
        });

        this.currentY = headerY + headerHeight + 2;

        // Table rows with clean styling
        this.setFont(this.fontSize.normal, 'normal');

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const price = parseFloat(item.price) || 0;
            const quantity = parseFloat(item.quantity) || 0;
            const total = price * quantity;

            const rowY = this.currentY + 3;

            // Row border
            this.doc.setLineWidth(0.3);
            this.doc.setDrawColor(200, 200, 200);
            this.doc.rect(tableX, rowY - 2, tableWidth, rowHeight);

            // Column separators
            let lineX = tableX;
            for (let j = 1; j < columns.length; j++) {
                lineX += columns[j-1].width;
                this.doc.line(lineX, rowY - 2, lineX, rowY + rowHeight - 2);
            }

            // Row data with proper formatting
            const rowData = [
                item.description || 'No description',
                quantity.toString(),
                this.formatCurrency(price, currency),
                this.formatCurrency(total, currency)
            ];

            // Draw each cell with proper alignment and padding
            columns.forEach((col, colIndex) => {
                let text = rowData[colIndex];
                let textX = col.x + 4; // Left padding

                // Truncate description if too long with ellipsis
                if (colIndex === 0) {
                    const maxWidth = col.width - 8;
                    const textWidth = this.doc.getTextWidth(text);
                    if (textWidth > maxWidth) {
                        while (this.doc.getTextWidth(text + '...') > maxWidth && text.length > 0) {
                            text = text.slice(0, -1);
                        }
                        text += '...';
                    }
                }

                // Adjust text position based on alignment
                if (col.align === 'center') {
                    textX = col.x + (col.width / 2);
                    const textWidth = this.doc.getTextWidth(text);
                    textX -= textWidth / 2;
                } else if (col.align === 'right') {
                    textX = col.x + col.width - 4 - this.doc.getTextWidth(text);
                }

                this.doc.text(text, textX, rowY + 3);
            });

            this.currentY += rowHeight;
        }

        // Final table border
        this.doc.setLineWidth(1);
        this.doc.setDrawColor(0, 0, 0);
        this.doc.line(tableX, this.currentY + 2, tableX + tableWidth, this.currentY + 2);

        this.currentY += 20;
    }

    // Simple totals section
    addSimpleTotals(totals, currency = 'USD') {
        const rightX = this.pageWidth - this.margin;
        const labelX = rightX - 60;

        this.setFont(this.fontSize.normal, 'normal');

        // Subtotal
        const subtotal = parseFloat(totals.subtotal) || 0;
        this.doc.text('Subtotal:', labelX, this.currentY);
        const subtotalText = this.formatCurrency(subtotal, currency);
        const subtotalWidth = this.doc.getTextWidth(subtotalText);
        this.doc.text(subtotalText, rightX - subtotalWidth, this.currentY);
        this.currentY += 8;

        // Tax if applicable
        if (totals.taxRate > 0) {
            const docTaxRate = parseFloat(totals.taxRate) || 0;
            const taxAmount = subtotal * (docTaxRate / 100);
            this.doc.text(`Tax (${docTaxRate}%):`, labelX, this.currentY);
            const taxText = this.formatCurrency(taxAmount, currency);
            const taxWidth = this.doc.getTextWidth(taxText);
            this.doc.text(taxText, rightX - taxWidth, this.currentY);
            this.currentY += 8;
        }

        // Separator line
        this.doc.setLineWidth(0.5);
        this.doc.line(labelX, this.currentY + 2, rightX, this.currentY + 2);
        this.currentY += 10;

        // Grand total
        const grandTotal = parseFloat(totals.grandTotal) || 
                          subtotal + (subtotal * (parseFloat(totals.taxRate || 0) / 100));

        this.setFont(this.fontSize.normal, 'bold');
        this.doc.text('TOTAL:', labelX, this.currentY);
        const totalText = this.formatCurrency(grandTotal, currency);
        const totalWidth = this.doc.getTextWidth(totalText);
        this.doc.text(totalText, rightX - totalWidth, this.currentY);

        this.currentY += 20;
    }

    // Professional footer with signature and notes
    async addSimpleFooter(businessData, notes = '') {
        // Notes section with professional formatting
        if (notes && notes.trim()) {
            this.setFont(this.fontSize.normal, 'bold');
            this.doc.text('NOTES:', this.margin, this.currentY);
            this.currentY += 8;

            this.setFont(this.fontSize.normal, 'normal');
            const maxWidth = this.pageWidth - (2 * this.margin);
            const noteLines = this.doc.splitTextToSize(notes, maxWidth);

            // Add notes with proper line spacing
            for (let i = 0; i < noteLines.length && i < 4; i++) {
                this.doc.text(noteLines[i], this.margin, this.currentY);
                this.currentY += 6;
            }

            this.currentY += 15;
        }

        // Calculate footer area - reserve space at bottom
        const footerAreaStart = this.pageHeight - 60;
        const footerLineY = this.pageHeight - 35;

        // Professional signature section - positioned in footer area
        if (businessData.signatureUrl && businessData.signatureUrl.trim()) {
            this.setFont(this.fontSize.normal, 'bold');
            this.doc.text('AUTHORIZED SIGNATURE:', this.margin, footerAreaStart);

            try {
                const signatureData = await this.loadImage(businessData.signatureUrl);
                if (signatureData) {
                    // Add signature image with proper sizing to fit in footer
                    const maxSignatureWidth = 60;
                    const maxSignatureHeight = 20;

                    // Calculate aspect ratio and resize accordingly
                    const img = new Image();
                    img.src = signatureData;
                    const aspectRatio = img.width / img.height;

                    let signatureWidth = maxSignatureWidth;
                    let signatureHeight = maxSignatureWidth / aspectRatio;

                    if (signatureHeight > maxSignatureHeight) {
                        signatureHeight = maxSignatureHeight;
                        signatureWidth = maxSignatureHeight * aspectRatio;
                    }

                    this.doc.addImage(signatureData, 'JPEG', this.margin, footerAreaStart + 8, signatureWidth, signatureHeight);

                    // Add signature line below image
                    this.doc.setLineWidth(0.5);
                    this.doc.setDrawColor(0, 0, 0);
                    this.doc.line(this.margin, footerAreaStart + 8 + signatureHeight + 3, this.margin + signatureWidth, footerAreaStart + 8 + signatureHeight + 3);
                } else {
                    // Professional signature line if image fails
                    this.doc.setLineWidth(0.8);
                    this.doc.setDrawColor(0, 0, 0);
                    this.doc.line(this.margin, footerAreaStart + 15, this.margin + 80, footerAreaStart + 15);
                }
            } catch (error) {
                console.warn('Failed to add signature:', error);
                // Professional fallback signature line
                this.doc.setLineWidth(0.8);
                this.doc.setDrawColor(0, 0, 0);
                this.doc.line(this.margin, footerAreaStart + 15, this.margin + 80, footerAreaStart + 15);
            }
        } else {
            // Add signature section even without image
            this.setFont(this.fontSize.normal, 'bold');
            this.doc.text('AUTHORIZED SIGNATURE:', this.margin, footerAreaStart);

            this.doc.setLineWidth(0.8);
            this.doc.setDrawColor(0, 0, 0);
            this.doc.line(this.margin, footerAreaStart + 15, this.margin + 80, footerAreaStart + 15);
        }

        // Professional footer with clean line
        this.doc.setLineWidth(0.5);
        this.doc.setDrawColor(0, 0, 0);
        this.doc.line(this.margin, footerLineY, this.pageWidth - this.margin, footerLineY);

        // Professional footer text
        this.setFont(this.fontSize.small, 'normal');
        this.doc.setTextColor(100, 100, 100);

        // Thank you message centered and professional
        const thankYou = 'Thank you for your business!';
        const textWidth = this.doc.getTextWidth(thankYou);
        this.doc.text(thankYou, (this.pageWidth - textWidth) / 2, footerLineY + 10);
    }

    // Generate unique document number based on type
    generateDocumentNumber(type, customNumber = null) {
        if (customNumber) {
            return customNumber;
        }

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000);

        const prefixes = {
            'invoice': 'INV',
            'quotation': 'QUO',
            'receipt': 'RCP',
            'purchase_order': 'PO'
        };

        const prefix = prefixes[type] || 'DOC';
        return `${prefix}-${year}${month}${day}-${random}`;
    }

    // Generate complete PDF
    async generatePDF(documentData) {
        try {
            this.initializeDocument();

            // Ensure document has unique number format
            if (!documentData.number || documentData.number === '') {
                documentData.number = this.generateDocumentNumber(documentData.type);
            }

            // Set document properties
            this.doc.setProperties({
                title: `${documentData.type} ${documentData.number}`,
                subject: documentData.type,
                author: documentData.business.businessName || 'Business Documents Generator',
                creator: 'Simple PDF Generator'
            });

            // Add sections
            await this.addSimpleHeader(documentData.business);
            this.addDocumentSection(documentData);
            this.addClientSection(documentData);
            this.addSimpleItemsTable(documentData.items, documentData.business.currency);
            this.addSimpleTotals(documentData.totals, documentData.business.currency);
            await this.addSimpleFooter(documentData.business, documentData.notes);

            // Add footer with page numbers and username
            const pageCount = this.doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                this.doc.setPage(i);
                this.doc.setFontSize(8);
                this.doc.setTextColor(128, 128, 128);
                this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth - 20, this.pageHeight - 10, { align: 'right' });

                // Add generation info
                const generatedDate = new Date().toLocaleDateString();
                let currentUsername = 'Unknown User';

                // Try to get username from various sources
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
        // Wait for jsPDF to be available
        const checkInterval = setInterval(() => {
            if (ensureJsPDFLoaded() && typeof window.jsPDF !== 'undefined') {
                clearInterval(checkInterval);
                this.ready = true;
                console.log('SimplePDFGenerator ready');
            }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
            if (!this.ready) {
                clearInterval(checkInterval);
                console.error('jsPDF not loaded after 10 seconds');
                // Try one more time to ensure jsPDF
                if (ensureJsPDFLoaded()) {
                    this.ready = true;
                    console.log('SimplePDFGenerator ready (fallback)');
                }
            }
        }, 10000);
    }
}

// Initialize and expose globally
console.log('Loading Simple PDF Generator...');
window.EnhancedPDFGenerator = new SimplePDFGenerator();
console.log('SimplePDFGenerator initialized');

// Wait for jsPDF to be available
function waitForJsPDF() {
    if (typeof window.jsPDF !== 'undefined') {
        console.log('SimplePDFGenerator ready');
        return true;
    }
    return false;
}

// Check if jsPDF is ready
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