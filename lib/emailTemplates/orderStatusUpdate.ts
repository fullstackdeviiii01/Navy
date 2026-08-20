// lib/emailTemplates/orderStatusUpdate.ts - UPDATED WITH GUEST SUPPORT
export const orderStatusUpdateTemplate = (order: any, status: string) => {
  // Extract customer info based on order type
  const customerName = order.order_type === 'guest' 
    ? order.guest_info.name 
    : order.user_id.name;

  const statusConfig: any = {
    confirmed: {
      color: "#3b82f6",
      icon: "✓",
      title: "Order Confirmed",
      message:
        "Great news! Your order has been confirmed and is being prepared.",
    },
    processing: {
      color: "#8b5cf6",
      icon: "⚙",
      title: "Order Processing",
      message: "Your order is currently being processed and will ship soon.",
    },
    shipped: {
      color: "#0891b2",
      icon: "📦",
      title: "Order Shipped",
      message: "Your order is on its way to you!",
    },
    delivered: {
      color: "#10b981",
      icon: "✓",
      title: "Order Delivered",
      message:
        "Your order has been successfully delivered. We hope you enjoy your purchase!",
    },
    cancelled: {
      color: "#ef4444",
      icon: "✕",
      title: "Order Cancelled",
      message:
        "Your order has been cancelled. If you have any questions, please contact us.",
    },
  };

  const config = statusConfig[status] || statusConfig.confirmed;

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
          background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); 
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
        .order-number {
          background-color: rgba(255, 255, 255, 0.2);
          padding: 10px 20px;
          border-radius: 5px;
          display: inline-block;
          font-family: monospace;
          font-size: 16px;
          margin-top: 10px;
        }
        .content { 
          padding: 30px 20px;
        }
        .greeting {
          font-size: 16px;
          color: #333;
          margin-bottom: 20px;
        }
        .message-box {
          background-color: #f9fafb;
          padding: 20px;
          border-left: 4px solid ${config.color};
          border-radius: 4px;
          margin-bottom: 30px;
        }
        .tracking-box {
          background-color: #f0f9ff;
          border: 1px solid #0891b2;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .tracking-box p {
          margin: 5px 0;
        }
        .button {
          display: inline-block;
          background-color: ${config.color};
          color: white !important;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin-top: 20px;
        }
        ${order.order_type === 'guest' ? `
        .guest-info-box {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .guest-info-box p {
          margin: 5px 0;
          color: #92400e;
          font-size: 14px;
        }
        ` : ''}
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
          ${config.icon ? `<div class="icon">${config.icon}</div>` : ''}
          <h1>${config.title}</h1>
          <div class="order-number">Order #${order.order_number}</div>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hi ${customerName},
          </div>

          <div class="message-box">
            <p style="font-size: 16px; margin: 0;">${config.message}</p>
          </div>

          ${
            status === "shipped" && (order.tracking_number || order.carrier)
              ? `
          <div class="tracking-box">
            <p style="font-weight: 600; margin-bottom: 10px;">Tracking Information</p>
            ${order.carrier ? `<p><strong>Carrier:</strong> ${order.carrier}</p>` : ""}
            ${
              order.tracking_number
                ? `<p><strong>Tracking Number:</strong> <span style="font-family: monospace;">${order.tracking_number}</span></p>`
                : ""
            }
            <p style="margin-top: 10px; font-size: 14px; color: #666;">You can use this tracking number to monitor your delivery status.</p>
          </div>
          `
              : ""
          }

          ${order.order_type === 'guest' ? `
          <div class="guest-info-box">
            <p><strong>Important for Guest Orders:</strong></p>
            <p>Save this email! You'll need your order number (#${order.order_number}) to track your shipment or contact support.</p>
            <p style="margin-top: 10px;">Want easier order tracking? <a href="${process.env.NEXT_PUBLIC_BASE_URL || ""}/sign-up" style="color: #92400e; font-weight: 600;">Create an account →</a></p>
          </div>
          ` : ''}

          <div style="margin-top: 30px;">
            <p style="font-weight: 600; margin-bottom: 10px;">Order Details:</p>
            <p style="color: #666; margin: 5px 0;">Order Date: ${new Date(
              order.placed_at,
            ).toLocaleDateString()}</p>
            <p style="color: #666; margin: 5px 0;">Total: $${order.pricing.total.toFixed(
              2,
            )}</p>
            <p style="color: #666; margin: 5px 0;">Items: ${
              order.items.length
            }</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || ""}/orders/${
              order._id
            }" class="button">
              View Full Order Details
            </a>
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
};