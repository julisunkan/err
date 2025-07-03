// Professional PDF Generator v2.0
console.log('Loading Professional PDF Generator v2.0...');

// Wait for jsPDF to be ready
function waitForJsPDF() {
    return typeof window.jspdf !== 'undefined' && 
           typeof window.jspdf.jsPDF !== 'undefined';
}

// Enhanced PDF Generator Class
class EnhancedPDFGenerator {
    constructor() {
        this.ready = false;
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.init();
    }

    async init() {
        // Wait for jsPDF to be available
        let attempts = 0;
        const maxAttempts = 50;

        while (!waitForJsPDF() && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (waitForJsPDF()) {
            this.ready = true;
            console.log('Professional PDF Generator v2.0 initialized');
        } else {
            console.error('Failed to initialize PDF generator - jsPDF not available');
        }
    }

    // Generate PDF
    async generatePDF(documentData) {
        if (!this.ready || !waitForJsPDF()) {
            throw new Error('PDF generator not ready');
        }

        try {
            this.doc = new window.jspdf.jsPDF();

            // Set up fonts and styles
            this.doc.setFont('helvetica');

            let yPosition = this.margin;

            // Header section
            yPosition = await this.addHeader(documentData, yPosition);

            // Document info section
            yPosition = this.addDocumentInfo(documentData, yPosition);

            // Client section
            yPosition = this.addClientSection(documentData, yPosition);

            // Items table
            yPosition = this.addItemsTable(documentData, yPosition);

            // Totals section
            yPosition = this.addTotals(documentData, yPosition);

            // Notes section
            if (documentData.notes && documentData.notes.trim()) {
                yPosition = this.addNotes(documentData, yPosition);
            }

            // Footer with signature
            this.addFooter(documentData);

            return this.doc;

        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }

    // Add header with business info and logo
    async addHeader(documentData, yPosition) {
        const business = documentData.business;

        // Company name
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(business.businessName || 'Your Business Name', this.margin, yPosition);

        // Add logo if available
        if (business.businessLogoUrl && business.businessLogoUrl.trim()) {
            try {
                const logoImg = await this.loadImage(business.businessLogoUrl);
                if (logoImg) {
                    const logoSize = 25;
                    this.doc.addImage(logoImg, 'JPEG', this.pageWidth - this.margin - logoSize, yPosition - 15, logoSize, logoSize);
                }
            } catch (error) {
                console.warn('Could not load business logo:', error);
            }
        }

        yPosition += 12;

        // Company details
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');

        const addressLines = (business.businessAddress || 'Your Business Address').split('\n');
        addressLines.forEach(line => {
            this.doc.text(line.trim(), this.margin, yPosition);
            yPosition += 5;
        });

        this.doc.text(business.businessPhone || 'Your Phone', this.margin, yPosition);
        yPosition += 5;
        this.doc.text(business.businessEmail || 'your@email.com', this.margin, yPosition);
        yPosition += 15;

        // Header line
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, yPosition, this.pageWidth - this.margin, yPosition);
        yPosition += 15;

        return yPosition;
    }

    // Add document info
    addDocumentInfo(documentData, yPosition) {
        const docTypeDisplay = documentData.type.charAt(0).toUpperCase() + documentData.type.slice(1).replace('_', ' ');

        // Document title
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(docTypeDisplay.toUpperCase(), this.margin, yPosition);

        // Document details (right aligned)
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        const rightX = this.pageWidth - this.margin;

        this.doc.text('#' + (documentData.number || 'DOC-001'), rightX, yPosition, { align: 'right' });
        yPosition += 8;
        this.doc.text('Date: ' + (documentData.date || new Date().toISOString().split('T')[0]), rightX, yPosition, { align: 'right' });

        yPosition += 20;
        return yPosition;
    }

    // Add client section
    addClientSection(documentData, yPosition) {
        const client = documentData.client;

        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Bill To:', this.margin, yPosition);
        yPosition += 8;

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(client.name || 'Client Name', this.margin, yPosition);
        yPosition += 5;

        const clientAddressLines = (client.address || 'Client Address').split('\n');
        clientAddressLines.forEach(line => {
            this.doc.text(line.trim(), this.margin, yPosition);
            yPosition += 5;
        });

        this.doc.text(client.email || 'client@email.com', this.margin, yPosition);
        yPosition += 5;
        this.doc.text(client.phone || 'Client Phone', this.margin, yPosition);
        yPosition += 15;

        return yPosition;
    }

    // Add items table
    addItemsTable(documentData, yPosition) {
        const items = documentData.items || [];

        // Table headers
        const tableY = yPosition;
        const rowHeight = 8;
        const colWidths = [80, 25, 35, 35]; // Description, Qty, Price, Total
        const colPositions = [this.margin, this.margin + colWidths[0], this.margin + colWidths[0] + colWidths[1], this.margin + colWidths[0] + colWidths[1] + colWidths[2]];

        // Header background
        this.doc.setFillColor(240, 240, 240);
        this.doc.rect(this.margin, tableY, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');

        // Header border
        this.doc.setLineWidth(0.5);
        this.doc.rect(this.margin, tableY, colWidths.reduce((a, b) => a + b, 0), rowHeight);

        // Header text
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Description', colPositions[0] + 2, tableY + 5);
        this.doc.text('Qty', colPositions[1] + 2, tableY + 5);
        this.doc.text('Price', colPositions[2] + 2, tableY + 5);
        this.doc.text('Total', colPositions[3] + 2, tableY + 5);

        yPosition = tableY + rowHeight;

        // Table rows
        this.doc.setFont('helvetica', 'normal');
        items.forEach((item, index) => {
            const itemTotal = (item.quantity || 0) * (item.price || 0);

            // Row border
            this.doc.setLineWidth(0.2);
            this.doc.rect(this.margin, yPosition, colWidths.reduce((a, b) => a + b, 0), rowHeight);

            // Row data
            this.doc.text(item.description || '', colPositions[0] + 2, yPosition + 5);
            this.doc.text((item.quantity || 0).toString(), colPositions[1] + 2, yPosition + 5);
            this.doc.text(this.formatCurrency(item.price || 0, documentData.business.currency), colPositions[2] + 2, yPosition + 5);
            this.doc.text(this.formatCurrency(itemTotal, documentData.business.currency), colPositions[3] + 2, yPosition + 5);

            yPosition += rowHeight;
        });

        // Table bottom border
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, yPosition, this.margin + colWidths.reduce((a, b) => a + b, 0), yPosition);

        return yPosition + 10;
    }

    // Add totals section
    addTotals(documentData, yPosition) {
        const totals = documentData.totals;
        const rightX = this.pageWidth - this.margin;
        const leftX = rightX - 60;

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');

        // Subtotal
        this.doc.text('Subtotal:', leftX, yPosition);
        this.doc.text(this.formatCurrency(totals.subtotal, documentData.business.currency), rightX, yPosition, { align: 'right' });
        yPosition += 6;

        // Tax
        const taxAmount = totals.subtotal * (totals.taxRate / 100);
        this.doc.text(`Tax (${totals.taxRate}%):`, leftX, yPosition);
        this.doc.text(this.formatCurrency(taxAmount, documentData.business.currency), rightX, yPosition, { align: 'right' });
        yPosition += 8;

        // Total line
        this.doc.setLineWidth(0.5);
        this.doc.line(leftX, yPosition - 2, rightX, yPosition - 2);

        // Grand total
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Total:', leftX, yPosition);
        this.doc.text(this.formatCurrency(totals.grandTotal, documentData.business.currency), rightX, yPosition, { align: 'right' });

        return yPosition + 15;
    }

    // Add notes section
    addNotes(documentData, yPosition) {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('NOTES:', this.margin, yPosition);
        yPosition += 8;

        this.doc.setFont('helvetica', 'normal');
        const noteLines = documentData.notes.split('\n');
        noteLines.forEach(line => {
            this.doc.text(line, this.margin, yPosition);
            yPosition += 5;
        });

        return yPosition + 10;
    }

    // Add footer with signature
    addFooter(documentData) {
        const footerY = this.pageHeight - 60;

        // Signature section
        if (documentData.business.signatureUrl && documentData.business.signatureUrl.trim()) {
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('AUTHORIZED SIGNATURE:', this.margin, footerY);

            // Try to add signature image
            this.loadImage(documentData.business.signatureUrl).then(signatureImg => {
                if (signatureImg) {
                    this.doc.addImage(signatureImg, 'JPEG', this.margin, footerY + 5, 40, 15);
                }
            }).catch(error => {
                console.warn('Could not load signature:', error);
                // Add signature line instead
                this.doc.line(this.margin, footerY + 15, this.margin + 60, footerY + 15);
            });
        } else {
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('AUTHORIZED SIGNATURE:', this.margin, footerY);
            this.doc.line(this.margin, footerY + 15, this.margin + 60, footerY + 15);
        }

        // Bottom line
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.pageHeight - 35, this.pageWidth - this.margin, this.pageHeight - 35);

        // Thank you message
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Thank you for your business!', this.pageWidth / 2, this.pageHeight - 25, { align: 'center' });

        // Generation info
        const generatedDate = new Date().toLocaleDateString();
        this.doc.text(`Generated on ${generatedDate}`, this.margin, this.pageHeight - 10);
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
        const currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'NGN': '₦',
            'CAD': 'C$',
            'AUD': 'A$'
        };

        const symbol = currencySymbols[currency] || '$';
        const formatted = numAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return symbol + formatted;
    }

    // Helper: Load image
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = url;
        });
    }
}

// Simple PDF Generator (fallback)
console.log('Loading Simple PDF Generator...');

class SimplePDFGenerator {
    constructor() {
        this.ready = false;
        this.init();
    }

    async init() {
        // Wait for jsPDF to be available
        let attempts = 0;
        const maxAttempts = 50;

        while (!waitForJsPDF() && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (waitForJsPDF()) {
            this.ready = true;
            console.log('SimplePDFGenerator initialized');
        } else {
            console.error('Failed to initialize SimplePDFGenerator - jsPDF not available');
        }
    }

    async generatePDF(documentData) {
        if (!this.ready || !waitForJsPDF()) {
            throw new Error('Simple PDF generator not ready');
        }

        const doc = new window.jspdf.jsPDF();

        // Simple document generation
        doc.setFontSize(20);
        doc.text(documentData.type.toUpperCase(), 20, 30);

        doc.setFontSize(12);
        doc.text(`Document #: ${documentData.number}`, 20, 50);
        doc.text(`Date: ${documentData.date}`, 20, 60);

        // Client info
        doc.text(`Client: ${documentData.client.name}`, 20, 80);
        doc.text(`Email: ${documentData.client.email}`, 20, 90);

        // Items
        let y = 110;
        doc.text('Items:', 20, y);
        y += 10;

        documentData.items.forEach(item => {
            doc.text(`${item.description} - Qty: ${item.quantity} - Price: ${item.price}`, 20, y);
            y += 10;
        });

        // Total
        doc.text(`Total: ${this.formatCurrency(documentData.totals.grandTotal, documentData.business.currency)}`, 20, y + 20);

        return doc;
    }

    formatCurrency(amount, currency = 'USD') {
        const numAmount = parseFloat(amount) || 0;
        const currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'NGN': '₦',
            'CAD': 'C$',
            'AUD': 'A$'
        };

        const symbol = currencySymbols[currency] || '$';
        return symbol + numAmount.toFixed(2);
    }
}

// Initialize generators
let enhancedGenerator = null;
let simpleGenerator = null;

// Check if jsPDF is ready
if (!waitForJsPDF()) {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        if (waitForJsPDF() || attempts > 50) {
            clearInterval(checkInterval);
            if (waitForJsPDF()) {
                initializeGenerators();
            } else {
                console.error('jsPDF failed to load after maximum attempts');
            }
        }
    }, 100);
} else {
    initializeGenerators();
}

async function initializeGenerators() {
    try {
        enhancedGenerator = new EnhancedPDFGenerator();
        simpleGenerator = new SimplePDFGenerator();

        // Wait for initialization
        await new Promise(resolve => {
            const checkReady = () => {
                if (enhancedGenerator.ready && simpleGenerator.ready) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });

        // Set global reference
        window.EnhancedPDFGenerator = enhancedGenerator;
        window.SimplePDFGenerator = simpleGenerator;

        console.log('SimplePDFGenerator ready');
    } catch (error) {
        console.error('Error initializing PDF generators:', error);
    }
}