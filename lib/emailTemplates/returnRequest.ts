// lib/emailTemplates/returnRequest.ts
export const returnRequestTemplate = (returnRequest: any, order: any) => {
  const itemsList = returnRequest.items
    .map(
      (item: any) => `
      <div style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">
        <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${item.product_name}</div>
        ${
          item.variant_attributes && Object.keys(item.variant_attributes).length > 0
            ? Object.entries(item.variant_attributes)
                .map(
                  ([key, value]) =>
                    `<span style="display: inline-block; background-color: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 3px; font-size: 11px; margin-right: 5px;">${key}: ${value}</span>`
                )
                .join("")
            : ""
        }
        <div style="color: #666; font-size: 14px; margin-top: 5px;">
          Quantity: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}
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
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
          color: white; 
          padding: 40px 20px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 600;
        }
        .icon {
          font-size: 60px;
          margin-bottom: 15px;
        }
        .content { 
          padding: 30px 20px;
        }
        .info-box {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .info-box p {
          margin: 8px 0;
          font-size: 15px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 25px 0 15px 0;
        }
        .items-list {
          background: #fafafa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e5e5e5;
        }
        .next-steps {
          margin-top: 30px;
          padding: 20px;
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 4px;
        }
        .next-steps p {
          margin: 5px 0;
        }
        .footer { 
          text-align: center; 
          padding: 20px;
          background-color: #f9f9f9;
          color: #888; 
          font-size: 12px;
          border-top: 1px solid #e5e5e5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">📦</div>
          <h1>Return Request Received</h1>
          <p style="margin: 10px 0;">We've received your return request</p>
        </div>
        
        <div class="content">
          <p style="font-size: 16px;">Hello,</p>
          
          <p>We have received your return request for order <strong>${order.order_number}</strong>.</p>
          
          <div class="info-box">
            <p><strong>RMA Number:</strong> <span style="font-family: monospace; color: #2563eb;">${returnRequest.rma_number}</span></p>
            <p><strong>Status:</strong> Requested</p>
            <p><strong>Refund Amount:</strong> $${returnRequest.refund_amount.toFixed(2)}</p>
            <p><strong>Requested Resolution:</strong> ${returnRequest.requested_resolution.charAt(0).toUpperCase() + returnRequest.requested_resolution.slice(1)}</p>
          </div>
          
          <h3 class="section-title">Items to Return:</h3>
          <div class="items-list">
            ${itemsList}
          </div>
          
          ${
            returnRequest.return_reason_details
              ? `
          <h3 class="section-title">Reason Provided:</h3>
          <div class="info-box">
            <p style="margin: 0;">${returnRequest.return_reason_details}</p>
          </div>
          `
              : ""
          }
          
          <div class="next-steps">
            <p style="margin: 0; font-weight: 600; color: #92400e;">What's Next?</p>
            <p style="margin: 10px 0 0 0; color: #92400e;">Our team will review your return request within 1-2 business days. You'll receive an email once your return is approved with instructions on how to ship the items back.</p>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            <strong>Important:</strong> Please keep your RMA number handy for future correspondence.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};