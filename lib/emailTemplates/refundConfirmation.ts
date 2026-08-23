// lib/emailTemplates/refundConfirmation.ts
export const refundConfirmationTemplate = (returnRequest: any, order: any) => {
  const trxRef =
    returnRequest.settlement?.transaction_reference || "TRX-SETTLED";
  const payoutInfo = returnRequest.payout_details;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333; 
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
        }
        .header { 
          background: #059669; 
          color: white; 
          padding: 35px 20px; 
          text-align: center; 
        }
        .content { 
          padding: 30px 20px;
        }
        .success-message {
          background: #d1fae5;
          border-left: 4px solid #10b981;
          padding: 15px 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .refund-details {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #e5e7eb;
        }
        .refund-details p {
          margin: 8px 0;
          font-size: 14px;
        }
        .refund-amount {
          font-size: 32px;
          font-weight: 700;
          color: #059669;
          text-align: center;
          margin: 15px 0;
        }
        .footer { 
          text-align: center; 
          padding: 20px;
          background-color: #f9fafb;
          color: #888; 
          font-size: 12px;
          border-top: 1px solid #e5e5e5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 22px;">Refund Dispatched</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.85; font-size: 14px;">Order #${order.order_number}</p>
        </div>
        
        <div class="content">
          <p style="font-size: 15px;">Hello,</p>
          
          <div class="success-message">
            <p style="font-size: 16px; font-weight: 600; margin: 0; color: #065f46;">
              Your refund payout has been transferred successfully!
            </p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <p style="margin: 5px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Refund Disbursed</p>
            <div class="refund-amount">Rs. ${Number(returnRequest.refund_amount || 0).toLocaleString()}</div>
          </div>
          
          <div class="refund-details">
            <p><strong>RMA Number:</strong> <span style="font-family: monospace;">${returnRequest.rma_number}</span></p>
            <p><strong>Order Number:</strong> #${order.order_number}</p>
            <p><strong>Transaction / Reference ID:</strong> <span style="font-family: monospace; font-weight: bold; color: #059669;">${trxRef}</span></p>
            ${
              payoutInfo
                ? `<p><strong>Disbursed To:</strong> ${payoutInfo.bank_or_wallet_name} (${payoutInfo.account_number})</p>`
                : ""
            }
            <p><strong>Settled Date:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>
        <div class="footer">
          Thank you for shopping with us.
        </div>
      </div>
    </body>
    </html>
  `;
};