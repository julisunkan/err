// Simple Receipt PDF Generator - Black and White Design
class SimplePDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.currentY = this.margin;
        this.lineHeight = 6;
        this.fontSize = {
            title: 16,
            subtitle: 12,
            normal: 10,
            small: 9
        };
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

    // Add simple header with logo support
    async addSimpleHeader(businessData) {
        let headerY = this.currentY;
        let logoAdded = false;

        // Add business logo if available
        if (businessData.businessLogoUrl && businessData.businessLogoUrl.trim()) {
            try {
                const logoData = await this.loadImage(businessData.businessLogoUrl);
                if (logoData) {
                    const logoSize = 25; // Logo size in mm
                    const logoX = this.pageWidth - this.margin - logoSize;

                    this.doc.addImage(logoData, 'JPEG', logoX, headerY, logoSize, logoSize);
                    logoAdded = true;
                }
            } catch (error) {
                console.warn('Failed to add logo:', error);
            }
        }

        // Company name - left aligned to avoid logo overlap
        if (businessData.businessName) {
            this.setFont(this.fontSize.title, 'bold');
            const maxNameWidth = logoAdded ? this.pageWidth - (2 * this.margin) - 30 : this.pageWidth - (2 * this.margin);
            const nameLines = this.doc.splitTextToSize(businessData.businessName, maxNameWidth);

            for (let i = 0; i < nameLines.length; i++) {
                this.doc.text(nameLines[i], this.margin, headerY + (i * 8));
            }
            headerY += (nameLines.length * 8) + 5;
        }

        // Adjust headerY if logo was added
        if (logoAdded) {
            headerY = Math.max(headerY, this.currentY + 30);
        }

        // Company details - left aligned with proper spacing
        this.setFont(this.fontSize.small, 'normal');

        if (businessData.businessAddress) {
            const maxAddressWidth = this.pageWidth - (2 * this.margin);
            const addressLines = this.doc.splitTextToSize(businessData.businessAddress, maxAddressWidth);

            for (let i = 0; i < addressLines.length; i++) {
                this.doc.text(addressLines[i], this.margin, headerY + (i * 5));
            }
            headerY += (addressLines.length * 5) + 3;
        }

        if (businessData.businessPhone || businessData.businessEmail) {
            const contactInfo = [];
            if (businessData.businessPhone) contactInfo.push(`Tel: ${businessData.businessPhone}`);
            if (businessData.businessEmail) contactInfo.push(`Email: ${businessData.businessEmail}`);

            this.doc.text(contactInfo.join(' | '), this.margin, headerY);
            headerY += 6;
        }

        // Add separator line
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, headerY + 5, this.pageWidth - this.margin, headerY + 5);

        this.currentY = headerY + 15;
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

    // Add client information
    addClientSection(clientData) {
        this.setFont(this.fontSize.normal, 'bold');
        this.doc.text('BILL TO:', this.margin, this.currentY);
        this.currentY += 8;

        this.setFont(this.fontSize.normal, 'normal');

        if (clientData.name) {
            this.setFont(this.fontSize.normal, 'bold');
            this.doc.text(clientData.name, this.margin, this.currentY);
            this.currentY += 6;
            this.setFont(this.fontSize.normal, 'normal');
        }

        if (clientData.address) {
            const maxAddressWidth = this.pageWidth - (2 * this.margin);
            const addressLines = this.doc.splitTextToSize(clientData.address, maxAddressWidth);

            for (let i = 0; i < addressLines.length; i++) {
                this.doc.text(addressLines[i], this.margin, this.currentY + (i * 5));
            }
            this.currentY += (addressLines.length * 5);
        }

        if (clientData.email || clientData.phone) {
            const clientContact = [];
            if (clientData.email) clientContact.push(clientData.email);
            if (clientData.phone) clientContact.push(clientData.phone);

            this.doc.text(clientContact.join(' | '), this.margin, this.currentY);
            this.currentY += 6;
        }

        this.currentY += 10;
    }

    // Structured items table with container-based layout
    addSimpleItemsTable(items, currency = 'USD') {
        if (!items || items.length === 0) {
            this.setFont(this.fontSize.normal, 'normal');
            this.doc.text('No items added', this.margin, this.currentY);
            this.currentY += 15;
            return;
        }

        const tableX = this.margin;
        const tableWidth = this.pageWidth - (2 * this.margin);
        const rowHeight = 8;

        // Define column structure with fixed widths
        const columns = [
            { name: 'DESCRIPTION', width: tableWidth * 0.50, align: 'left' },
            { name: 'QTY', width: tableWidth * 0.15, align: 'center' },
            { name: 'PRICE', width: tableWidth * 0.17, align: 'right' },
            { name: 'TOTAL', width: tableWidth * 0.18, align: 'right' }
        ];

        // Calculate column positions
        let currentX = tableX;
        columns.forEach(col => {
            col.x = currentX;
            currentX += col.width;
        });

        // Draw table container
        this.doc.setLineWidth(0.5);
        this.doc.rect(tableX, this.currentY - 2, tableWidth, (items.length + 1) * rowHeight + 8);

        // Table header with background
        this.setFont(this.fontSize.normal, 'bold');
        const headerY = this.currentY + 3;

        // Header background
        this.doc.setFillColor(240, 240, 240);
        this.doc.rect(tableX, headerY - 4, tableWidth, rowHeight, 'F');

        // Draw vertical lines for columns
        let lineX = tableX;
        for (let i = 0; i < columns.length; i++) {
            if (i > 0) {
                this.doc.line(lineX, this.currentY - 2, lineX, this.currentY + (items.length + 1) * rowHeight + 6);
            }
            lineX += columns[i].width;
        }

        // Header text
        columns.forEach(col => {
            let textX = col.x + 2; // Left padding
            if (col.align === 'center') {
                textX = col.x + (col.width / 2);
            } else if (col.align === 'right') {
                textX = col.x + col.width - 2; // Right padding
            }

            this.doc.text(col.name, textX, headerY, { align: col.align === 'center' ? 'center' : (col.align === 'right' ? 'right' : 'left') });
        });

        // Header separator line
        this.doc.setLineWidth(0.8);
        this.doc.line(tableX, headerY + 4, tableX + tableWidth, headerY + 4);

        this.currentY = headerY + rowHeight + 2;

        // Table rows
        this.setFont(this.fontSize.small, 'normal');

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const price = parseFloat(item.price) || 0;
            const quantity = parseFloat(item.quantity) || 0;
            const total = price * quantity;

            const rowY = this.currentY;

            // Alternate row background
            if (i % 2 === 1) {
                this.doc.setFillColor(248, 248, 248);
                this.doc.rect(tableX, rowY - 3, tableWidth, rowHeight, 'F');
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
                let textX = col.x + 2; // Left padding

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

                // Adjust text position based on alignment
                if (col.align === 'center') {
                    textX = col.x + (col.width / 2);
                    const textWidth = this.doc.getTextWidth(text);
                    textX -= textWidth / 2;
                } else if (col.align === 'right') {
                    textX = col.x + col.width - 2 - this.doc.getTextWidth(text);
                }

                this.doc.text(text, textX, rowY);
            });

            this.currentY += rowHeight;
        }

        // Final table border
        this.doc.setLineWidth(0.5);
        this.doc.line(tableX, this.currentY + 2, tableX + tableWidth, this.currentY + 2);

        this.currentY += 15;
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
            const taxAmount = subtotal * (parseFloat(totals.taxRate) / 100);
            this.doc.text(`Tax (${totals.taxRate}%):`, labelX, this.currentY);
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

    // Simple footer with signature image support
    async addSimpleFooter(businessData, notes = '') {
        // Notes section if provided
        if (notes && notes.trim()) {
            this.setFont(this.fontSize.small, 'bold');
            this.doc.text('NOTES:', this.margin, this.currentY);
            this.currentY += 6;

            this.setFont(this.fontSize.small, 'normal');
            const maxWidth = this.pageWidth - (2 * this.margin);
            const noteLines = this.doc.splitTextToSize(notes, maxWidth);

            // Limit to 3 lines
            for (let i = 0; i < noteLines.length && i < 3; i++) {
                this.doc.text(noteLines[i], this.margin, this.currentY);
                this.currentY += 6;
            }

            this.currentY += 10;
        }

        // Signature section with image support
        if (businessData.signatureUrl && businessData.signatureUrl.trim()) {
            this.setFont(this.fontSize.small, 'bold');
            this.doc.text('Authorized Signature:', this.margin, this.currentY);
            this.currentY += 10;

            try {
                const signatureData = await this.loadImage(businessData.signatureUrl);
                if (signatureData) {
                    // Add signature image
                    const signatureWidth = 40;
                    const signatureHeight = 20;
                    this.doc.addImage(signatureData, 'JPEG', this.margin, this.currentY, signatureWidth, signatureHeight);
                    this.currentY += signatureHeight + 5;
                } else {
                    // Fallback to signature line if image fails
                    this.doc.setLineWidth(0.5);
                    this.doc.line(this.margin, this.currentY, this.margin + 60, this.currentY);
                    this.currentY += 15;
                }
            } catch (error) {
                console.warn('Failed to add signature:', error);
                // Fallback to signature line
                this.doc.setLineWidth(0.5);
                this.doc.line(this.margin, this.currentY, this.margin + 60, this.currentY);
                this.currentY += 15;
            }
        }

        // Footer line
        const footerY = this.pageHeight - 20;
        this.doc.setLineWidth(0.3);
        this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);

        // Footer text
        this.setFont(this.fontSize.small, 'normal');

        // Thank you message centered
        const thankYou = 'Thank you for your patronage!';
        this.doc.text(thankYou, this.pageWidth / 2, footerY + 8, { align: 'center' });
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
                creator: 'Simple PDF Generator'
            });

            // Add sections
            await this.addSimpleHeader(documentData.business);
            this.addDocumentSection(documentData);
            this.addClientSection(documentData.client);
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

                // Add generation info with username (requirement #5)
                const generatedDate = new Date().toLocaleDateString();
                const currentUsername = sessionStorage.getItem('current_username') || 'Unknown User';
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

// Check if jsPDF is ready, otherwise wait
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