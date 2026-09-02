// lib/emailTemplates/returnStatusUpdate.ts
export const returnStatusUpdateTemplate = (returnRequest: any, status: string) => {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://talalwoodenlamp.com"
  ).replace(/\/$/, "");

  const statusConfig: Record<string, { title: string; subtitle: string; color: string; message: string }> = {
    approved: {
      title: "Return Claim Approved",
      subtitle: "INSPECTION DISPATCH AUTHORIZED",
      color: "#16a34a",
      message: "Your return claim has been approved by our concierge. Please dispatch the luminaire securely packed to our workshop address for inspection.",
    },
    received: {
      title: "Returned Item Received",
      subtitle: "PACKAGE ARRIVED AT ATELIER",
      color: "#0284c7",
      message: "We have received your returned item at our atelier. Our quality control team is conducting the material and craftsmanship inspection.",
    },
    processed: {
      title: "Inspection Complete",
      subtitle: "REFUND QUEUED FOR DISBURSEMENT",
      color: "#854d0e",
      message: "Your returned item has passed inspection. The refund disbursement has been authorized and queued for immediate settlement.",
    },
    rejected: {
      title: "Return Claim Closed",
      subtitle: "INSPECTION NOT APPROVED",
      color: "#dc2626",
      message: "Your return claim could not be approved based on our inspection criteria. Our concierge team has noted the details on your claim.",
    },
  };

  const current = statusConfig[status] || statusConfig.approved;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${current.title} - ${returnRequest.rma_number}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
        
        <!-- Header -->
        <div style="background: #18181b; padding: 30px 24px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #c99648; display: block; margin-bottom: 6px;">
            ${current.subtitle}
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">
            ${current.title}
          </h1>
          <div style="margin-top: 10px; display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); padding: 5px 14px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #fef08a;">
            RMA #${returnRequest.rma_number}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 26px 24px;">
          <div style="background-color: #f8fafc; border-left: 4px solid ${current.color}; padding: 14px 16px; margin-bottom: 22px; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.55;">
              ${current.message}
            </p>
          </div>

          <!-- Claim Meta Table -->
          <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px; font-size: 13px;">
            <tbody>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500; width: 40%; border-bottom: 1px solid #f1f5f9;">Claim Status:</td>
                <td style="padding: 10px 14px; font-weight: 700; text-transform: uppercase; color: ${current.color}; text-align: right; border-bottom: 1px solid #f1f5f9;">
                  ${status.toUpperCase()}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Refund Amount:</td>
                <td style="padding: 10px 14px; font-weight: 700; color: #c99648; text-align: right; font-family: monospace;">
                  Rs. ${(returnRequest.refund_amount || 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 24px; margin-bottom: 10px;">
            <a href="${baseUrl}/orders" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 30px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              View Return Details &rarr;
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          Talal Wooden Lamp • Support: contact@talalwoodenlamp.com
        </div>

      </div>
    </body>
    </html>
  `;
};