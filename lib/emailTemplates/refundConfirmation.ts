// lib/emailTemplates/refundConfirmation.ts
export const refundConfirmationTemplate = (returnRequest: any, order: any) => {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://talalwoodenlamp.com"
  ).replace(/\/$/, "");

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
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
        
        <!-- Header -->
        <div style="background: #18181b; padding: 30px 24px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #c99648; display: block; margin-bottom: 6px;">
            SETTLEMENT & DISBURSEMENT
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">
            Refund Disbursed
          </h1>
          <div style="margin-top: 10px; display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); padding: 5px 14px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #fef08a;">
            RMA #${returnRequest.rma_number}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 26px 24px;">
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 16px; margin-bottom: 22px; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; font-size: 13px; color: #166534; font-weight: 600;">
              Your refund payout has been successfully disbursed!
            </p>
          </div>

          <!-- Refund Amount Box -->
          <div style="text-align: center; margin: 16px 0 22px; padding: 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.12em; display: block; margin-bottom: 6px;">
              AMOUNT DISBURSED
            </span>
            <div style="font-size: 28px; font-weight: 700; color: #15803d; font-family: monospace;">
              Rs. ${Number(returnRequest.refund_amount || 0).toLocaleString()}
            </div>
          </div>

          <!-- Payout Details Table -->
          <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px; font-size: 13px;">
            <tbody>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500; width: 40%; border-bottom: 1px solid #f1f5f9;">Associated Order:</td>
                <td style="padding: 10px 14px; font-weight: 600; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">#${order?.order_number || "Order"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Transaction Reference:</td>
                <td style="padding: 10px 14px; font-family: monospace; font-weight: 700; color: #16a34a; text-align: right; border-bottom: 1px solid #f1f5f9;">${trxRef}</td>
              </tr>
              ${
                payoutInfo
                  ? `
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Disbursed Account:</td>
                <td style="padding: 10px 14px; font-weight: 600; color: #0f172a; text-align: right;">${payoutInfo.bank_or_wallet_name || "Account"} (${payoutInfo.account_number})</td>
              </tr>
              `
                  : ""
              }
            </tbody>
          </table>

          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 24px; margin-bottom: 10px;">
            <a href="${baseUrl}/orders" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 30px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              View Account Orders &rarr;
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          Talal Wooden Lamps • Support: concierge@talalwoodenlamps.com
        </div>

      </div>
    </body>
    </html>
  `;
};