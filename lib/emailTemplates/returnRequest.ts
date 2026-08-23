// lib/emailTemplates/returnRequest.ts
export const returnRequestTemplate = (returnRequest: any, order: any) => {
  const itemsList = (returnRequest.items || [])
    .map(
      (item: any) => `
      <div style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">
        <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${item.product_name}</div>
        ${
          item.variant_attributes && Object.keys(item.variant_attributes).length > 0
            ? Object.entries(item.variant_attributes)
                .map(
                  ([key, value]) =>
                    `<span style="display: inline-block; background-color: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 3px; font-size: 11px; margin-right: 5px;">${key}: ${value}</span>`
                )
                .join("")
            : ""
        }
        <div style="color: #666; font-size: 14px; margin-top: 5px;">
          Quantity: ${item.quantity} × Rs. ${Number(item.price || 0).toLocaleString()} = Rs. ${(
        (item.price || 0) * (item.quantity || 1)
      ).toLocaleString()}
        </div>
      </div>
    `
    )
    .join("");

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
          background: #111827; 
          color: white; 
          padding: 40px 20px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content { 
          padding: 30px 20px;
        }
        .info-box {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #e5e7eb;
        }
        .info-box p {
          margin: 8px 0;
          font-size: 14px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 25px 0 15px 0;
        }
        .items-list {
          background: #ffffff;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .next-steps {
          margin-top: 30px;
          padding: 20px;
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
          border-radius: 4px;
        }
        .next-steps p {
          margin: 5px 0;
          font-size: 13px;
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
          <h1>Return Claim Received</h1>
          <p style="margin: 5px 0; opacity: 0.8; font-size: 14px;">Order #${order.order_number}</p>
        </div>
        
        <div class="content">
          <p style="font-size: 15px;">Hello,</p>
          <p>We have received your return claim for Order <strong>#${order.order_number}</strong>.</p>
          
          <div class="info-box">
            <p><strong>RMA Number:</strong> <span style="font-family: monospace; color: #111827; font-weight: bold;">${returnRequest.rma_number}</span></p>
            <p><strong>Claim Status:</strong> Under Review</p>
            <p><strong>Claimed Reason:</strong> ${returnRequest.return_reason?.replace("_", " ")}</p>
            <p><strong>Estimated Refund:</strong> Rs. ${Number(returnRequest.refund_amount || 0).toLocaleString()}</p>
          </div>
          
          <h3 class="section-title">Items Requested for Return:</h3>
          <div class="items-list">
            ${itemsList}
          </div>
          
          ${
            returnRequest.return_reason_details
              ? `
          <h3 class="section-title">Customer Note:</h3>
          <div class="info-box">
            <p style="margin: 0; font-style: italic;">"${returnRequest.return_reason_details}"</p>
          </div>
          `
              : ""
          }
          
          <div class="next-steps">
            <p style="margin: 0; font-weight: 600; color: #92400e;">What Happens Next?</p>
            <p style="color: #92400e;">Our concierge team is inspecting your return request and evidence. Once approved, you will be able to submit your Bank or JazzCash payout details on your order page to receive your refund transfer.</p>
          </div>
        </div>
        <div class="footer">
          Please retain your RMA number for tracking your claim.
        </div>
      </div>
    </body>
    </html>
  `;
};