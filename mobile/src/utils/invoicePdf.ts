import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { BackendBillItem } from '../services/billingService';

/**
 * Builds clean, professional HTML for the VoltFlow EV Charging Invoice.
 */
export function generateInvoiceHtml(bill: BackendBillItem): string {
  const invNumber = bill.invoice_number || `VF-INV-${bill.bill_id.replace(/^bill_/, '').toUpperCase()}`;
  const invDate = bill.paid_at
    ? new Date(bill.paid_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date(bill.created_at || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const energyCost = (bill.energy_cost ?? 0).toFixed(2);
  const parkingCost = (bill.parking_cost ?? 0).toFixed(2);
  const serviceFee = (bill.service_fee ?? 0).toFixed(2);
  const totalCost = (bill.total_cost ?? 0).toFixed(2);
  const isPaid = (bill.status || '').toLowerCase() === 'paid';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VoltFlow Invoice - ${invNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #f4f6f8; color: #1e293b; padding: 32px; font-size: 14px; }
    .invoice-card { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #00D47E; padding-bottom: 20px; margin-bottom: 24px; }
    .brand-title { font-size: 26px; font-weight: 800; color: #00D47E; letter-spacing: 1px; }
    .brand-sub { font-size: 12px; color: #64748b; margin-top: 3px; font-weight: 600; text-transform: uppercase; }
    .invoice-tag { text-align: right; }
    .invoice-tag h2 { font-size: 20px; font-weight: 700; color: #0f172a; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 6px; }
    .status-paid { background: #dcfce7; color: #15803d; }
    .status-pending { background: #fef3c7; color: #b45309; }

    .grid-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .box-title { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    .box-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px; }
    .box-label { color: #64748b; }
    .box-value { font-weight: 600; color: #0f172a; text-align: right; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px 14px; font-size: 12px; text-transform: uppercase; }
    th.text-right { text-align: right; }
    td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    td.text-right { text-align: right; font-weight: 600; }
    
    .total-section { display: flex; justify-content: flex-end; margin-bottom: 24px; }
    .total-table { width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; }
    .grand-total { display: flex; justify-content: space-between; padding: 10px 0; font-size: 18px; font-weight: 800; color: #00D47E; border-top: 2px solid #e2e8f0; margin-top: 4px; }

    .footer { border-top: 1px dashed #cbd5e1; padding-top: 18px; text-align: center; color: #64748b; font-size: 11px; line-height: 1.5; }
    .footer-highlight { font-weight: 700; color: #0f172a; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-title">VOLT FLOW</div>
        <div class="brand-sub">Intelligent EV Charging & Energy</div>
      </div>
      <div class="invoice-tag">
        <h2>TAX INVOICE</h2>
        <div class="status-badge ${isPaid ? 'status-paid' : 'status-pending'}">
          ${isPaid ? '● PAID' : '○ PENDING'}
        </div>
      </div>
    </div>

    <div class="grid-section">
      <div class="box">
        <div class="box-title">INVOICE DETAILS</div>
        <div class="box-row">
          <span class="box-label">Invoice Number:</span>
          <span class="box-value">${invNumber}</span>
        </div>
        <div class="box-row">
          <span class="box-label">Date:</span>
          <span class="box-value">${invDate}</span>
        </div>
        <div class="box-row">
          <span class="box-label">Payment Method:</span>
          <span class="box-value">${bill.payment_method || (isPaid ? 'Demo Payment' : 'Pending')}</span>
        </div>
      </div>

      <div class="box">
        <div class="box-title">CUSTOMER & VEHICLE</div>
        <div class="box-row">
          <span class="box-label">Customer:</span>
          <span class="box-value">${bill.customer_name || 'Alex Mercer'}</span>
        </div>
        <div class="box-row">
          <span class="box-label">Vehicle:</span>
          <span class="box-value">${bill.vehicle_model || 'Tata Nexon EV Max'}</span>
        </div>
        <div class="box-row">
          <span class="box-label">License Plate:</span>
          <span class="box-value">${bill.license_plate || 'KA-01-EV-2024'}</span>
        </div>
      </div>
    </div>

    <div class="box" style="margin-bottom: 24px;">
      <div class="box-title">CHARGING SESSION DETAILS</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <div class="box-row">
            <span class="box-label">Charger / Station:</span>
            <span class="box-value">${bill.charger_name || 'Phoenix Mall (Charger C07)'}</span>
          </div>
          <div class="box-row">
            <span class="box-label">Duration:</span>
            <span class="box-value">${bill.duration || '55 mins'}</span>
          </div>
        </div>
        <div>
          <div class="box-row">
            <span class="box-label">Session Time:</span>
            <span class="box-value">${bill.start_time || '04:30 PM'} - ${bill.end_time || '05:25 PM'}</span>
          </div>
          <div class="box-row">
            <span class="box-label">Energy Delivered:</span>
            <span class="box-value" style="color: #00D47E;">${bill.energy_kwh} kWh</span>
          </div>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>EV Energy Consumption</td>
          <td class="text-right">₹${(bill.rate_per_kwh ?? 12.0).toFixed(2)}/kWh</td>
          <td class="text-right">${bill.energy_kwh} kWh</td>
          <td class="text-right">₹${energyCost}</td>
        </tr>
        ${
          Number(parkingCost) > 0
            ? `<tr>
                 <td>EV Parking Space Fee</td>
                 <td class="text-right">Fixed</td>
                 <td class="text-right">1</td>
                 <td class="text-right">₹${parkingCost}</td>
               </tr>`
            : ''
        }
        ${
          Number(serviceFee) > 0
            ? `<tr>
                 <td>Platform Convenience Fee</td>
                 <td class="text-right">Fixed</td>
                 <td class="text-right">1</td>
                 <td class="text-right">₹${serviceFee}</td>
               </tr>`
            : ''
        }
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-table">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>₹${energyCost}</span>
        </div>
        <div class="total-row">
          <span>Parking & Fees:</span>
          <span>₹${(Number(parkingCost) + Number(serviceFee)).toFixed(2)}</span>
        </div>
        <div class="grand-total">
          <span>Total Paid:</span>
          <span>₹${totalCost}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p class="footer-highlight">Thank you for charging sustainably with VoltFlow!</p>
      <p>This is a computer generated demo invoice for hackathon demonstration purposes.</p>
      <p>VoltFlow Intelligent Energy Management System • support@voltflow.energy</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generates the invoice PDF and opens the system share/save sheet in Expo Go.
 */
export async function downloadAndShareInvoice(bill: BackendBillItem): Promise<{ success: boolean; uri?: string }> {
  try {
    const html = generateInvoiceHtml(bill);
    const { uri } = await Print.printToFileAsync({ html });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `VoltFlow Invoice - ${bill.invoice_number || bill.bill_id}`,
      });
      return { success: true, uri };
    } else {
      // Fallback: system print/save-as-pdf
      await Print.printAsync({ html });
      return { success: true, uri };
    }
  } catch (error) {
    console.error('Invoice PDF generation failed:', error);
    // If sharing failed, try printAsync as fallback
    try {
      const html = generateInvoiceHtml(bill);
      await Print.printAsync({ html });
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}

/**
 * Direct print action via Expo Print
 */
export async function printInvoice(bill: BackendBillItem): Promise<void> {
  const html = generateInvoiceHtml(bill);
  await Print.printAsync({ html });
}
