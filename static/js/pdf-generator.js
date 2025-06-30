
// Modern Professional PDF Generator with Clean Design
class ModernPDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 25;
        this.currentY = this.margin;
        this.lineHeight = 6;
        this.fontSize = {
            title: 18,
            subtitle: 14,
            header: 12,
            normal: 10,
            small: 9,
            tiny: 8
        };
        this.colors = {
            primary: [33, 37, 41],     // Dark charcoal
            secondary: [108, 117, 125], // Medium gray
            accent: [0, 123, 255],      // Professional blue
            light: [248, 249, 250],     // Very light gray
            border: [222, 226, 230],    // Light border
            success: [40, 167, 69],     // Green
            text: [73, 80, 87]          // Dark gray text
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

    // Add text with proper spacing
    addText(text, x, y, options = {}) {
        const {
            maxWidth = this.pageWidth - (2 * this.margin),
            align = 'left',
            lineSpacing = this.lineHeight
        } = options;

        if (!text) return y;

        const lines = this.doc.splitTextToSize(String(text), maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
            const lineY = y + (i * lineSpacing);
            
            let xPos = x;
            if (align === 'center') {
                xPos = x + (maxWidth / 2) - (this.doc.getTextWidth(lines[i]) / 2);
            } else if (align === 'right') {
                xPos = x + maxWidth - this.doc.getTextWidth(lines[i]);
            }
            
            this.doc.text(lines[i], xPos, lineY);
        }
        
        return y + (lines.length * lineSpacing);
    }

    // Add header section with modern design
    async addModernHeader(businessData) {
        // Header background strip
        this.doc.setFillColor(this.colors.light[0], this.colors.light[1], this.colors.light[2]);
        this.doc.rect(0, 0, this.pageWidth, 50, 'F');
        
        const headerY = this.margin + 5;
        
        // Company logo section
        if (businessData.businessLogoUrl && businessData.businessLogoUrl.trim()) {
            try {
                const logoData = await this.loadImageAsBase64(businessData.businessLogoUrl);
                this.doc.addImage(logoData, 'JPEG', this.margin, headerY, 20, 20);
            } catch (error) {
                console.warn('Failed to load logo:', error);
            }
        }

        // Company information section
        const companyX = this.margin + 25;
        let textY = headerY + 8;
        
        // Company name
        if (businessData.businessName) {
            this.setFont(this.fontSize.title, 'bold', this.colors.primary);
            this.doc.text(businessData.businessName, companyX, textY);
            textY += 8;
        }
        
        // Company details in smaller font
        this.setFont(this.fontSize.small, 'normal', this.colors.secondary);
        
        if (businessData.businessAddress) {
            this.doc.text(businessData.businessAddress, companyX, textY);
            textY += 5;
        }
        
        const contactInfo = [];
        if (businessData.businessPhone) contactInfo.push(`Tel: ${businessData.businessPhone}`);
        if (businessData.businessEmail) contactInfo.push(`Email: ${businessData.businessEmail}`);
        
        if (contactInfo.length > 0) {
            this.doc.text(contactInfo.join(' | '), companyX, textY);
        }
        
        this.currentY = 60; // Fixed header height
    }

    // Add document title section
    addDocumentSection(documentData) {
        const sectionY = this.currentY;
        
        // Document type with modern styling
        this.setFont(this.fontSize.subtitle, 'bold', this.colors.accent);
        const docType = documentData.type.charAt(0).toUpperCase() + 
                       documentData.type.slice(1).replace('_', ' ');
        this.doc.text(docType.toUpperCase(), this.margin, sectionY);
        
        // Document details box - modern card style
        const boxX = this.pageWidth - this.margin - 65;
        const boxY = sectionY - 5;
        const boxWidth = 65;
        const boxHeight = 35;
        
        // Card shadow effect
        this.doc.setFillColor(200, 200, 200);
        this.doc.rect(boxX + 1, boxY + 1, boxWidth, boxHeight, 'F');
        
        // Main card
        this.doc.setFillColor(255, 255, 255);
        this.doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');
        this.doc.setDrawColor(this.colors.border[0], this.colors.border[1], this.colors.border[2]);
        this.doc.setLineWidth(0.5);
        this.doc.rect(boxX, boxY, boxWidth, boxHeight, 'S');
        
        // Document details with better spacing
        let detailY = boxY + 12;
        const padding = 8;
        
        this.setFont(this.fontSize.tiny, 'bold', this.colors.text);
        this.doc.text('DOCUMENT NO.', boxX + padding, detailY);
        
        this.setFont(this.fontSize.small, 'normal', this.colors.primary);
        this.doc.text(documentData.number, boxX + padding, detailY + 6);
        
        detailY += 18;
        this.setFont(this.fontSize.tiny, 'bold', this.colors.text);
        this.doc.text('DATE', boxX + padding, detailY);
        
        this.setFont(this.fontSize.small, 'normal', this.colors.primary);
        const formattedDate = this.formatDate(documentData.date);
        this.doc.text(formattedDate, boxX + padding, detailY + 6);
        
        this.currentY = sectionY + 45;
    }

    // Add client information with modern card design
    addClientSection(clientData) {
        const cardY = this.currentY;
        const cardHeight = 50;
        
        // Client card background
        this.doc.setFillColor(255, 255, 255);
        this.doc.rect(this.margin, cardY, this.pageWidth - (2 * this.margin), cardHeight, 'F');
        this.doc.setDrawColor(this.colors.border[0], this.colors.border[1], this.colors.border[2]);
        this.doc.setLineWidth(0.3);
        this.doc.rect(this.margin, cardY, this.pageWidth - (2 * this.margin), cardHeight, 'S');
        
        // Section title
        this.setFont(this.fontSize.normal, 'bold', this.colors.accent);
        this.doc.text('BILL TO', this.margin + 8, cardY + 12);
        
        // Client details with proper spacing
        let clientY = cardY + 22;
        const clientX = this.margin + 8;
        
        if (clientData.name) {
            this.setFont(this.fontSize.normal, 'bold', this.colors.primary);
            this.doc.text(clientData.name, clientX, clientY);
            clientY += 8;
        }
        
        this.setFont(this.fontSize.small, 'normal', this.colors.text);
        
        if (clientData.address) {
            this.doc.text(clientData.address, clientX, clientY);
            clientY += 6;
        }
        
        const clientContact = [];
        if (clientData.email) clientContact.push(clientData.email);
        if (clientData.phone) clientContact.push(clientData.phone);
        
        if (clientContact.length > 0) {
            this.doc.text(clientContact.join(' | '), clientX, clientY);
        }
        
        this.currentY = cardY + cardHeight + 15;
    }

    // Modern items table with clean design
    addModernItemsTable(items, currency = 'USD') {
        if (!items || items.length === 0) {
            this.setFont(this.fontSize.normal, 'normal', this.colors.secondary);
            this.addText('No items added', this.margin, this.currentY);
            this.currentY += 15;
            return;
        }

        const tableX = this.margin;
        const tableWidth = this.pageWidth - (2 * this.margin);
        
        // Modern column widths for better balance
        const colWidths = {
            description: tableWidth * 0.5,
            quantity: tableWidth * 0.12,
            price: tableWidth * 0.19,
            total: tableWidth * 0.19
        };
        
        const headerHeight = 12;
        const rowHeight = 10;
        const maxItems = 12; // Limit for single page
        
        // Table header with gradient effect
        this.doc.setFillColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.doc.rect(tableX, this.currentY, tableWidth, headerHeight, 'F');
        
        // Header text
        this.setFont(this.fontSize.normal, 'bold', [255, 255, 255]);
        const headers = ['DESCRIPTION', 'QTY', 'UNIT PRICE', 'TOTAL'];
        const headerPositions = [
            tableX + 10, // Description
            tableX + colWidths.description + (colWidths.quantity / 2), // Quantity (centered)
            tableX + colWidths.description + colWidths.quantity + colWidths.price - 10, // Price (right)
            tableX + tableWidth - 10 // Total (right)
        ];
        
        // Add headers with proper alignment
        this.doc.text(headers[0], headerPositions[0], this.currentY + 8);
        
        // Center quantity header
        const qtyWidth = this.doc.getTextWidth(headers[1]);
        this.doc.text(headers[1], headerPositions[1] - (qtyWidth / 2), this.currentY + 8);
        
        // Right align price and total headers
        const priceWidth = this.doc.getTextWidth(headers[2]);
        this.doc.text(headers[2], headerPositions[2] - priceWidth, this.currentY + 8);
        
        const totalWidth = this.doc.getTextWidth(headers[3]);
        this.doc.text(headers[3], headerPositions[3] - totalWidth, this.currentY + 8);
        
        this.currentY += headerHeight;
        
        // Table rows with alternating colors
        this.setFont(this.fontSize.small, 'normal', this.colors.text);
        
        for (let i = 0; i < Math.min(items.length, maxItems); i++) {
            const item = items[i];
            const isOdd = i % 2 === 1;
            
            // Alternating row background
            if (isOdd) {
                this.doc.setFillColor(this.colors.light[0], this.colors.light[1], this.colors.light[2]);
                this.doc.rect(tableX, this.currentY, tableWidth, rowHeight, 'F');
            }
            
            const price = parseFloat(item.price) || 0;
            const quantity = parseFloat(item.quantity) || 0;
            const total = price * quantity;
            
            const rowY = this.currentY + 7;
            
            // Description (left aligned, truncated if needed)
            const maxDescWidth = colWidths.description - 20;
            const descLines = this.doc.splitTextToSize(item.description || 'No description', maxDescWidth);
            this.doc.text(descLines[0], tableX + 10, rowY);
            
            // Quantity (centered)
            const qtyText = quantity.toString();
            const qtyTextWidth = this.doc.getTextWidth(qtyText);
            this.doc.text(qtyText, headerPositions[1] - (qtyTextWidth / 2), rowY);
            
            // Price (right aligned)
            const priceText = this.formatCurrency(price, currency);
            const priceTextWidth = this.doc.getTextWidth(priceText);
            this.doc.text(priceText, headerPositions[2] - priceTextWidth, rowY);
            
            // Total (right aligned)
            const totalText = this.formatCurrency(total, currency);
            const totalTextWidth = this.doc.getTextWidth(totalText);
            this.doc.text(totalText, headerPositions[3] - totalTextWidth, rowY);
            
            // Row separator
            if (i < Math.min(items.length, maxItems) - 1) {
                this.doc.setDrawColor(this.colors.border[0], this.colors.border[1], this.colors.border[2]);
                this.doc.setLineWidth(0.2);
                this.doc.line(tableX, this.currentY + rowHeight, tableX + tableWidth, this.currentY + rowHeight);
            }
            
            this.currentY += rowHeight;
        }
        
        // Table border
        this.doc.setDrawColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.doc.setLineWidth(0.5);
        const tableStartY = this.currentY - (Math.min(items.length, maxItems) * rowHeight);
        this.doc.rect(tableX, tableStartY - headerHeight, tableWidth, headerHeight + (Math.min(items.length, maxItems) * rowHeight), 'S');
        
        this.currentY += 20;
    }

    // Modern totals section
    addModernTotals(totals, currency = 'USD') {
        const totalsX = this.pageWidth - this.margin - 80;
        const totalsWidth = 80;
        const boxHeight = 45;
        
        // Totals card with shadow
        this.doc.setFillColor(240, 240, 240);
        this.doc.rect(totalsX + 1, this.currentY + 1, totalsWidth, boxHeight, 'F');
        
        this.doc.setFillColor(255, 255, 255);
        this.doc.rect(totalsX, this.currentY, totalsWidth, boxHeight, 'F');
        this.doc.setDrawColor(this.colors.border[0], this.colors.border[1], this.colors.border[2]);
        this.doc.setLineWidth(0.3);
        this.doc.rect(totalsX, this.currentY, totalsWidth, boxHeight, 'S');
        
        let totalY = this.currentY + 12;
        const padding = 8;
        
        // Subtotal
        const subtotal = parseFloat(totals.subtotal) || 0;
        this.setFont(this.fontSize.small, 'normal', this.colors.text);
        this.doc.text('Subtotal:', totalsX + padding, totalY);
        
        const subtotalText = this.formatCurrency(subtotal, currency);
        const subtotalWidth = this.doc.getTextWidth(subtotalText);
        this.doc.text(subtotalText, totalsX + totalsWidth - padding - subtotalWidth, totalY);
        totalY += 8;
        
        // Tax if applicable
        if (totals.taxRate > 0) {
            const taxAmount = subtotal * (parseFloat(totals.taxRate) / 100);
            this.doc.text(`Tax (${totals.taxRate}%):`, totalsX + padding, totalY);
            
            const taxText = this.formatCurrency(taxAmount, currency);
            const taxWidth = this.doc.getTextWidth(taxText);
            this.doc.text(taxText, totalsX + totalsWidth - padding - taxWidth, totalY);
            totalY += 8;
        }
        
        // Separator line
        this.doc.setDrawColor(this.colors.accent[0], this.colors.accent[1], this.colors.accent[2]);
        this.doc.setLineWidth(0.5);
        this.doc.line(totalsX + padding, totalY + 2, totalsX + totalsWidth - padding, totalY + 2);
        totalY += 10;
        
        // Grand total with emphasis
        const grandTotal = parseFloat(totals.grandTotal) || 
                          subtotal + (subtotal * (parseFloat(totals.taxRate || 0) / 100));
        
        this.setFont(this.fontSize.header, 'bold', this.colors.accent);
        this.doc.text('TOTAL:', totalsX + padding, totalY);
        
        const totalText = this.formatCurrency(grandTotal, currency);
        const totalWidth = this.doc.getTextWidth(totalText);
        this.doc.text(totalText, totalsX + totalsWidth - padding - totalWidth, totalY);
        
        this.currentY += boxHeight + 15;
    }

    // Modern footer
    async addModernFooter(businessData, notes = '') {
        // Notes section if provided
        if (notes && notes.trim()) {
            const notesY = this.currentY;
            const notesHeight = 25;
            
            // Notes card
            this.doc.setFillColor(this.colors.light[0], this.colors.light[1], this.colors.light[2]);
            this.doc.rect(this.margin, notesY, this.pageWidth - (2 * this.margin), notesHeight, 'F');
            this.doc.setDrawColor(this.colors.border[0], this.colors.border[1], this.colors.border[2]);
            this.doc.setLineWidth(0.3);
            this.doc.rect(this.margin, notesY, this.pageWidth - (2 * this.margin), notesHeight, 'S');
            
            this.setFont(this.fontSize.small, 'bold', this.colors.text);
            this.doc.text('NOTES:', this.margin + 8, notesY + 10);
            
            this.setFont(this.fontSize.small, 'normal', this.colors.text);
            const maxWidth = this.pageWidth - (2 * this.margin) - 16;
            const noteLines = this.doc.splitTextToSize(notes, maxWidth);
            
            // Limit to 2 lines
            for (let i = 0; i < noteLines.length && i < 2; i++) {
                this.doc.text(noteLines[i], this.margin + 8, notesY + 16 + (i * 5));
            }
            
            this.currentY += notesHeight + 10;
        }
        
        // Footer line
        const footerY = this.pageHeight - 25;
        this.doc.setDrawColor(this.colors.border[0], this.colors.border[1], this.colors.border[2]);
        this.doc.setLineWidth(0.3);
        this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);
        
        // Footer text
        this.setFont(this.fontSize.tiny, 'normal', this.colors.secondary);
        
        // Company name on left
        if (businessData.businessName) {
            this.doc.text(businessData.businessName, this.margin, footerY + 8);
        }
        
        // Page number on right
        const pageText = `Page 1`;
        const pageWidth = this.doc.getTextWidth(pageText);
        this.doc.text(pageText, this.pageWidth - this.margin - pageWidth, footerY + 8);
        
        // Thank you message centered
        const thankYou = 'Thank you for your business!';
        const thankYouWidth = this.doc.getTextWidth(thankYou);
        this.doc.text(thankYou, (this.pageWidth / 2) - (thankYouWidth / 2), footerY + 8);
    }

    // Generate complete PDF with modern design
    async generatePDF(documentData) {
        try {
            this.initializeDocument();
            
            // Set document properties
            this.doc.setProperties({
                title: `${documentData.type} ${documentData.number}`,
                subject: documentData.type,
                author: documentData.business.businessName || 'Business Documents Generator',
                creator: 'Modern PDF Generator'
            });
            
            // Add modern header
            await this.addModernHeader(documentData.business);
            
            // Add document section
            this.addDocumentSection(documentData);
            
            // Add client information
            this.addClientSection(documentData.client);
            
            // Add items table
            this.addModernItemsTable(documentData.items, documentData.business.currency);
            
            // Add totals
            this.addModernTotals(documentData.totals, documentData.business.currency);
            
            // Add footer
            await this.addModernFooter(documentData.business, documentData.notes);
            
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
console.log('Loading Modern PDF Generator...');
window.EnhancedPDFGenerator = new ModernPDFGenerator();
console.log('ModernPDFGenerator initialized');

// Wait for jsPDF to be available
function waitForJsPDF() {
    if (typeof window.jsPDF !== 'undefined') {
        console.log('ModernPDFGenerator ready');
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
