// lib/emailTemplates/orderStatusUpdate.ts
export const orderStatusUpdateTemplate = (order: any, status: string) => {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://talalwoodenlamp.com"
  ).replace(/\/$/, "");

  const customerName =
    order.order_type === "guest"
      ? order.guest_info?.name
      : (order.user_id?.name || order.guest_info?.name || "Valued Patron");

  const statusConfig: Record<string, { title: string; subtitle: string; color: string; message: string }> = {
    confirmed: {
      title: "Order Confirmed",
      subtitle: "PAYMENT VERIFIED & ORDER QUEUED",
      color: "#16a34a",
      message: "Your payment has been successfully confirmed. Our master woodturners and artisans have begun preparing your handcrafted luminaire.",
    },
    processing: {
      title: "Crafting in Progress",
      subtitle: "ATELIER FABRICATION & ASSEMBLY",
      color: "#854d0e",
      message: "Your pieces are currently undergoing final sanding, natural oil finishing, and electrical calibration in our atelier.",
    },
    shipped: {
      title: "Dispatched via Courier",
      subtitle: "ON THE WAY TO YOUR DESTINATION",
      color: "#0284c7",
      message: "Your luminaire has been securely packed in custom protective casing and dispatched for tracked delivery.",
    },
    delivered: {
      title: "Order Delivered",
      subtitle: "PACKAGE SAFELY DELIVERED",
      color: "#15803d",
      message: "Your handcrafted lamp has been delivered to your designated address. We hope it illuminates your living space with elegance and warmth.",
    },
    cancelled: {
      title: "Order Cancelled",
      subtitle: "ORDER CANCELLED & VOIDED",
      color: "#dc2626",
      message: "Your order has been cancelled. If you have any questions regarding replacements or refunds, please contact our concierge team.",
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
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
        
        <!-- Header -->
        <div style="background: #18181b; padding: 30px 24px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #c99648; display: block; margin-bottom: 6px;">
            ${current.subtitle}
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em;">
            ${current.title}
          </h1>
          <div style="margin-top: 10px; display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); padding: 5px 14px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #fef08a;">
            Order #${order.order_number}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 26px 24px;">
          <p style="margin: 0 0 14px; font-size: 14px; color: #1e293b;">
            Dear <strong>${customerName}</strong>,
          </p>

          <div style="background-color: #f8fafc; border-left: 4px solid ${current.color}; padding: 14px 16px; margin-bottom: 22px; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.55;">
              ${current.message}
            </p>
          </div>

          <!-- Order Summary Meta Table -->
          <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px; font-size: 13px;">
            <tbody>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500; width: 40%; border-bottom: 1px solid #f1f5f9;">
                  Current Status:
                </td>
                <td style="padding: 10px 14px; font-weight: 700; text-transform: uppercase; color: ${current.color}; text-align: right; border-bottom: 1px solid #f1f5f9;">
                  ${status.toUpperCase()}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">
                  Grand Total:
                </td>
                <td style="padding: 10px 14px; font-weight: 600; color: #0f172a; text-align: right; font-family: monospace; border-bottom: 1px solid #f1f5f9;">
                  Rs. ${(order.pricing?.total || 0).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">
                  Delivery Destination:
                </td>
                <td style="padding: 10px 14px; font-weight: 600; color: #0f172a; text-align: right;">
                  ${order.shipping_address?.city || "Pakistan"}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 24px; margin-bottom: 10px;">
            <a href="${baseUrl}/order-confirmation/${order._id}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 30px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              View Live Order Status &rarr;
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