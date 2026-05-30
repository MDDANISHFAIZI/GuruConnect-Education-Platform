import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates and downloads a professional payment receipt PDF for GuruConnect fee ledger payments.
 * It features custom branding, metadata grid, itemized auto-table, paid stamps, and signature placeholders.
 * @param {Object} fee - The fee payment database record
 * @param {Object} teacherData - Optional populated teacher/user record
 */
export const downloadReceiptPdf = (fee, teacherData = null) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const receiptNo = fee.receiptNumber || `GC-${new Date(fee.paidDate || Date.now()).toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
  const studentName = fee.studentName || 'Local Student';
  const teacherName = teacherData?.user?.name || fee.teacher?.user?.name || 'GuruConnect Tuition Partner';
  const parentPhone = fee.parentPhone || fee.studentEnrollment?.parentPhone || 'Not Shared';
  const subject = fee.subject || fee.studentEnrollment?.subject || 'General Subjects';
  const month = fee.month || 'Current Cycle';
  const amount = fee.amount || 0;
  const paidDate = fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : new Date().toLocaleDateString();

  // Premium Theme Colors
  const primaryColor = [29, 78, 216]; // Deep Indigo (#1d4ed8)
  const secondaryColor = [249, 115, 22]; // Warm Orange (#f97316)
  const textColor = [30, 41, 59]; // Slate Slate-800
  const lightBg = [248, 250, 252]; // Slate-50

  // 1. CORPORATE HEADER SECTION
  // Header Deep Blue Accent Block
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 38, 'F');

  // Orange highlight stripe below banner
  doc.setFillColor(...secondaryColor);
  doc.rect(0, 38, 210, 2, 'F');

  // GuruConnect brand header text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('GuruConnect', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(220, 225, 255);
  doc.text('HYPERLOCAL NEIGHBORHOOD EDUCATION COHORTS', 15, 23);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('PAYMENT RECEIPT', 135, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 230, 210);
  doc.text(`RECEIPT NO: ${receiptNo}`, 135, 24);

  // 2. METADATA PROFILE INVOICE INFORMATION GRID
  doc.setTextColor(...textColor);
  doc.setFontSize(9);

  // Billing From details
  doc.setFont('helvetica', 'bold');
  doc.text('BILLING FROM (ACADEMY TUTOR)', 15, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tutor Name: ${teacherName}`, 15, 58);
  
  const academyAddress = teacherData?.address || fee.teacher?.address || 'Verified Academy Network';
  const academyLocality = teacherData?.villageOrArea || fee.teacher?.villageOrArea || 'Hyperlocal Area';
  doc.text(`Address: ${academyAddress}`, 15, 63);
  doc.text(`Area/Village: ${academyLocality}`, 15, 68);

  // Billing To details
  doc.setFont('helvetica', 'bold');
  doc.text('BILLING TO (STUDENT & PARENT)', 120, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student Name: ${studentName}`, 120, 58);
  doc.text(`Parent Phone: ${parentPhone}`, 120, 63);
  doc.text(`Tuition Cohort Cycle: Monthly Fee`, 120, 68);

  // Middle separation line divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 75, 195, 75);

  // Clearance metrics details
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT & LEDGER METRICS', 15, 83);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoiced Month: ${month}`, 15, 89);
  doc.text(`Payment Cleared: ${paidDate}`, 75, 89);
  doc.text(`Cleared Method: GuruConnect Ledger Entry`, 130, 89);

  // 3. TABLE OF CHARGES (jsPDF AutoTable)
  doc.autoTable({
    startY: 97,
    margin: { left: 15, right: 15 },
    head: [['Tuition Invoiced Item Details', 'Subject', 'Standard Rate', 'Net Cleared Amount']],
    body: [
      [
        `Coaching Tuition Fees - ${month}`,
        subject,
        `Rs. ${amount.toFixed(2)}`,
        `Rs. ${amount.toFixed(2)}`
      ]
    ],
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left'
    },
    bodyStyles: {
      textColor: textColor,
      fontSize: 9
    },
    columnStyles: {
      3: { halign: 'right' }
    },
    theme: 'grid'
  });

  // Ledger Summary Totals box callout
  const finalY = doc.previousAutoTable.finalY + 10;
  
  doc.setFillColor(...lightBg);
  doc.rect(120, finalY, 75, 24, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(120, finalY, 75, 24, 'S');

  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Gross Amount Due:', 124, finalY + 9);
  doc.text('Net Total Received:', 124, finalY + 16);

  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${amount.toFixed(2)}`, 164, finalY + 9);
  doc.text(`Rs. ${amount.toFixed(2)}`, 164, finalY + 16);

  // Gorgeous Paid Stamp callout
  doc.setFillColor(240, 253, 244); // light emeraldbg
  doc.setDrawColor(187, 247, 208); // emerald border
  doc.rect(15, finalY, 48, 16, 'DF');
  
  doc.setTextColor(22, 163, 74); // dark green
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PAYMENT: PAID ✓', 18, finalY + 10);

  // 4. SIGNATURE LINES & STAMPS FOOTER
  const footerY = 248;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, footerY, 75, footerY);
  doc.line(135, footerY, 195, footerY);

  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Tuition Academy/Tutor Stamp & Sign', 20, footerY + 5);
  doc.text('GuruConnect Hyperlocal Registry', 142, footerY + 5);

  // Formal small notes
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is an official computer-generated receipt, confirming transaction values recorded securely', 105, footerY + 16, { align: 'center' });
  doc.text('under GuruConnect rural hyperlocal network terms. Valid without physical signatures.', 105, footerY + 20, { align: 'center' });

  // Save/Download triggering
  doc.save(`GuruConnect_Receipt_${receiptNo}.pdf`);
};
