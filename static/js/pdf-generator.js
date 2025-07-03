
// Modern Business Documents PDF Generator - Colorful Professional Design
// PDF Generator using jsPDF - Version 3.0
console.log('Loading Modern PDF Generator v3.0...');

// Ensure jsPDF is available
function ensureJsPDFLoaded() {
    if (typeof window.jsPDF === 'undefined' && typeof window.jspdf !== 'undefined') {
        window.jsPDF = window.jspdf.jsPDF;
    }
    return typeof window.jsPDF !== 'undefined';
}

class ModernPDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.currentY = this.margin;
        this.lineHeight = 6;
        this.fontSize = {
            title: 22,
            subtitle: 16,
            normal: 10,
            small: 8
        };
        this.colors = {
            primary: [41, 128, 185],     // Professional blue
            secondary: [52, 152, 219],   // Light blue
            accent: [230, 126, 34],      // Orange
            success: [39, 174, 96],      // Green
            dark: [44, 62, 80],          // Dark blue-gray
            light: [236, 240, 241],      // Light gray
            white: [255, 255, 255],
            text: [33, 37, 41]
        };
        console.log('Modern PDF Generator v3.0 initialized');
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
    setFont(size, style = 'normal', color = this.colors.text) {
        this.doc.setFontSize(size);
        this.doc.setFont('helvetica', style);
        this.doc.setTextColor(color[0], color[1], color[2]);
    }

    // Add colored rectangle
    addColoredRect(x, y, width, height, color, opacity = 1) {
        this.doc.setFillColor(color[0], color[1], color[2]);
        if (opacity < 1) {
            this.doc.setGState(new this.doc.GState({opacity: opacity}));
        }
        this.doc.rect(x, y, width, height, 'F');
        if (opacity < 1) {
            this.doc.setGState(new this.doc.GState({opacity: 1}));
        }
    }

    // Add gradient-like effect with multiple rectangles
    addGradientEffect(x, y, width, height, startColor, endColor) {
        const steps = 20;
        const stepHeight = height / steps;
        
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * ratio);
            const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * ratio);
            const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * ratio);
            
            this.doc.setFillColor(r, g, b);
            this.doc.rect(x, y + (i * stepHeight), width, stepHeight, 'F');
        }
    }

    // Add text with proper spacing
    addText(text, x, y, options = {}) {
        const {
            maxWidth = this.pageWidth - (2 * this.margin),
            align = 'left',
            color = this.colors.text
        } = options;

        if (!text) return y;

        this.doc.setTextColor(color[0], color[1], color[2]);
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
                    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
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

    // Add modern header with colorful design
    async addModernHeader(businessData) {
        const headerHeight = 50;
        
        // Add colorful header background with gradient effect
        this.addGradientEffect(0, 0, this.pageWidth, headerHeight, this.colors.primary, this.colors.secondary);
        
        // Add decorative accent strip
        this.addColoredRect(0, headerHeight - 4, this.pageWidth, 4, this.colors.accent);
        
        let logoAdded = false;
        let logoWidth = 0;

        // Add business logo if available
        if (businessData.businessLogoUrl && businessData.businessLogoUrl.trim()) {
            try {
                const logoData = await this.loadImage(businessData.businessLogoUrl);
                if (logoData) {
                    const logoSize = 35;
                    logoWidth = logoSize + 10;
                    const logoX = this.pageWidth - this.margin - logoSize;
                    const logoY = 8;

                    // Add white background circle for logo
                    this.doc.setFillColor(255, 255, 255);
                    this.doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 2, 'F');
                    
                    this.doc.addImage(logoData, 'JPEG', logoX, logoY, logoSize, logoSize);
                    logoAdded = true;
                }
            } catch (error) {
                console.warn('Failed to add logo:', error);
            }
        }

        // Company name with modern styling
        if (businessData.businessName) {
            this.setFont(this.fontSize.title, 'bold', this.colors.white);
            const maxNameWidth = this.pageWidth - (2 * this.margin) - logoWidth;
            const nameY = 20;
            
            // Add shadow effect for company name
            this.doc.setTextColor(0, 0, 0, 0.3);
            this.doc.text(businessData.businessName, this.margin + 1, nameY + 1);
            
            // Add main company name
            this.doc.setTextColor(255, 255, 255);
            this.doc.text(businessData.businessName, this.margin, nameY);
        }

        // Company tagline/subtitle area
        this.setFont(this.fontSize.normal, 'normal', this.colors.white);
        this.doc.text('Professional Business Documents', this.margin, 35);

        this.currentY = headerHeight + 15;

        // Add contact information in a modern info box
        const infoBoxY = this.currentY;
        const infoBoxHeight = 25;
        
        // Light background for contact info
        this.addColoredRect(this.margin, infoBoxY, this.pageWidth - (2 * this.margin), infoBoxHeight, this.colors.light);
        
        // Contact information with icons (using text symbols)
        this.setFont(this.fontSize.small, 'normal', this.colors.dark);
        let infoY = infoBoxY + 8;
        
        if (businessData.businessAddress) {
            this.doc.text('📍 ' + businessData.businessAddress, this.margin + 5, infoY);
            infoY += 6;
        }
        
        if (businessData.businessPhone || businessData.businessEmail) {
            let contactLine = '';
            if (businessData.businessPhone) {
                contactLine += '📞 ' + businessData.businessPhone;
            }
            if (businessData.businessEmail) {
                if (contactLine) contactLine += '    ';
                contactLine += '✉ ' + businessData.businessEmail;
            }
            this.doc.text(contactLine, this.margin + 5, infoY);
        }

        this.currentY = infoBoxY + infoBoxHeight + 15;
    }

    // Add modern document section with colorful design
    addModernDocumentSection(documentData) {
        const sectionY = this.currentY;
        const sectionHeight = 35;
        
        // Get document type color
        const docColors = {
            'invoice': this.colors.success,
            'receipt': this.colors.primary,
            'quotation': this.colors.accent,
            'purchase_order': this.colors.secondary
        };
        
        const docColor = docColors[documentData.type] || this.colors.primary;
        
        // Add colored section background
        this.addColoredRect(this.margin, sectionY, this.pageWidth - (2 * this.margin), sectionHeight, docColor, 0.1);
        
        // Add colored left border
        this.addColoredRect(this.margin, sectionY, 5, sectionHeight, docColor);
        
        // Document type with modern styling
        this.setFont(this.fontSize.subtitle, 'bold', docColor);
        const docType = documentData.type.charAt(0).toUpperCase() + 
                       documentData.type.slice(1).replace('_', ' ');
        this.doc.text(docType.toUpperCase(), this.margin + 15, sectionY + 12);
        
        // Document details in right column
        const rightX = this.pageWidth - this.margin - 5;
        this.setFont(this.fontSize.normal, 'bold', this.colors.dark);
        
        // Document number with styling
        const docNumberText = `# ${documentData.number}`;
        const docNumberWidth = this.doc.getTextWidth(docNumberText);
        this.doc.text(docNumberText, rightX - docNumberWidth, sectionY + 12);
        
        // Date
        this.setFont(this.fontSize.small, 'normal', this.colors.dark);
        const formattedDate = this.formatDate(documentData.date);
        const dateWidth = this.doc.getTextWidth(formattedDate);
        this.doc.text(formattedDate, rightX - dateWidth, sectionY + 22);

        this.currentY = sectionY + sectionHeight + 15;
    }

    // Add modern client section
    addModernClientSection(clientData) {
        // Modern "Bill To" header
        this.setFont(this.fontSize.subtitle, 'bold', this.colors.primary);
        this.doc.text('BILL TO', this.margin, this.currentY);
        
        // Add decorative line under header
        this.doc.setLineWidth(2);
        this.doc.setDrawColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.doc.line(this.margin, this.currentY + 3, this.margin + 40, this.currentY + 3);
        
        this.currentY += 15;

        // Client information in a modern card-like design
        const cardY = this.currentY;
        const cardHeight = 30;
        
        // Card background
        this.addColoredRect(this.margin, cardY, 85, cardHeight, this.colors.light);
        
        // Card border
        this.doc.setLineWidth(0.5);
        this.doc.setDrawColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.doc.rect(this.margin, cardY, 85, cardHeight);
        
        // Client information
        let clientY = cardY + 8;
        
        if (clientData.name) {
            this.setFont(this.fontSize.normal, 'bold', this.colors.dark);
            this.doc.text(clientData.name, this.margin + 5, clientY);
            clientY += 7;
        }
        
        if (clientData.address) {
            this.setFont(this.fontSize.small, 'normal', this.colors.text);
            const addressLines = this.doc.splitTextToSize(clientData.address, 75);
            for (let i = 0; i < Math.min(addressLines.length, 2); i++) {
                this.doc.text(addressLines[i], this.margin + 5, clientY);
                clientY += 5;
            }
        }
        
        if (clientData.phone || clientData.email) {
            this.setFont(this.fontSize.small, 'normal', this.colors.text);
            if (clientData.phone) {
                this.doc.text('📞 ' + clientData.phone, this.margin + 5, clientY);
                clientY += 5;
            }
            if (clientData.email && clientY < cardY + cardHeight - 3) {
                this.doc.text('✉ ' + clientData.email, this.margin + 5, clientY);
            }
        }

        this.currentY = cardY + cardHeight + 20;
    }

    // Add modern items table with colorful design
    addModernItemsTable(items, currency = 'USD') {
        if (!items || items.length === 0) {
            this.setFont(this.fontSize.normal, 'normal');
            this.doc.text('No items added', this.margin, this.currentY);
            this.currentY += 15;
            return;
        }

        const tableX = this.margin;
        const tableWidth = this.pageWidth - (2 * this.margin);
        const rowHeight = 12;
        const headerHeight = 15;

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

        // Modern table header with gradient
        const headerY = this.currentY;
        this.addGradientEffect(tableX, headerY, tableWidth, headerHeight, this.colors.dark, this.colors.primary);
        
        // Header text with white color
        this.setFont(this.fontSize.normal, 'bold', this.colors.white);
        columns.forEach(col => {
            let textX = col.x + 5;
            if (col.align === 'center') {
                textX = col.x + (col.width / 2) - (this.doc.getTextWidth(col.name) / 2);
            } else if (col.align === 'right') {
                textX = col.x + col.width - 5 - this.doc.getTextWidth(col.name);
            }
            this.doc.text(col.name, textX, headerY + 10);
        });

        // Column separators in header
        this.doc.setLineWidth(1);
        this.doc.setDrawColor(255, 255, 255);
        let lineX = tableX;
        for (let i = 1; i < columns.length; i++) {
            lineX += columns[i-1].width;
            this.doc.line(lineX, headerY + 2, lineX, headerY + headerHeight - 2);
        }

        this.currentY = headerY + headerHeight;

        // Table rows with alternating colors
        this.setFont(this.fontSize.normal, 'normal', this.colors.text);

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const price = parseFloat(item.price) || 0;
            const quantity = parseFloat(item.quantity) || 0;
            const total = price * quantity;
            const rowY = this.currentY;

            // Alternating row colors
            if (i % 2 === 0) {
                this.addColoredRect(tableX, rowY, tableWidth, rowHeight, this.colors.light, 0.3);
            }

            // Row border
            this.doc.setLineWidth(0.2);
            this.doc.setDrawColor(200, 200, 200);
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
                let textX = col.x + 5;

                // Truncate description if too long
                if (colIndex === 0) {
                    const maxWidth = col.width - 10;
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
                    textX = col.x + col.width - 5 - this.doc.getTextWidth(text);
                }

                this.doc.text(text, textX, rowY + 8);
            });

            this.currentY += rowHeight;
        }

        this.currentY += 15;
    }

    // Add modern totals section
    addModernTotals(totals, currency = 'USD') {
        const totalsX = this.pageWidth - this.margin - 80;
        const totalsWidth = 80;
        const startY = this.currentY;
        
        // Totals background
        this.addColoredRect(totalsX, startY, totalsWidth, 50, this.colors.light, 0.5);
        
        // Border
        this.doc.setLineWidth(1);
        this.doc.setDrawColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.doc.rect(totalsX, startY, totalsWidth, 50);
        
        let currentY = startY + 10;
        
        // Subtotal
        const subtotal = parseFloat(totals.subtotal) || 0;
        this.setFont(this.fontSize.normal, 'normal', this.colors.text);
        this.doc.text('Subtotal:', totalsX + 5, currentY);
        const subtotalText = this.formatCurrency(subtotal, currency);
        const subtotalWidth = this.doc.getTextWidth(subtotalText);
        this.doc.text(subtotalText, totalsX + totalsWidth - 5 - subtotalWidth, currentY);
        currentY += 8;

        // Tax if applicable
        if (totals.taxRate > 0) {
            const taxAmount = subtotal * (parseFloat(totals.taxRate) / 100);
            this.doc.text(`Tax (${totals.taxRate}%):`, totalsX + 5, currentY);
            const taxText = this.formatCurrency(taxAmount, currency);
            const taxWidth = this.doc.getTextWidth(taxText);
            this.doc.text(taxText, totalsX + totalsWidth - 5 - taxWidth, currentY);
            currentY += 8;
        }

        // Separator line
        this.doc.setLineWidth(1);
        this.doc.setDrawColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.doc.line(totalsX + 5, currentY + 2, totalsX + totalsWidth - 5, currentY + 2);
        currentY += 8;

        // Grand total with emphasis
        const grandTotal = parseFloat(totals.grandTotal) || 
                          subtotal + (subtotal * (parseFloat(totals.taxRate || 0) / 100));

        this.setFont(this.fontSize.normal, 'bold', this.colors.primary);
        this.doc.text('TOTAL:', totalsX + 5, currentY);
        const totalText = this.formatCurrency(grandTotal, currency);
        const totalWidth = this.doc.getTextWidth(totalText);
        this.doc.text(totalText, totalsX + totalsWidth - 5 - totalWidth, currentY);

        this.currentY = startY + 65;
    }

    // Add modern footer
    async addModernFooter(businessData, notes = '') {
        // Notes section
        if (notes && notes.trim()) {
            this.setFont(this.fontSize.normal, 'bold', this.colors.primary);
            this.doc.text('NOTES', this.margin, this.currentY);
            
            // Decorative line
            this.doc.setLineWidth(2);
            this.doc.setDrawColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
            this.doc.line(this.margin, this.currentY + 3, this.margin + 30, this.currentY + 3);
            
            this.currentY += 10;

            // Notes content in a box
            const notesY = this.currentY;
            const notesHeight = 25;
            
            this.addColoredRect(this.margin, notesY, this.pageWidth - (2 * this.margin), notesHeight, this.colors.light, 0.3);
            
            this.setFont(this.fontSize.small, 'normal', this.colors.text);
            const maxWidth = this.pageWidth - (2 * this.margin) - 10;
            const noteLines = this.doc.splitTextToSize(notes, maxWidth);

            for (let i = 0; i < Math.min(noteLines.length, 3); i++) {
                this.doc.text(noteLines[i], this.margin + 5, notesY + 8 + (i * 5));
            }

            this.currentY = notesY + notesHeight + 15;
        }

        // Signature section
        const footerY = this.pageHeight - 60;
        
        // Add signature in footer if available
        if (businessData.signatureUrl && businessData.signatureUrl.trim()) {
            try {
                const signatureData = await this.loadImage(businessData.signatureUrl);
                if (signatureData) {
                    // Signature background
                    this.addColoredRect(this.margin, footerY, 60, 30, this.colors.light, 0.5);
                    
                    const signatureWidth = 50;
                    const signatureHeight = 20;
                    const signatureX = this.margin + 5;
                    const signatureY = footerY + 5;
                    
                    this.doc.addImage(signatureData, 'JPEG', signatureX, signatureY, signatureWidth, signatureHeight);
                    
                    this.setFont(this.fontSize.small, 'normal', this.colors.text);
                    this.doc.text('Authorized Signature', signatureX, signatureY + signatureHeight + 8);
                }
            } catch (error) {
                console.warn('Failed to add signature to footer:', error);
            }
        }

        // Modern footer line
        const lineY = this.pageHeight - 25;
        this.addGradientEffect(0, lineY, this.pageWidth, 3, this.colors.primary, this.colors.accent);
        
        // Thank you message
        this.setFont(this.fontSize.normal, 'bold', this.colors.primary);
        const thankYou = 'Thank you for your business!';
        const textWidth = this.doc.getTextWidth(thankYou);
        this.doc.text(thankYou, (this.pageWidth - textWidth) / 2, lineY + 15);
    }

    // Generate complete modern PDF
    async generatePDF(documentData) {
        try {
            this.initializeDocument();

            // Set document properties
            this.doc.setProperties({
                title: `${documentData.type} ${documentData.number}`,
                subject: documentData.type,
                author: documentData.business.businessName || 'Modern Business Documents Generator',
                creator: 'Modern PDF Generator v3.0'
            });

            // Add sections with modern design
            await this.addModernHeader(documentData.business);
            this.addModernDocumentSection(documentData);
            this.addModernClientSection(documentData);
            this.addModernItemsTable(documentData.items, documentData.business.currency);
            this.addModernTotals(documentData.totals, documentData.business.currency);
            await this.addModernFooter(documentData.business, documentData.notes);

            // Add page numbers and generation info
            const pageCount = this.doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                this.doc.setPage(i);
                
                // Page numbers with modern styling
                this.setFont(this.fontSize.small, 'normal', this.colors.text);
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
            console.error('Error generating modern PDF:', error);
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
            console.error('Error downloading modern PDF:', error);
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
        const checkInterval = setInterval(() => {
            if (ensureJsPDFLoaded() && typeof window.jsPDF !== 'undefined') {
                clearInterval(checkInterval);
                this.ready = true;
                console.log('ModernPDFGenerator ready');
            }
        }, 100);

        setTimeout(() => {
            if (!this.ready) {
                clearInterval(checkInterval);
                console.error('jsPDF not loaded after 10 seconds');
                if (ensureJsPDFLoaded()) {
                    this.ready = true;
                    console.log('ModernPDFGenerator ready (fallback)');
                }
            }
        }, 10000);
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
