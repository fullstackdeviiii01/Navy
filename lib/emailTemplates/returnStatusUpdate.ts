// lib/emailTemplates/returnStatusUpdate.ts
export const returnStatusUpdateTemplate = (returnRequest: any, status: string) => {
  let statusColor = "#2563eb";
  let statusIcon = "📦";
  let statusMessage = "";
  let nextSteps = "";

  switch (status) {
    case "approved":
      statusColor = "#10b981";
      statusIcon = "✓";
      statusMessage = "Great news! Your return request has been approved.";
      nextSteps = `
        <div class="info-box">
          <p style="font-weight: 600; margin-bottom: 10px;">Return Shipping Instructions:</p>
          <p style="margin: 5px 0;">Please ship your items back to us using the following address:</p>
          <div style="background: #ffffff; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #e5e5e5;">
            <p style="margin: 0; font-weight: 600;">Returns Department</p>
            <p style="margin: 5px 0;">Your Company Name</p>
            <p style="margin: 5px 0;">123 Business Street</p>
            <p style="margin: 5px 0;">City, State 12345</p>
            <p style="margin: 5px 0;">United States</p>
          </div>
          <p style="margin-top: 15px; color: #dc2626; font-weight: 600;">⚠️ Important: Please include your RMA number (${returnRequest.rma_number}) inside the package.</p>
        </div>
      `;
      break;

    case "received":
      statusColor = "#8b5cf6";
      statusIcon = "📥";
      statusMessage = "We have received your returned items.";
      nextSteps = `
        <div class="info-box">
          <p>Our quality assurance team is currently inspecting the returned items.</p>
          <p style="margin-top: 10px;">You'll receive another update once the inspection is complete.</p>
        </div>
      `;
      break;

    case "processed":
      statusColor = "#0891b2";
      statusIcon = "⚙️";
      statusMessage = "Your return has been processed and approved.";
      nextSteps = `
        <div class="info-box">
          <p>Your refund is being processed and will be issued to your original payment method.</p>
          <p style="margin-top: 10px;">You'll receive a confirmation email once the refund is completed.</p>
        </div>
      `;
      break;

    case "completed":
      statusColor = "#10b981";
      statusIcon = "✓";
      statusMessage = "Your return has been completed!";
      nextSteps = `
        <div class="success-box" style="background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px;">
          <p style="margin: 0; font-weight: 600; color: #065f46;">Refund Completed</p>
          <p style="margin: 10px 0 0 0; color: #065f46;">Your refund of <strong>$${returnRequest.refund_amount.toFixed(2)}</strong> has been issued to your original payment method.</p>
          <p style="margin: 10px 0 0 0; color: #065f46; font-size: 14px;">It may take 3-5 business days to appear in your account depending on your bank or payment provider.</p>
        </div>
      `;
      break;

    case "rejected":
      statusColor = "#ef4444";
      statusIcon = "✕";
      statusMessage = "We're unable to approve your return request.";
      nextSteps = `
        <div class="info-box" style="background: #fee2e2; border-left: 4px solid #ef4444;">
          <p style="font-weight: 600; color: #991b1b;">Reason for Rejection:</p>
          <p style="color: #991b1b;">${returnRequest.rejection_reason || "The items do not meet our return policy criteria."}</p>
          <p style="margin-top: 15px; color: #991b1b;">If you have questions about this decision, please contact our support team for assistance.</p>
        </div>
      `;
      break;
  }

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
          background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%); 
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
        .status-box {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid ${statusColor};
        }
        .status-box p {
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
          <div class="icon">${statusIcon}</div>
          <h1>Return Status Update</h1>
          <p style="margin: 10px 0;">${statusMessage}</p>
        </div>
        
        <div class="content">
          <p style="font-size: 16px;">Hello,</p>
          
          <p>Your return request has been updated.</p>
          
          <div class="status-box">
            <p><strong>RMA Number:</strong> <span style="font-family: monospace; color: ${statusColor};">${returnRequest.rma_number}</span></p>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 600;">${status.charAt(0).toUpperCase() + status.slice(1)}</span></p>
            <p><strong>Refund Amount:</strong> $${returnRequest.refund_amount.toFixed(2)}</p>
          </div>
          
          ${nextSteps}
          
          ${
            returnRequest.admin_notes
              ? `
          <div class="info-box" style="margin-top: 30px;">
            <p style="font-weight: 600; margin-bottom: 5px;">Note from our team:</p>
            <p style="margin: 0; color: #666;">${returnRequest.admin_notes}</p>
          </div>
          `
              : ""
          }
       </div>
      </div>
    </body>
    </html>
  `;
};