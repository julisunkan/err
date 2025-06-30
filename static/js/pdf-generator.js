
// Enhanced PDF Generator with better formatting and features
class EnhancedPDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.currentY = this.margin;
        this.lineHeight = 7;
        this.fontSize = {
            title: 20,
            subtitle: 16,
            header: 14,
            normal: 10,
            small: 8
        };
        this.colors = {
            primary: [41, 128, 185],
            secondary: [52, 73, 94],
            success: [39, 174, 96],
            danger: [231, 76, 60],
            warning: [241, 196, 15],
            light: [236, 240, 241],
            dark: [44, 62, 80]
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
    setFont(size, style = 'normal', color = [0, 0, 0]) {
        this.doc.setFontSize(size);
        this.doc.setFont('helvetica', style);
        this.doc.setTextColor(color[0], color[1], color[2]);
    }

    // Add text with word wrapping
    addText(text, x, y, maxWidth = null, align = 'left') {
        if (!maxWidth) {
            maxWidth = this.pageWidth - (2 * this.margin);
        }

        const lines = this.doc.splitTextToSize(text, maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
            if (y + (i * this.lineHeight) > this.pageHeight - this.margin) {
                this.addNewPage();
                y = this.currentY;
            }
            
            let xPos = x;
            if (align === 'center') {
                xPos = x + (maxWidth / 2) - (this.doc.getTextWidth(lines[i]) / 2);
            } else if (align === 'right') {
                xPos = x + maxWidth - this.doc.getTextWidth(lines[i]);
            }
            
            this.doc.text(lines[i], xPos, y + (i * this.lineHeight));
        }
        
        return y + (lines.length * this.lineHeight);
    }

    // Add new page
    addNewPage() {
        this.doc.addPage();
        this.currentY = this.margin;
    }

    // Add business header with logo
    async addBusinessHeader(businessData) {
        const headerHeight = 40;
        
        // Company logo (if provided)
        if (businessData.businessLogoUrl) {
            try {
                const logoData = await this.loadImageAsBase64(businessData.businessLogoUrl);
                this.doc.addImage(logoData, 'JPEG', this.margin, this.currentY, 30, 20);
            } catch (error) {
                console.warn('Failed to load logo:', error);
            }
        }

        // Company information
        const companyX = this.margin + 35;
        this.setFont(this.fontSize.title, 'bold', this.colors.primary);
        this.currentY += 5;
        this.currentY = this.addText(businessData.businessName || 'Your Business', companyX, this.currentY);
        
        this.setFont(this.fontSize.small, 'normal', this.colors.secondary);
        this.currentY += 2;
        
        if (businessData.businessAddress) {
            this.currentY = this.addText(businessData.businessAddress, companyX, this.currentY);
        }
        
        if (businessData.businessPhone) {
            this.currentY = this.addText(`Phone: ${businessData.businessPhone}`, companyX, this.currentY);
        }
        
        if (businessData.businessEmail) {
            this.currentY = this.addText(`Email: ${businessData.businessEmail}`, companyX, this.currentY);
        }

        this.currentY = Math.max(this.currentY, this.margin + headerHeight);
    }

    // Add document title section
    addDocumentTitle(documentData) {
        const titleY = this.currentY + 10;
        
        // Document type title
        this.setFont(this.fontSize.title, 'bold', this.colors.primary);
        const docType = documentData.type.charAt(0).toUpperCase() + documentData.type.slice(1).replace('_', ' ');
        this.addText(docType, this.pageWidth - this.margin, titleY, null, 'right');
        
        // Document details box
        const boxX = this.pageWidth - this.margin - 60;
        const boxY = titleY + 10;
        const boxWidth = 60;
        const boxHeight = 30;
        
        // Draw box
        this.doc.setFillColor(this.colors.light[0], this.colors.light[1], this.colors.light[2]);
        this.doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');
        this.doc.setDrawColor(this.colors.secondary[0], this.colors.secondary[1], this.colors.secondary[2]);
        this.doc.rect(boxX, boxY, boxWidth, boxHeight, 'S');
        
        // Add document details
        this.setFont(this.fontSize.small, 'bold', this.colors.dark);
        this.addText('Document #:', boxX + 2, boxY + 5);
        this.setFont(this.fontSize.small, 'normal', this.colors.dark);
        this.addText(documentData.number, boxX + 2, boxY + 10);
        
        this.setFont(this.fontSize.small, 'bold', this.colors.dark);
        this.addText('Date:', boxX + 2, boxY + 18);
        this.setFont(this.fontSize.small, 'normal', this.colors.dark);
        this.addText(this.formatDate(documentData.date), boxX + 2, boxY + 23);
        
        this.currentY = boxY + boxHeight + 10;
    }

    // Add client information
    addClientInfo(clientData) {
        this.setFont(this.fontSize.header, 'bold', this.colors.primary);
        this.currentY = this.addText('Bill To:', this.margin, this.currentY);
        this.currentY += 5;
        
        this.setFont(this.fontSize.normal, 'bold', this.colors.dark);
        if (clientData.name) {
            this.currentY = this.addText(clientData.name, this.margin, this.currentY);
        }
        
        this.setFont(this.fontSize.normal, 'normal', this.colors.dark);
        if (clientData.address) {
            this.currentY = this.addText(clientData.address, this.margin, this.currentY);
        }
        
        if (clientData.email) {
            this.currentY = this.addText(`Email: ${clientData.email}`, this.margin, this.currentY);
        }
        
        if (clientData.phone) {
            this.currentY = this.addText(`Phone: ${clientData.phone}`, this.margin, this.currentY);
        }
        
        this.currentY += 10;
    }

    // Add items table
    addItemsTable(items, currency = 'USD') {
        const tableX = this.margin;
        const tableWidth = this.pageWidth - (2 * this.margin);
        const colWidths = [tableWidth * 0.5, tableWidth * 0.15, tableWidth * 0.175, tableWidth * 0.175];
        const headerHeight = 8;
        const rowHeight = 6;
        
        // Table header
        this.doc.setFillColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.doc.rect(tableX, this.currentY, tableWidth, headerHeight, 'F');
        
        this.setFont(this.fontSize.normal, 'bold', [255, 255, 255]);
        const headers = ['Description', 'Qty', 'Price', 'Total'];
        let currentX = tableX;
        
        for (let i = 0; i < headers.length; i++) {
            this.addText(headers[i], currentX + 2, this.currentY + 5, colWidths[i] - 4, 'left');
            currentX += colWidths[i];
        }
        
        this.currentY += headerHeight;
        
        // Table rows
        this.setFont(this.fontSize.normal, 'normal', this.colors.dark);
        let isAlternate = false;
        
        for (const item of items) {
            // Check if we need a new page
            if (this.currentY + rowHeight > this.pageHeight - 60) {
                this.addNewPage();
                // Redraw header on new page
                this.doc.setFillColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
                this.doc.rect(tableX, this.currentY, tableWidth, headerHeight, 'F');
                this.setFont(this.fontSize.normal, 'bold', [255, 255, 255]);
                currentX = tableX;
                for (let i = 0; i < headers.length; i++) {
                    this.addText(headers[i], currentX + 2, this.currentY + 5, colWidths[i] - 4, 'left');
                    currentX += colWidths[i];
                }
                this.currentY += headerHeight;
                this.setFont(this.fontSize.normal, 'normal', this.colors.dark);
                isAlternate = false;
            }
            
            // Alternate row background
            if (isAlternate) {
                this.doc.setFillColor(248, 249, 250);
                this.doc.rect(tableX, this.currentY, tableWidth, rowHeight, 'F');
            }
            
            // Row data
            currentX = tableX;
            const rowData = [
                item.description || '',
                item.quantity?.toString() || '0',
                this.formatCurrency(item.price || 0, currency),
                this.formatCurrency(item.total || 0, currency)
            ];
            
            for (let i = 0; i < rowData.length; i++) {
                const align = i > 0 ? 'right' : 'left';
                this.addText(rowData[i], currentX + 2, this.currentY + 4, colWidths[i] - 4, align);
                currentX += colWidths[i];
            }
            
            // Row border
            this.doc.setDrawColor(200, 200, 200);
            this.doc.line(tableX, this.currentY + rowHeight, tableX + tableWidth, this.currentY + rowHeight);
            
            this.currentY += rowHeight;
            isAlternate = !isAlternate;
        }
        
        // Table border
        this.doc.setDrawColor(this.colors.secondary[0], this.colors.secondary[1], this.colors.secondary[2]);
        this.doc.rect(tableX, this.currentY - (items.length * rowHeight + headerHeight), tableWidth, items.length * rowHeight + headerHeight, 'S');
        
        this.currentY += 10;
    }

    // Add totals section
    addTotals(totals, currency = 'USD') {
        const totalsX = this.pageWidth - this.margin - 60;
        const totalsWidth = 60;
        
        // Subtotal
        this.setFont(this.fontSize.normal, 'normal', this.colors.dark);
        this.addText('Subtotal:', totalsX, this.currentY, totalsWidth * 0.6, 'left');
        this.addText(this.formatCurrency(totals.subtotal, currency), totalsX + (totalsWidth * 0.6), this.currentY, totalsWidth * 0.4, 'right');
        this.currentY += this.lineHeight;
        
        // Tax
        if (totals.taxRate > 0) {
            this.addText(`Tax (${totals.taxRate}%):`, totalsX, this.currentY, totalsWidth * 0.6, 'left');
            this.addText(this.formatCurrency(totals.taxAmount, currency), totalsX + (totalsWidth * 0.6), this.currentY, totalsWidth * 0.4, 'right');
            this.currentY += this.lineHeight;
        }
        
        // Total line
        this.doc.setDrawColor(this.colors.dark[0], this.colors.dark[1], this.colors.dark[2]);
        this.doc.line(totalsX, this.currentY, totalsX + totalsWidth, this.currentY);
        this.currentY += 2;
        
        // Grand total
        this.setFont(this.fontSize.header, 'bold', this.colors.primary);
        this.addText('Total:', totalsX, this.currentY, totalsWidth * 0.6, 'left');
        this.addText(this.formatCurrency(totals.grandTotal, currency), totalsX + (totalsWidth * 0.6), this.currentY, totalsWidth * 0.4, 'right');
        
        this.currentY += 15;
    }

    // Add footer with signature
    async addFooter(businessData, notes = '') {
        // Move to bottom of page if needed
        if (this.currentY < this.pageHeight - 60) {
            this.currentY = this.pageHeight - 60;
        }
        
        // Notes section
        if (notes) {
            this.setFont(this.fontSize.normal, 'bold', this.colors.dark);
            this.currentY = this.addText('Notes:', this.margin, this.currentY);
            this.setFont(this.fontSize.small, 'normal', this.colors.dark);
            this.currentY = this.addText(notes, this.margin, this.currentY);
            this.currentY += 10;
        }
        
        // Signature section
        if (businessData.signatureUrl) {
            this.setFont(this.fontSize.normal, 'bold', this.colors.dark);
            this.currentY = this.addText('Authorized Signature:', this.margin, this.currentY);
            this.currentY += 5;
            
            try {
                const signatureData = await this.loadImageAsBase64(businessData.signatureUrl);
                this.doc.addImage(signatureData, 'JPEG', this.margin, this.currentY, 40, 15);
            } catch (error) {
                console.warn('Failed to load signature:', error);
            }
        }
        
        // Footer line
        this.doc.setDrawColor(this.colors.light[0], this.colors.light[1], this.colors.light[2]);
        this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);
        
        // Page number
        this.setFont(this.fontSize.small, 'normal', this.colors.secondary);
        const pageText = `Page ${this.doc.internal.getNumberOfPages()}`;
        this.addText(pageText, this.pageWidth - this.margin, this.pageHeight - 10, null, 'right');
    }

    // Generate complete PDF
    async generatePDF(documentData) {
        try {
            this.initializeDocument();
            
            // Add header
            await this.addBusinessHeader(documentData.business);
            
            // Add document title
            this.addDocumentTitle(documentData);
            
            // Add client info
            this.addClientInfo(documentData.client);
            
            // Add items table
            this.addItemsTable(documentData.items, documentData.business.currency);
            
            // Add totals
            this.addTotals(documentData.totals, documentData.business.currency);
            
            // Add footer
            await this.addFooter(documentData.business, documentData.notes);
            
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
            return filename;
        } catch (error) {
            console.error('Error downloading PDF:', error);
            throw error;
        }
    }

    // Helper: Load image as base64
    loadImageAsBase64(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataURL);
            };
            img.onerror = function() {
                reject(new Error('Failed to load image'));
            };
            img.src = url;
        });
    }

    // Helper: Format currency
    formatCurrency(amount, currency = 'USD') {
        try {
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
            });
            return formatter.format(amount);
        } catch (error) {
            // Fallback for unsupported currencies
            const symbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'NGN': '₦',
                'CAD': 'C$',
                'AUD': 'A$'
            };
            const symbol = symbols[currency] || currency;
            return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    }

    // Helper: Format date
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }
}

// Initialize and expose globally
console.log('Loading Enhanced PDF Generator...');
window.EnhancedPDFGenerator = new EnhancedPDFGenerator();
console.log('EnhancedPDFGenerator initialized');

// Wait for jsPDF to be available
function waitForJsPDF() {
    if (typeof window.jsPDF !== 'undefined') {
        console.log('EnhancedPDFGenerator ready');
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
