// lib/emailTemplates/contactForm.ts
export const contactFormTemplate = (data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Customer Inquiry - ${data.name}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 24px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background: #18181b; padding: 30px 24px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #c99648; display: block; margin-bottom: 6px;">
            TALAL WOODEN LAMPS • CUSTOMER CONCIERGE
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">
            ✉️ New Customer Message
          </h1>
          <div style="margin-top: 10px; display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); padding: 5px 14px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #fef08a;">
            ${data.subject || "General Inquiry"}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 26px 24px;">
          <!-- Sender Details Table -->
          <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 22px; font-size: 13px;">
            <tbody>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500; width: 35%; border-bottom: 1px solid #f1f5f9;">Customer Name:</td>
                <td style="padding: 10px 14px; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">${data.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Email Address:</td>
                <td style="padding: 10px 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #f1f5f9;">
                  <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a>
                </td>
              </tr>
              ${
                data.phone
                  ? `
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Phone Number:</td>
                <td style="padding: 10px 14px; font-weight: 600; color: #0f172a; text-align: right;">${data.phone}</td>
              </tr>
              `
                  : ""
              }
            </tbody>
          </table>

          <!-- Message Box -->
          <div style="margin-bottom: 24px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569; letter-spacing: 0.12em; display: block; margin-bottom: 8px;">
              MESSAGE CONTENT
            </span>
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 13px; color: #334155; line-height: 1.65; white-space: pre-wrap;">
${data.message}
            </div>
          </div>

          <!-- Reply CTA -->
          <div style="text-align: center; margin-top: 24px; margin-bottom: 10px;">
            <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject || "Your Inquiry with Talal Wooden Lamps")}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 30px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Reply Directly to Customer &rarr;
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          Talal Wooden Lamps • Notification System
        </div>

      </div>
    </body>
    </html>
  `;
};