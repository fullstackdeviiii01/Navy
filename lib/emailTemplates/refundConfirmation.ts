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
      <title>Refund Disbursed - ${returnRequest.rma_number}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
        
        <!-- Header -->
        <div style="background: #18181b; padding: 26px 20px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #c99648; display: block; margin-bottom: 4px;">
            SETTLEMENT & DISBURSEMENT
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">
            Refund Disbursed
          </h1>
          <div style="margin-top: 8px; display: inline-block; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #fef08a;">
            RMA #${returnRequest.rma_number}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 22px;">
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 16px; margin-bottom: 20px; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; font-size: 13px; color: #166534; font-weight: 600;">
              Your refund payout has been successfully disbursed!
            </p>
          </div>

          <!-- Refund Amount Box -->
          <div style="text-align: center; margin: 16px 0 20px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #64748b; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">
              AMOUNT DISBURSED
            </span>
            <div style="font-size: 26px; font-weight: 700; color: #15803d;">
              Rs. ${Number(returnRequest.refund_amount || 0).toLocaleString()}
            </div>
          </div>

          <!-- Payout Details -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748b;">Associated Order:</span>
              <span style="font-weight: 600; color: #0f172a;">#${order?.order_number || "Order"}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748b;">Transaction Reference:</span>
              <span style="font-family: monospace; font-weight: 700; color: #16a34a;">${trxRef}</span>
            </div>
            ${
              payoutInfo
                ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Disbursed Account:</span>
              <span style="font-weight: 600; color: #0f172a;">${payoutInfo.bank_or_wallet_name} (${payoutInfo.account_number})</span>
            </div>
            `
                : ""
            }
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 18px; margin-bottom: 8px;">
            <a href="http://localhost:3000/orders" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 11px 26px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; border-radius: 4px;">
              View Account Statement &rarr;
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          Talal Wooden Lamps • Financial Concierge: concierge@talalwoodenlamps.com
        </div>

      </div>
    </body>
    </html>
  `;
};