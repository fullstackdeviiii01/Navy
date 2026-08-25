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
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 24px auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background: #18181b; padding: 28px 24px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #d4af37; display: block; margin-bottom: 6px;">
            REHAN WOODEN LAMPS • CUSTOMER CONTACT
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">
            ✉️ New Customer Message
          </h1>
          <div style="margin-top: 10px; display: inline-block; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); padding: 4px 14px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #fef08a;">
            ${data.subject || "General Inquiry"}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <!-- Sender Details Card -->
          <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
            <div style="margin-bottom: 8px;">
              <span style="color: #71717a; display: block; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Customer Name</span>
              <span style="font-weight: 700; color: #18181b; font-size: 14px;">${data.name}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="color: #71717a; display: block; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Email Address</span>
              <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${data.email}</a>
            </div>
            ${
              data.phone
                ? `
            <div>
              <span style="color: #71717a; display: block; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Phone Number</span>
              <span style="font-weight: 600; color: #18181b;">${data.phone}</span>
            </div>
            `
                : ""
            }
          </div>

          <!-- Message Box -->
          <div style="margin-bottom: 24px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #71717a; letter-spacing: 0.1em; display: block; margin-bottom: 8px;">
              MESSAGE
            </span>
            <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; font-size: 13px; color: #27272a; line-height: 1.65; white-space: pre-wrap;">
${data.message}
            </div>
          </div>

          <!-- Reply CTA -->
          <div style="text-align: center; margin-top: 24px; margin-bottom: 8px;">
            <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject || "Your Inquiry with Rehan Wooden Lamps")}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 28px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; border-radius: 6px;">
              Reply Directly to Customer &rarr;
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #fafafa; border-top: 1px solid #e4e4e7; padding: 14px 20px; text-align: center; font-size: 11px; color: #a1a1aa;">
          Rehan Wooden Lamps • Notification System
        </div>

      </div>
    </body>
    </html>
  `;
};