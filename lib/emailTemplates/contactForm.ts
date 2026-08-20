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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content { 
          padding: 30px 20px;
        }
        .field { 
          margin-bottom: 20px;
          border-bottom: 1px solid #e5e5e5;
          padding-bottom: 15px;
        }
        .field:last-child {
          border-bottom: none;
        }
        .label { 
          font-weight: 600; 
          color: #555; 
          margin-bottom: 5px; 
          display: block; 
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .value { 
          color: #333;
          font-size: 15px;
          word-wrap: break-word;
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
          <h1>📧 New Contact Form Submission</h1>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Name</span>
            <div class="value">${data.name}</div>
          </div>
          <div class="field">
            <span class="label">Email</span>
            <div class="value"><a href="mailto:${data.email}" style="color: #667eea; text-decoration: none;">${data.email}</a></div>
          </div>
          ${
            data.phone
              ? `
          <div class="field">
            <span class="label">Phone</span>
            <div class="value">${data.phone}</div>
          </div>
          `
              : ""
          }
          ${
            data.subject
              ? `
          <div class="field">
            <span class="label">Subject</span>
            <div class="value">${data.subject}</div>
          </div>
          `
              : ""
          }
          <div class="field">
            <span class="label">Message</span>
            <div class="value">${data.message.replace(/\n/g, "<br>")}</div>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent from your website contact form.</p>
          <p>Reply directly to this email to respond to ${data.name}.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};