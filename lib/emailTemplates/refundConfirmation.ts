// lib/emailTemplates/refundConfirmation.ts
export const refundConfirmationTemplate = (returnRequest: any, order: any) => {
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
          background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
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
        .success-message {
          background: #d1fae5;
          border-left: 4px solid #10b981;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .success-message p {
          margin: 5px 0;
          color: #065f46;
        }
        .refund-details {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .refund-details p {
          margin: 8px 0;
          font-size: 15px;
        }
        .refund-amount {
          font-size: 36px;
          font-weight: 700;
          color: #10b981;
          text-align: center;
          margin: 20px 0;
        }
        .timeline-box {
          background: #dbeafe;
          border-left: 4px solid #2563eb;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .timeline-box p {
          margin: 5px 0;
          color: #1e40af;
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
          <div class="icon">✓</div>
          <h1>Refund Processed!</h1>
          <p style="margin: 10px 0;">Your refund has been successfully issued</p>
        </div>
        
        <div class="content">
          <p style="font-size: 16px;">Hello,</p>
          
          <div class="success-message">
            <p style="font-size: 18px; font-weight: 600; margin: 0;">Your refund has been successfully processed!</p>
            <p style="margin-top: 10px;">The refund has been issued to your original payment method.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 10px 0; color: #666; font-size: 14px;">REFUND AMOUNT</p>
            <div class="refund-amount">$${returnRequest.refund_amount.toFixed(2)}</div>
          </div>
          
          <div class="refund-details">
            <p><strong>RMA Number:</strong> <span style="font-family: monospace; color: #2563eb;">${returnRequest.rma_number}</span></p>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Refund Method:</strong> ${returnRequest.refund_method === "bank_transfer" ? "Bank Transfer" : returnRequest.refund_method}</p>
            <p><strong>Processed Date:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          
          <div class="timeline-box">
            <p style="font-weight: 600; font-size: 16px; margin-bottom: 10px;">When will I receive my refund?</p>
            <p>The refund will be transferred to your bank account.</p>
            <p style="margin-top: 10px;">
              Depending on your bank, it may take 3-5 business days for the refund to appear in your account.
            </p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <p style="margin: 0; color: #15803d; font-weight: 600;">Thank you for your patience!</p>
            <p style="margin: 10px 0 0 0; color: #15803d;">We appreciate your business and hope to serve you again in the future.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};