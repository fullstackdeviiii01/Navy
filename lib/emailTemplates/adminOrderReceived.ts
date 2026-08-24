// lib/emailTemplates/adminOrderReceived.ts
export const adminOrderReceivedTemplate = (order: any) => {
  const customerName =
    order.order_type === "guest"
      ? order.guest_info?.name
      : (order.user_id?.name || order.guest_info?.name || "Customer");

  const customerEmail =
    order.order_type === "guest"
      ? order.guest_info?.email
      : (order.user_id?.email || order.guest_info?.email || "N/A");

  const customerPhone =
    order.shipping_address?.phone ||
    (order.order_type === "guest" ? order.guest_info?.phone : order.user_id?.phone) ||
    "N/A";

  const paymentMethodLabel =
    order.payment_method === "cod"
      ? "Cash on Delivery (COD)"
      : order.payment_method === "bank_transfer"
      ? "Bank Transfer (Meezan Bank)"
      : order.payment_method === "jazzcash"
      ? "JazzCash Mobile Wallet"
      : order.payment_method?.toUpperCase() || "N/A";

  const itemsHtml = (order.items || [])
    .map((item: any) => {
      const attributes = item.variant_attributes
        ? Object.entries(item.variant_attributes)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" | ")
        : "";

      return `
        <tr>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #1f2937;">
            <strong>${item.product_name || "Product"}</strong>
            ${attributes ? `<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${attributes}</div>` : ""}
          </td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #1f2937; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #1f2937; text-align: right; font-weight: 600;">
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
      <title>New Order Received - ${order.order_number}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="max-width: 620px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background: #18181b; padding: 28px 24px; text-align: center; color: #ffffff;">
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #c99648; display: block; margin-bottom: 6px;">
            TALAL WOODEN LAMPS • ATELIER DISPATCH
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
            📦 New Order Received
          </h1>
          <div style="margin-top: 10px; display: inline-block; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #fef08a;">
            Order #${order.order_number}
          </div>
        </div>

        <!-- Body Content -->
        <div style="padding: 24px;">
          
          <!-- Key Order Alert -->
          <div style="background-color: #f8fafc; border-left: 4px solid #c99648; padding: 14px 16px; margin-bottom: 20px; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; font-size: 13px; color: #334155;">
              A new customer order has been placed on your store and is awaiting fulfillment preparation.
            </p>
          </div>

          <!-- Customer & Order Meta -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 13px;">
            <div style="background: #fafafa; border: 1px solid #f0f0f0; padding: 14px; border-radius: 6px;">
              <span style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #854d0e; letter-spacing: 0.1em; display: block; margin-bottom: 6px;">
                CUSTOMER DETAILS
              </span>
              <div><strong>Name:</strong> ${customerName}</div>
              <div><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #2563eb; text-decoration: none;">${customerEmail}</a></div>
              <div><strong>Phone:</strong> ${customerPhone}</div>
              <div><strong>Type:</strong> <span style="text-transform: capitalize;">${order.order_type || "Registered"}</span></div>
            </div>

            <div style="background: #fafafa; border: 1px solid #f0f0f0; padding: 14px; border-radius: 6px; margin-top: 10px;">
              <span style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #854d0e; letter-spacing: 0.1em; display: block; margin-bottom: 6px;">
                PAYMENT & SHIPPING
              </span>
              <div><strong>Payment Method:</strong> ${paymentMethodLabel}</div>
              <div><strong>Payment Status:</strong> <span style="text-transform: uppercase; font-weight: 600; color: ${order.payment_status === "paid" ? "#15803d" : "#b45309"};">${order.payment_status || "Pending"}</span></div>
              <div><strong>Shipping Address:</strong> ${order.shipping_address?.address_line1 || ""}, ${order.shipping_address?.city || ""}, ${order.shipping_address?.province || ""}</div>
            </div>
          </div>

          <!-- Items Table -->
          <div style="margin-bottom: 20px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #374151; letter-spacing: 0.15em; display: block; margin-bottom: 8px;">
              ORDER ITEMS (${order.items?.length || 0})
            </span>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 8px 10px; font-size: 11px; text-transform: uppercase; text-align: left; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Product</th>
                  <th style="padding: 8px 10px; font-size: 11px; text-transform: uppercase; text-align: center; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Qty</th>
                  <th style="padding: 8px 10px; font-size: 11px; text-transform: uppercase; text-align: right; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div style="margin-bottom: 24px; padding: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
              <span style="color: #6b7280;">Subtotal:</span>
              <span>Rs. ${(order.pricing?.subtotal || 0).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
              <span style="color: #6b7280;">Shipping:</span>
              <span>${order.pricing?.shipping_cost === 0 ? "Free" : `Rs. ${(order.pricing?.shipping_cost || 0).toLocaleString()}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; border-top: 1px solid #e5e7eb; padding-top: 6px; color: #111827;">
              <span>Grand Total:</span>
              <span style="color: #c99648;">Rs. ${(order.pricing?.total || 0).toLocaleString()}</span>
            </div>
          </div>

          <!-- CTA Button to Admin Panel -->
          <div style="text-align: center; margin-top: 28px; margin-bottom: 10px;">
            <a href="http://localhost:3000/admin/orders" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 28px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; border-radius: 4px; border: 1px solid #27272a;">
              Open Order in Admin Panel &rarr;
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 14px 20px; text-align: center; font-size: 11px; color: #9ca3af;">
          Talal Wooden Lamps Concierge Automated Dispatch System
        </div>

      </div>
    </body>
    </html>
  `;
};
