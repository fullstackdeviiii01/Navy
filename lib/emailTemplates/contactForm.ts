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
      <title>Bespoke Inquiry / Contact - ${data.name}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
        
        <!-- Header -->
        <div style="background: #18181b; padding: 26px 20px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #c99648; display: block; margin-bottom: 4px;">
            TALAL WOODEN LAMPS • CONCIERGE INQUIRY
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">
            ✉️ New Client Inquiry
          </h1>
          <div style="margin-top: 8px; display: inline-block; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #fef08a;">
            ${data.subject || "General Inquiry"}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 22px;">
          <!-- Sender Details Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748b;">Client Name:</span>
              <span style="font-weight: 600; color: #0f172a;">${data.name}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748b;">Email Address:</span>
              <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${data.email}</a>
            </div>
            ${
              data.phone
                ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Contact Phone:</span>
              <span style="font-weight: 600; color: #0f172a;">${data.phone}</span>
            </div>
            `
                : ""
            }
          </div>

          <!-- Message Box -->
          <div style="margin-bottom: 22px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #475569; letter-spacing: 0.12em; display: block; margin-bottom: 6px;">
              MESSAGE CONTENT
            </span>
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; font-size: 13px; color: #334155; line-height: 1.6; white-space: pre-wrap;">
${data.message}
            </div>
          </div>

          <!-- Reply CTA -->
          <div style="text-align: center; margin-top: 20px; margin-bottom: 8px;">
            <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject || "Your Inquiry with Talal Wooden Lamps")}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 11px 26px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; border-radius: 4px;">
              Reply Directly to Client &rarr;
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          Talal Wooden Lamps Concierge Routing System
        </div>

      </div>
    </body>
    </html>
  `;
};