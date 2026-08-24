// lib/emailTemplates/returnRequest.ts
export const returnRequestTemplate = (returnRequest: any, order: any) => {
  const customerName =
    order.order_type === "guest"
      ? order.guest_info?.name
      : (order.user_id?.name || order.guest_info?.name || "Valued Patron");

  const itemsHtml = (returnRequest.items || [])
    .map((item: any) => {
      return `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #1f2937;">
            <strong>${item.product_name || "Item"}</strong>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">Reason: ${item.reason || "Inspection / Exchange"}</div>
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #1f2937; text-align: center;">
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
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
        
        <!-- Header -->
        <div style="background: #18181b; padding: 26px 20px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #c99648; display: block; margin-bottom: 4px;">
            CONCIERGE RETURNS & INSPECTIONS
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">
            Return Claim Received
          </h1>
          <div style="margin-top: 8px; display: inline-block; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #fef08a;">
            RMA #${returnRequest.rma_number}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 22px;">
          <p style="margin: 0 0 14px; font-size: 14px; color: #374151;">
            Dear <strong>${customerName}</strong>,
          </p>

          <div style="background-color: #f8fafc; border-left: 4px solid #c99648; padding: 14px 16px; margin-bottom: 20px; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">
              We have received your return request for <strong>Order #${order.order_number}</strong>. Our concierge team is reviewing your claim and will update you within 24 hours.
            </p>
          </div>

          <!-- Items Table -->
          <div style="margin-bottom: 18px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #475569; letter-spacing: 0.12em; display: block; margin-bottom: 6px;">
              CLAIMED ITEMS
            </span>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
              <thead>
                <tr style="background-color: #f1f5f9;">
                  <th style="padding: 7px 8px; font-size: 11px; text-transform: uppercase; text-align: left; color: #64748b; border-bottom: 1px solid #e2e8f0;">Piece / Reason</th>
                  <th style="padding: 7px 8px; font-size: 11px; text-transform: uppercase; text-align: center; color: #64748b; border-bottom: 1px solid #e2e8f0;">Qty</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Meta Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 20px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">Estimated Refund Amount:</span>
              <span style="font-weight: 700; color: #c99648;">Rs. ${(returnRequest.refund_amount || 0).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Associated Order:</span>
              <span style="font-weight: 600; color: #0f172a;">#${order.order_number}</span>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 18px; margin-bottom: 8px;">
            <a href="http://localhost:3000/orders" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 11px 26px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; border-radius: 4px;">
              Track Return Claim &rarr;
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          Talal Wooden Lamps • Concierge Support: concierge@talalwoodenlamps.com
        </div>

      </div>
    </body>
    </html>
  `;
};