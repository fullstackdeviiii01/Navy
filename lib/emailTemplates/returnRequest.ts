// lib/emailTemplates/returnRequest.ts
export const returnRequestTemplate = (returnRequest: any, order: any) => {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://talalwoodenlamp.com"
  ).replace(/\/$/, "");

  const customerName =
    order.order_type === "guest"
      ? order.guest_info?.name
      : (order.user_id?.name || order.guest_info?.name || "Valued Patron");

  const itemsHtml = (returnRequest.items || [])
    .map((item: any) => {
      return `
        <tr>
          <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #1e293b;">
            <strong style="color: #0f172a;">${item.product_name || "Item"}</strong>
            <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Reason: ${item.reason || "Inspection / Exchange"}</div>
          </td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; text-align: center; font-weight: 500;">
            ${item.quantity || 1}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Return Request Received - ${returnRequest.rma_number}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
        
        <!-- Header -->
        <div style="background: #18181b; padding: 30px 24px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #c99648; display: block; margin-bottom: 6px;">
            CONCIERGE RETURNS & INSPECTIONS
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">
            Return Claim Received
          </h1>
          <div style="margin-top: 10px; display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); padding: 5px 14px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #fef08a;">
            RMA #${returnRequest.rma_number}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 26px 24px;">
          <p style="margin: 0 0 14px; font-size: 14px; color: #1e293b;">
            Dear <strong>${customerName}</strong>,
          </p>

          <div style="background-color: #f8fafc; border-left: 4px solid #c99648; padding: 14px 16px; margin-bottom: 22px; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.55;">
              We have received your return request for <strong>Order #${order.order_number}</strong>. Our concierge team is reviewing your claim and will update you within 24 hours.
            </p>
          </div>

          <!-- Items Table -->
          <div style="margin-bottom: 20px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569; letter-spacing: 0.12em; display: block; margin-bottom: 8px;">
              CLAIMED ITEMS
            </span>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background-color: #f1f5f9;">
                  <th style="padding: 9px 10px; font-size: 11px; text-transform: uppercase; text-align: left; color: #475569; border-bottom: 1px solid #e2e8f0;">Piece / Reason</th>
                  <th style="padding: 9px 10px; font-size: 11px; text-transform: uppercase; text-align: center; color: #475569; border-bottom: 1px solid #e2e8f0;">Qty</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Meta Table -->
          <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px; font-size: 13px;">
            <tbody>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500; width: 45%; border-bottom: 1px solid #f1f5f9;">
                  Estimated Refund Amount:
                </td>
                <td style="padding: 10px 14px; font-weight: 700; color: #c99648; text-align: right; font-family: monospace; border-bottom: 1px solid #f1f5f9;">
                  Rs. ${(returnRequest.refund_amount || 0).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">
                  Associated Order:
                </td>
                <td style="padding: 10px 14px; font-weight: 600; color: #0f172a; text-align: right;">
                  #${order.order_number}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 24px; margin-bottom: 10px;">
            <a href="${baseUrl}/orders" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 30px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Track Return Claim &rarr;
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