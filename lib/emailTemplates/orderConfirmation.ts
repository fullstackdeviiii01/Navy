// lib/emailTemplates/orderConfirmation.ts
export const orderConfirmationTemplate = (order: any) => {
  const customerName =
    order.order_type === "guest"
      ? order.guest_info?.name
      : (order.user_id?.name || order.guest_info?.name || "Valued Patron");

  const paymentMethodLabel =
    order.payment_method === "cod"
      ? "Cash on Delivery (COD)"
      : order.payment_method === "bank_transfer"
      ? "Bank Transfer (Meezan Bank)"
      : order.payment_method === "jazzcash"
      ? "JazzCash Mobile Wallet"
      : order.payment_method?.toUpperCase() || "Standard Payment";

  const itemsHtml = (order.items || [])
    .map((item: any) => {
      const attributes = item.variant_attributes
        ? Object.entries(item.variant_attributes)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" | ")
        : "";

      return `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #1f2937;">
            <strong>${item.product_name || "Handcrafted Luminaire"}</strong>
            ${attributes ? `<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${attributes}</div>` : ""}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #1f2937; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #1f2937; text-align: right; font-weight: 600;">
            Rs. ${(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - ${order.order_number}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
        
        <!-- Header -->
        <div style="background: #18181b; padding: 26px 20px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #c99648; display: block; margin-bottom: 4px;">
            TALAL WOODEN LAMPS • HEIRLOOM LIGHTING
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">
            Thank You For Your Order
          </h1>
          <div style="margin-top: 8px; display: inline-block; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #fef08a;">
            Order #${order.order_number}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 22px;">
          <p style="margin: 0 0 16px; font-size: 14px; color: #374151;">
            Dear <strong>${customerName}</strong>,
          </p>
          <p style="margin: 0 0 18px; font-size: 13px; color: #4b5563; line-height: 1.5;">
            We have received your order. Our artisans are preparing your handcrafted luminaire with the utmost care and precision.
          </p>

          <!-- Order Summary Meta Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748b;">Payment Method:</span>
              <span style="font-weight: 600; color: #0f172a;">${paymentMethodLabel}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748b;">Payment Status:</span>
              <span style="font-weight: 600; text-transform: uppercase; color: ${order.payment_status === "paid" ? "#16a34a" : "#ca8a04"};">${order.payment_status || "Pending"}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Delivery Destination:</span>
              <span style="font-weight: 600; color: #0f172a; text-align: right; max-width: 60%;">
                ${order.shipping_address?.address_line1 || ""}, ${order.shipping_address?.city || ""}
              </span>
            </div>
          </div>

          <!-- Items Table -->
          <div style="margin-bottom: 18px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #475569; letter-spacing: 0.12em; display: block; margin-bottom: 6px;">
              ACQUISITION SUMMARY
            </span>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
              <thead>
                <tr style="background-color: #f1f5f9;">
                  <th style="padding: 7px 8px; font-size: 11px; text-transform: uppercase; text-align: left; color: #64748b; border-bottom: 1px solid #e2e8f0;">Piece</th>
                  <th style="padding: 7px 8px; font-size: 11px; text-transform: uppercase; text-align: center; color: #64748b; border-bottom: 1px solid #e2e8f0;">Qty</th>
                  <th style="padding: 7px 8px; font-size: 11px; text-transform: uppercase; text-align: right; color: #64748b; border-bottom: 1px solid #e2e8f0;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Totals Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 22px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">Subtotal:</span>
              <span>Rs. ${(order.pricing?.subtotal || 0).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748b;">Courier Shipping:</span>
              <span>${order.pricing?.shipping_cost === 0 ? "Complimentary" : `Rs. ${(order.pricing?.shipping_cost || 0).toLocaleString()}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; border-top: 1px solid #e2e8f0; padding-top: 6px; color: #0f172a;">
              <span>Grand Total:</span>
              <span style="color: #c99648;">Rs. ${(order.pricing?.total || 0).toLocaleString()}</span>
            </div>
          </div>

          <!-- Track Order CTA -->
          <div style="text-align: center; margin-top: 20px; margin-bottom: 8px;">
            <a href="http://localhost:3000/order-confirmation/${order._id}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 11px 26px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; border-radius: 4px;">
              Track Order Status &rarr;
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