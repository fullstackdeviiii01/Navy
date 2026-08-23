// lib/emailTemplates/returnStatusUpdate.ts
export const returnStatusUpdateTemplate = (returnRequest: any, status: string) => {
  const isApproved = status === "approved";
  const headerBg = isApproved ? "#059669" : "#dc2626";

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
          background: ${headerBg}; 
          color: white; 
          padding: 35px 20px; 
          text-align: center; 
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
        .action-box {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-left: 4px solid #059669;
          padding: 20px;
          border-radius: 6px;
          margin: 25px 0;
        }
        .reject-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-left: 4px solid #dc2626;
          padding: 20px;
          border-radius: 6px;
          margin: 25px 0;
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
          <h1 style="margin: 0; font-size: 22px;">Return Claim ${isApproved ? "Approved" : "Declined"}</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.85; font-size: 14px;">RMA #${returnRequest.rma_number}</p>
        </div>
        
        <div class="content">
          <p style="font-size: 15px;">Hello,</p>
          
          ${
            isApproved
              ? `
          <p>Your return claim <strong>#${returnRequest.rma_number}</strong> has been approved for <strong>Rs. ${Number(returnRequest.refund_amount || 0).toLocaleString()}</strong>.</p>
          
          <div class="action-box">
            <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 15px;">Next Step: Submit Refund Payout Details</h3>
            <p style="margin: 0; color: #065f46; font-size: 13px;">
              Please visit your order details page to provide your <strong>Bank Account</strong> or <strong>JazzCash / EasyPaisa</strong> details so we can transfer your refund as soon as the returned package is received.
            </p>
          </div>
          `
              : `
          <p>We are writing to inform you that your return claim <strong>#${returnRequest.rma_number}</strong> could not be approved.</p>
          
          <div class="reject-box">
            <h3 style="margin: 0 0 8px 0; color: #991b1b; font-size: 15px;">Reason for Decline:</h3>
            <p style="margin: 0; color: #991b1b; font-size: 13px;">
              ${returnRequest.rejection_reason || "The items do not qualify under our return policy."}
            </p>
          </div>
          `
          }

          <div class="info-box">
            <p style="margin: 5px 0;"><strong>RMA Number:</strong> ${returnRequest.rma_number}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${status.toUpperCase()}</p>
            <p style="margin: 5px 0;"><strong>Refund Amount:</strong> Rs. ${Number(returnRequest.refund_amount || 0).toLocaleString()}</p>
          </div>
        </div>
        <div class="footer">
          If you have questions regarding your return claim, please contact our support team.
        </div>
      </div>
    </body>
    </html>
  `;
};