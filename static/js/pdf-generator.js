
// PDF Generator for Business Documents

class PDFGenerator {
    constructor() {
        this.jsPDF = window.jspdf.jsPDF;
        this.fontLoaded = false;
        this.loadCustomFont();
        
        // Monochrome color palette - clean and professional
        this.colors = {
            black: [0, 0, 0],
            darkGray: [64, 64, 64],
            mediumGray: [128, 128, 128],
            lightGray: [200, 200, 200],
            veryLightGray: [240, 240, 240],
            white: [255, 255, 255]
        };
        
        // Typography settings
        this.fonts = {
            title: { size: 20, weight: 'bold' },
            heading: { size: 14, weight: 'bold' },
            subheading: { size: 12, weight: 'bold' },
            body: { size: 10, weight: 'normal' },
            small: { size: 8, weight: 'normal' },
            large: { size: 11, weight: 'normal' }
        };
        
        // Layout settings
        this.layout = {
            margin: 20,
            pageWidth: 210,
            pageHeight: 297,
            lineHeight: 1.4
        };
    }

    async loadCustomFont() {
        try {
            this.fontLoaded = true;
        } catch (error) {
            console.warn('Custom font loading failed, using fallback:', error);
            this.fontLoaded = false;
        }
    }

    async generatePDF(documentData) {
        try {
            const doc = new this.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Set document properties
            doc.setProperties({
                title: `${this.getDocumentTitle(documentData.type)} ${documentData.number}`,
                subject: `${this.getDocumentTitle(documentData.type)} for ${documentData.client.name}`,
                author: documentData.business.businessName || 'Business Documents Generator',
                creator: 'Business Documents Generator'
            });

            await this.addCleanHeader(doc, documentData);
            this.addDocumentInfo(doc, documentData);
            this.addPartyInformation(doc, documentData);
            this.addCleanItemsTable(doc, documentData);
            this.addCleanTotals(doc, documentData);
            await this.addCleanFooter(doc, documentData);

            // Save the PDF
            const fileName = `${documentData.type}_${documentData.number}.pdf`;
            doc.save(fileName);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }

    async generatePDFForPreview(documentData) {
        try {
            const doc = new this.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            doc.setProperties({
                title: `${this.getDocumentTitle(documentData.type)} ${documentData.number}`,
                subject: `${this.getDocumentTitle(documentData.type)} for ${documentData.client.name}`,
                author: documentData.business.businessName || 'Business Documents Generator',
                creator: 'Business Documents Generator'
            });

            await this.addCleanHeader(doc, documentData);
            this.addDocumentInfo(doc, documentData);
            this.addPartyInformation(doc, documentData);
            this.addCleanItemsTable(doc, documentData);
            this.addCleanTotals(doc, documentData);
            await this.addCleanFooter(doc, documentData);

            return doc.output('dataurlstring');
            
        } catch (error) {
            console.error('Error generating PDF for preview:', error);
            throw error;
        }
    }

    async printPDF(documentData) {
        try {
            const doc = new this.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            doc.setProperties({
                title: `${this.getDocumentTitle(documentData.type)} ${documentData.number}`,
                subject: `${this.getDocumentTitle(documentData.type)} for ${documentData.client.name}`,
                author: documentData.business.businessName || 'Business Documents Generator',
                creator: 'Business Documents Generator'
            });

            await this.addCleanHeader(doc, documentData);
            this.addDocumentInfo(doc, documentData);
            this.addPartyInformation(doc, documentData);
            this.addCleanItemsTable(doc, documentData);
            this.addCleanTotals(doc, documentData);
            await this.addCleanFooter(doc, documentData);

            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            const printFrame = document.createElement('iframe');
            printFrame.style.display = 'none';
            printFrame.src = pdfUrl;
            document.body.appendChild(printFrame);
            
            printFrame.onload = function() {
                printFrame.contentWindow.print();
                setTimeout(() => {
                    document.body.removeChild(printFrame);
                    URL.revokeObjectURL(pdfUrl);
                }, 1000);
            };
            
        } catch (error) {
            console.error('Error printing PDF:', error);
            throw error;
        }
    }

    async addCleanHeader(doc, documentData) {
        const margin = this.layout.margin;
        
        // Business logo if available (left side)
        let logoWidth = 0;
        if (documentData.business.businessLogoUrl) {
            try {
                const logoImg = await this.loadImage(documentData.business.businessLogoUrl);
                logoWidth = 30;
                doc.addImage(logoImg, 'JPEG', margin, margin, logoWidth, 20);
            } catch (error) {
                console.warn('Could not load business logo:', error);
            }
        }
        
        // Business name (top left, below or beside logo)
        doc.setTextColor(...this.colors.black);
        doc.setFontSize(this.fonts.heading.size);
        doc.setFont('helvetica', this.fonts.heading.weight);
        const businessName = documentData.business.businessName || 'Business Name';
        doc.text(businessName, margin + logoWidth + (logoWidth > 0 ? 5 : 0), margin + 8);
        
        // Document title (top right)
        doc.setTextColor(...this.colors.black);
        doc.setFontSize(this.fonts.title.size);
        doc.setFont('helvetica', this.fonts.title.weight);
        const title = this.getDocumentTitle(documentData.type);
        doc.text(title, this.layout.pageWidth - margin, margin + 10, { align: 'right' });
        
        // Horizontal line under header
        doc.setDrawColor(...this.colors.mediumGray);
        doc.setLineWidth(0.5);
        doc.line(margin, margin + 25, this.layout.pageWidth - margin, margin + 25);
    }

    addDocumentInfo(doc, documentData) {
        const margin = this.layout.margin;
        const startY = margin + 35;
        
        // Document number and date section
        doc.setTextColor(...this.colors.darkGray);
        doc.setFontSize(this.fonts.body.size);
        doc.setFont('helvetica', this.fonts.body.weight);
        
        // Left side - Document number
        doc.setFont('helvetica', 'bold');
        doc.text(`${this.getDocumentTitle(documentData.type)} #:`, margin, startY);
        doc.setFont('helvetica', 'normal');
        doc.text(documentData.number, margin + 35, startY);
        
        // Right side - Date
        doc.setFont('helvetica', 'bold');
        doc.text('Date:', this.layout.pageWidth - margin - 40, startY);
        doc.setFont('helvetica', 'normal');
        doc.text(documentData.date, this.layout.pageWidth - margin, startY, { align: 'right' });
        
        // Due date if it's an invoice
        if (documentData.type === 'invoice' && documentData.dueDate) {
            doc.setFont('helvetica', 'bold');
            doc.text('Due Date:', this.layout.pageWidth - margin - 40, startY + 8);
            doc.setFont('helvetica', 'normal');
            doc.text(documentData.dueDate, this.layout.pageWidth - margin, startY + 8, { align: 'right' });
        }
    }

    addPartyInformation(doc, documentData) {
        const margin = this.layout.margin;
        const startY = 75;
        const columnWidth = (this.layout.pageWidth - 2 * margin - 10) / 2;
        
        // From section (Business) - Left column
        this.addCleanPartySection(doc, 'BILL FROM', documentData.business, margin, startY, columnWidth);
        
        // To section (Client) - Right column
        this.addCleanPartySection(doc, 'BILL TO', documentData.client, margin + columnWidth + 10, startY, columnWidth);
    }

    addCleanPartySection(doc, label, party, x, y, width) {
        // Section header
        doc.setTextColor(...this.colors.black);
        doc.setFontSize(this.fonts.subheading.size);
        doc.setFont('helvetica', this.fonts.subheading.weight);
        doc.text(label, x, y);
        
        // Underline for section header
        doc.setDrawColor(...this.colors.lightGray);
        doc.setLineWidth(0.3);
        doc.line(x, y + 2, x + width, y + 2);
        
        // Party information
        doc.setTextColor(...this.colors.darkGray);
        doc.setFontSize(this.fonts.body.size);
        let currentY = y + 10;
        
        // Name/Business name
        const name = party.businessName || party.name;
        if (name) {
            doc.setFont('helvetica', 'bold');
            const nameLines = this.splitText(doc, name, width);
            nameLines.forEach(line => {
                doc.text(line, x, currentY);
                currentY += 5;
            });
            doc.setFont('helvetica', 'normal');
        }
        
        // Address
        const address = party.businessAddress || party.address;
        if (address) {
            const addressLines = this.splitText(doc, address, width);
            addressLines.forEach(line => {
                doc.text(line, x, currentY);
                currentY += 4;
            });
        }
        
        // Contact information
        const phone = party.businessPhone || party.phone;
        const email = party.businessEmail || party.email;
        
        if (phone) {
            doc.text(`Phone: ${phone}`, x, currentY);
            currentY += 4;
        }
        
        if (email) {
            doc.text(`Email: ${email}`, x, currentY);
        }
    }

    addCleanItemsTable(doc, documentData) {
        const margin = this.layout.margin;
        const startY = 140;
        const tableWidth = this.layout.pageWidth - 2 * margin;
        
        // Responsive column widths
        const colWidths = [
            tableWidth * 0.45,  // Description - 45%
            tableWidth * 0.12,  // Quantity - 12%
            tableWidth * 0.18,  // Price - 18%
            tableWidth * 0.12,  // Discount - 12%
            tableWidth * 0.13   // Total - 13%
        ];
        
        // Table header
        doc.setFillColor(...this.colors.veryLightGray);
        doc.rect(margin, startY, tableWidth, 10, 'F');
        
        // Header border
        doc.setDrawColor(...this.colors.mediumGray);
        doc.setLineWidth(0.3);
        doc.rect(margin, startY, tableWidth, 10);
        
        doc.setTextColor(...this.colors.black);
        doc.setFontSize(this.fonts.body.size);
        doc.setFont('helvetica', this.fonts.body.weight);
        
        let currentX = margin + 2;
        const headers = ['DESCRIPTION', 'QTY', 'PRICE', 'DISC%', 'TOTAL'];
        headers.forEach((header, index) => {
            const align = index === 0 ? 'left' : 'center';
            const textX = index === 0 ? currentX : currentX + colWidths[index] / 2;
            doc.text(header, textX, startY + 6, { align: align });
            currentX += colWidths[index];
        });
        
        // Table rows
        doc.setTextColor(...this.colors.darkGray);
        doc.setFont('helvetica', 'normal');
        
        let currentY = startY + 15;
        const rowHeight = 12;
        
        documentData.items.forEach((item, index) => {
            // Alternate row background
            if (index % 2 === 1) {
                doc.setFillColor(...this.colors.veryLightGray);
                doc.rect(margin, currentY - 4, tableWidth, rowHeight, 'F');
            }
            
            // Row border
            doc.setDrawColor(...this.colors.lightGray);
            doc.setLineWidth(0.1);
            doc.rect(margin, currentY - 4, tableWidth, rowHeight);
            
            currentX = margin + 2;
            
            // Description
            const descLines = this.splitText(doc, item.description, colWidths[0] - 4);
            doc.text(descLines[0], currentX, currentY + 2);
            currentX += colWidths[0];
            
            // Quantity - centered
            doc.text(item.quantity.toString(), currentX + colWidths[1] / 2, currentY + 2, { align: 'center' });
            currentX += colWidths[1];
            
            // Price - right aligned
            doc.text(this.formatCurrency(item.price, documentData.currency), currentX + colWidths[2] - 2, currentY + 2, { align: 'right' });
            currentX += colWidths[2];
            
            // Discount - centered
            doc.text(`${item.discount}%`, currentX + colWidths[3] / 2, currentY + 2, { align: 'center' });
            currentX += colWidths[3];
            
            // Total - right aligned
            doc.text(this.formatCurrency(item.total, documentData.currency), currentX + colWidths[4] - 2, currentY + 2, { align: 'right' });
            
            currentY += rowHeight;
        });
        
        // Table bottom border
        doc.setDrawColor(...this.colors.mediumGray);
        doc.setLineWidth(0.5);
        doc.line(margin, currentY - 4, this.layout.pageWidth - margin, currentY - 4);
        
        return currentY;
    }

    addCleanTotals(doc, documentData) {
        const margin = this.layout.margin;
        const totals = documentData.totals;
        const startY = this.getTableEndY(documentData) + 10;
        const totalsWidth = 60;
        const totalsX = this.layout.pageWidth - margin - totalsWidth;
        
        doc.setTextColor(...this.colors.darkGray);
        doc.setFontSize(this.fonts.body.size);
        doc.setFont('helvetica', 'normal');
        
        let currentY = startY;
        
        // Subtotal
        doc.text('Subtotal:', totalsX, currentY);
        doc.text(this.formatCurrency(totals.subtotal, documentData.currency), this.layout.pageWidth - margin, currentY, { align: 'right' });
        currentY += 7;
        
        // Tax
        doc.text(`Tax (${totals.taxRate}%):`, totalsX, currentY);
        doc.text(this.formatCurrency(totals.taxAmount, documentData.currency), this.layout.pageWidth - margin, currentY, { align: 'right' });
        currentY += 10;
        
        // Total separator line
        doc.setDrawColor(...this.colors.mediumGray);
        doc.setLineWidth(0.5);
        doc.line(totalsX, currentY - 2, this.layout.pageWidth - margin, currentY - 2);
        
        // Grand total with emphasis
        doc.setTextColor(...this.colors.black);
        doc.setFontSize(this.fonts.subheading.size);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', totalsX, currentY + 5);
        doc.text(this.formatCurrency(totals.grandTotal, documentData.currency), this.layout.pageWidth - margin, currentY + 5, { align: 'right' });
        
        // Double underline for total
        doc.setLineWidth(0.8);
        doc.line(totalsX, currentY + 8, this.layout.pageWidth - margin, currentY + 8);
        doc.line(totalsX, currentY + 10, this.layout.pageWidth - margin, currentY + 10);
    }

    async addCleanFooter(doc, documentData) {
        const margin = this.layout.margin;
        const pageHeight = this.layout.pageHeight;
        let footerY = pageHeight - 40;
        
        // Footer separator line
        doc.setDrawColor(...this.colors.lightGray);
        doc.setLineWidth(0.3);
        doc.line(margin, footerY, this.layout.pageWidth - margin, footerY);
        
        footerY += 10;
        
        // Signature section (left side)
        if (documentData.business.signatureUrl) {
            try {
                const signatureImg = await this.loadImage(documentData.business.signatureUrl);
                doc.addImage(signatureImg, 'JPEG', margin, footerY, 40, 15);
                
                doc.setFontSize(this.fonts.small.size);
                doc.setTextColor(...this.colors.mediumGray);
                doc.setFont('helvetica', 'normal');
                doc.text('Authorized Signature', margin, footerY + 20);
            } catch (error) {
                console.warn('Could not load signature:', error);
            }
        }
        
        // Thank you message (center)
        doc.setFontSize(this.fonts.body.size);
        doc.setTextColor(...this.colors.darkGray);
        doc.setFont('helvetica', 'italic');
        doc.text('Thank you for your business!', this.layout.pageWidth / 2, footerY + 10, { align: 'center' });
        
        // Page number (right side)
        doc.setFontSize(this.fonts.small.size);
        doc.setTextColor(...this.colors.mediumGray);
        doc.setFont('helvetica', 'normal');
        doc.text('Page 1 of 1', this.layout.pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    getTableEndY(documentData) {
        const startY = 140;
        const headerHeight = 10;
        const rowHeight = 12;
        return startY + headerHeight + 5 + (documentData.items.length * rowHeight);
    }

    splitText(doc, text, maxWidth) {
        if (!text) return [''];
        return doc.splitTextToSize(text, maxWidth);
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

    getCurrencySymbol(currency) {
        const symbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            INR: '₹',
            NGN: 'NGN'
        };
        return symbols[currency] || '$';
    }

    formatCurrency(amount, currency) {
        const formattedAmount = this.addCommasToNumber(amount.toFixed(2));
        
        if (currency === 'NGN') {
            return `NGN ${formattedAmount}`;
        } else {
            const symbol = this.getCurrencySymbol(currency);
            return `${symbol}${formattedAmount}`;
        }
    }

    addCommasToNumber(numberString) {
        const parts = numberString.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
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
            
            img.onerror = function() {
                reject(new Error('Failed to load image'));
            };
            
            img.src = url;
        });
    }
}

// Initialize PDF Generator
window.PDFGenerator = new PDFGenerator();
