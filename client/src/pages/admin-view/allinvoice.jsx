import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField } from '@mui/material';
import { FileDownload, WhatsApp, Email } from '@mui/icons-material';
import jsPDF from 'jspdf';
import Barcode from 'react-barcode'; // Import the barcode component

const AllInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // New state for the search query

  useEffect(() => {
    // Fetch all invoices when the component is mounted
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/admin/invoices');
        const data = await response.json();

        // Check if the data contains invoices and is an array
        if (Array.isArray(data.invoices)) {
          setInvoices(data.invoices.reverse()); // Save the invoices in state
        } else {
          console.error('Invoices data is not in the expected format');
          alert('Error: Invoices data is not in the expected format');
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
        alert('Error fetching invoices');
      }
    };

    fetchInvoices();
  }, []);

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter invoices based on the search query
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadPDF = (invoice) => {
    const doc = new jsPDF();

    // Set fonts
    doc.setFontSize(14);

    // Header Section (Invoice Number, Address, Dates)
    const x = 14;
    const yStart = 22; // Starting position for the first element
    let yPosition = yStart;

    // Invoice number at the top-right
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 160, yPosition);

    // Client Address and Details
    doc.setFontSize(12);
    doc.text(`Client Name: ${invoice.clientName}`, x, yPosition + 8);
    doc.text(`Client Email: ${invoice.clientEmail}`, x, yPosition + 14);
    if (invoice.billingAddress) {
      doc.text(`Billing Address: ${invoice.billingAddress}`, x, yPosition + 20);
    }
    if (invoice.shippingAddress) {
      doc.text(`Shipping Address: ${invoice.shippingAddress}`, x, yPosition + 26);
    }

    // Invoice and Due Dates
    doc.text(`Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 160, yPosition + 20);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 160, yPosition + 26);

    // Line to separate header from the rest
    doc.setLineWidth(0.5);
    doc.line(14, yPosition + 35, 200, yPosition + 35); // Horizontal line for visual separation
    yPosition += 40; // Move down after the line

    // Table Header for Items
    doc.setFontSize(12);
    doc.text('Description', x, yPosition);
    doc.text('Quantity', 110, yPosition);
    doc.text('Price', 140, yPosition);
    doc.text('Amount', 170, yPosition);
    yPosition += 6; // Move down after the header

    // Itemized List
    invoice.items.forEach((item) => {
      doc.text(item.description, x, yPosition);
      doc.text(`${item.quantity}`, 110, yPosition);
      doc.text(`$${item.price}`, 140, yPosition);
      doc.text(`$${item.amount}`, 170, yPosition);
      yPosition += 6; // Move down after each item
    });

    // Line to separate items from totals
    doc.setLineWidth(0.5);
    doc.line(14, yPosition, 200, yPosition);
    yPosition += 10; // Add space after the line

    // Totals Section
    doc.text(`Subtotal: $${invoice.subtotal}`, x, yPosition);
    yPosition += 6;
    doc.text(`Tax (${invoice.taxRate}%): $${invoice.taxAmount}`, x, yPosition);
    yPosition += 6;
    doc.text(`Total: $${invoice.totalAmount}`, x, yPosition);
    yPosition += 6;
    doc.text(`Amount Paid: $${invoice.amountPaid}`, x, yPosition);
    yPosition += 6;
    doc.text(`Balance Due: $${invoice.balanceDue}`, x, yPosition);

    // Save the PDF to a Blob
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob); // Creating a URL for the PDF

    // Save the PDF locally
    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);

    // Return the generated PDF URL
    return pdfUrl;
  };

  const shareInvoiceByEmail = (invoice) => {
    // Generate the PDF URL
    const pdfUrl = downloadPDF(invoice);

    // Create a mailto link with the invoice PDF URL
    const emailBody = `
      Hello,

      Please find the invoice attached. You can download it using the following link:
      ${pdfUrl}

      Invoice Details:
      Invoice Number: ${invoice.invoiceNumber}
      Client Name: ${invoice.clientName}
      Total Amount: $${invoice.totalAmount}

      Thank you!
    `;

    const mailtoLink = `mailto:?subject=Invoice ${invoice.invoiceNumber}&body=${encodeURIComponent(emailBody)}`;

    // Open the mailto link to launch the default email client
    window.location.href = mailtoLink;
  };

  return (
    <>
      <style>{`
        .page-container {
          padding: 20px;
        }
        .paper-container {
          padding: 20px;
          background-color: #fff;
        }
        .title {
          margin-bottom: 20px;
        }
        .table-container {
          margin-top: 20px;
        }
        .download-button {
          color: #1976d2;
        }
        .download-button:hover {
          color: #1565c0;
        }
        .whatsapp-button {
          color: #25D366;
        }
        .whatsapp-button:hover {
          color: #128C7E;
        }
        .email-button {
          color: #D44638;
        }
        .email-button:hover {
          color: #B02A2A;
        }
      `}</style>

      <Box className="page-container">
        <Paper className="paper-container">
          <Typography className="title" variant="h4">All Invoices</Typography>

          {/* Search Bar */}
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              label="Search Invoices"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ backgroundColor: '#fff', borderRadius: '8px' }}
            />
          </Box>

          <TableContainer className="table-container" component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice Number</TableCell>
                  <TableCell>Client Name</TableCell>
                  <TableCell>Invoice Date</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Barcode</TableCell> {/* New barcode column */}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(filteredInvoices) && filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.invoiceNumber}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                      <TableCell>${invoice.totalAmount}</TableCell>
                      <TableCell>
                        <Barcode
                          value={invoice.invoiceNumber}
                          width={1}
                          height={30}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton className="download-button" onClick={() => downloadPDF(invoice)}>
                          <FileDownload />
                        </IconButton>
                        <IconButton className="whatsapp-button" onClick={() => shareInvoice(invoice)}>
                          <WhatsApp />
                        </IconButton>
                        <IconButton className="email-button" onClick={() => shareInvoiceByEmail(invoice)}>
                          <Email />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No invoices available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </>
  );
};

export default AllInvoicesPage;
