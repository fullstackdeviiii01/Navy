// lib/emailTemplates/orderConfirmation.ts
export const orderConfirmationTemplate = (order: any) => {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://talalwoodenlamp.com"
  ).replace(/\/$/, "");

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

  const paymentStatusLabel =
    order.payment_status === "paid"
      ? "PAID"
      : order.payment_status === "pending"
      ? "PENDING VERIFICATION"
      : (order.payment_status || "PENDING").toUpperCase();

  const paymentStatusColor =
    order.payment_status === "paid" ? "#16a34a" : "#b45309";

  const itemsHtml = (order.items || [])
    .map((item: any) => {
      const attributes = item.variant_attributes
        ? Object.entries(item.variant_attributes)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" | ")
        : "";

      return `
        <tr>
          <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #1e293b;">
            <strong style="color: #0f172a;">${item.product_name || "Handcrafted Luminaire"}</strong>
            ${attributes ? `<div style="font-size: 11px; color: #64748b; margin-top: 3px;">${attributes}</div>` : ""}
          </td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; text-align: center; font-weight: 500;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #0f172a; text-align: right; font-weight: 600; font-family: monospace;">
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
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
        
        <!-- Header -->
        <div style="background: #18181b; padding: 30px 24px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #c99648; display: block; margin-bottom: 6px;">
            TALAL WOODEN LAMPS • HEIRLOOM LIGHTING
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em;">
            Thank You For Your Order
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
          <p style="margin: 0 0 20px; font-size: 13px; color: #475569; line-height: 1.55;">
            We have received your order. Our artisans are preparing your handcrafted luminaire with the utmost care and precision.
          </p>

          <!-- Order Summary Meta Table (Email-Client Safe Table Layout) -->
          <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 22px; font-size: 13px;">
            <tbody>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500; width: 40%; border-bottom: 1px solid #f1f5f9;">
                  Payment Method:
                </td>
                <td style="padding: 10px 14px; font-weight: 600; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">
                  ${paymentMethodLabel}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">
                  Payment Status:
                </td>
                <td style="padding: 10px 14px; font-weight: 700; color: ${paymentStatusColor}; text-align: right; border-bottom: 1px solid #f1f5f9;">
                  ${paymentStatusLabel}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500; vertical-align: top;">
                  Delivery Destination:
                </td>
                <td style="padding: 10px 14px; font-weight: 600; color: #0f172a; text-align: right;">
                  ${[order.shipping_address?.address_line1, order.shipping_address?.city].filter(Boolean).join(", ") || "Pakistan"}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Items Table -->
          <div style="margin-bottom: 20px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569; letter-spacing: 0.12em; display: block; margin-bottom: 8px;">
              ACQUISITION SUMMARY
            </span>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background-color: #f1f5f9;">
                  <th style="padding: 9px 10px; font-size: 11px; text-transform: uppercase; text-align: left; color: #475569; border-bottom: 1px solid #e2e8f0;">Piece</th>
                  <th style="padding: 9px 10px; font-size: 11px; text-transform: uppercase; text-align: center; color: #475569; border-bottom: 1px solid #e2e8f0;">Qty</th>
                  <th style="padding: 9px 10px; font-size: 11px; text-transform: uppercase; text-align: right; color: #475569; border-bottom: 1px solid #e2e8f0;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Totals Table -->
          <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px; font-size: 13px;">
            <tbody>
              <tr>
                <td style="padding: 8px 14px; color: #64748b;">Subtotal:</td>
                <td style="padding: 8px 14px; text-align: right; font-weight: 500; color: #0f172a; font-family: monospace;">
                  Rs. ${(order.pricing?.subtotal || 0).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 14px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Shipping:</td>
                <td style="padding: 8px 14px; text-align: right; font-weight: 500; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                  ${order.pricing?.shipping_cost === 0 ? "Complimentary" : `Rs. ${(order.pricing?.shipping_cost || 0).toLocaleString()}`}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 14px; font-size: 14px; font-weight: 700; color: #0f172a;">Grand Total:</td>
                <td style="padding: 12px 14px; font-size: 15px; font-weight: 700; color: #c99648; text-align: right; font-family: monospace;">
                  Rs. ${(order.pricing?.total || 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Track Order CTA Button -->
          <div style="text-align: center; margin-top: 24px; margin-bottom: 10px;">
            <a href="${baseUrl}/order-confirmation/${order._id}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 30px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Track Order Status &rarr;
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          Talal Wooden Lamps • Support: concierge@talalwoodenlamps.com
        </div>

      </div>
    </body>
    </html>
  `;
};