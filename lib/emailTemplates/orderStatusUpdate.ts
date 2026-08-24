// lib/emailTemplates/orderStatusUpdate.ts
export const orderStatusUpdateTemplate = (order: any, status: string) => {
  const customerName =
    order.order_type === "guest"
      ? order.guest_info?.name
      : (order.user_id?.name || order.guest_info?.name || "Valued Patron");

  const statusConfig: Record<string, { title: string; subtitle: string; color: string; message: string }> = {
    confirmed: {
      title: "Order Confirmed",
      subtitle: "PAYMENT VERIFIED & ORDER QUEUED",
      color: "#16a34a",
      message: "Your payment has been successfully confirmed. Our master woodturners and electricians have begun preparing your luminaire.",
    },
    processing: {
      title: "Crafting in Progress",
      subtitle: "ATELIER FABRICATION & ASSEMBLY",
      color: "#854d0e",
      message: "Your pieces are currently undergoing final sanding, finishing, and electrical calibration in our workshop.",
    },
    shipped: {
      title: "Dispatched via Courier",
      subtitle: "ON THE WAY TO YOUR DESTINATION",
      color: "#0284c7",
      message: "Your luminaire has been securely packed in custom protective casing and handed over to our courier partner for tracked delivery.",
    },
    delivered: {
      title: "Order Delivered",
      subtitle: "PACKAGE SAFELY DELIVERED",
      color: "#15803d",
      message: "Your handcrafted lamp has been delivered to your designated address. We hope it illuminates your living space with warmth.",
    },
    cancelled: {
      title: "Order Cancelled",
      subtitle: "ORDER CANCELLED & VOIDED",
      color: "#dc2626",
      message: "Your order has been cancelled. If you have any inquiries regarding refunds or replacements, please contact our concierge.",
    },
  };

  const current = statusConfig[status] || statusConfig.confirmed;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${current.title} - ${order.order_number}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
        
        <!-- Header -->
        <div style="background: #18181b; padding: 26px 20px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #c99648; display: block; margin-bottom: 4px;">
            ${current.subtitle}
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">
            ${current.title}
          </h1>
          <div style="margin-top: 8px; display: inline-block; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #fef08a;">
            Order #${order.order_number}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 22px;">
          <p style="margin: 0 0 14px; font-size: 14px; color: #374151;">
            Dear <strong>${customerName}</strong>,
          </p>

          <div style="background-color: #f8fafc; border-left: 4px solid ${current.color}; padding: 14px 16px; margin-bottom: 20px; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">
              ${current.message}
            </p>
          </div>

          <!-- Order Summary Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748b;">Current Status:</span>
              <span style="font-weight: 700; text-transform: uppercase; color: ${current.color};">${status.toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748b;">Grand Total:</span>
              <span style="font-weight: 600; color: #0f172a;">Rs. ${(order.pricing?.total || 0).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Destination:</span>
              <span style="font-weight: 600; color: #0f172a;">${order.shipping_address?.city || "Pakistan"}</span>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 20px; margin-bottom: 8px;">
            <a href="http://localhost:3000/order-confirmation/${order._id}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 11px 26px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; border-radius: 4px;">
              View Live Order Status &rarr;
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          Talal Wooden Lamps • Support: concierge@talalwoodenlamps.com
        </div>

      </div>
    </body>
    </html>
  `;
};