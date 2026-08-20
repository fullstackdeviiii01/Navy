// lib/emailTemplates/orderConfirmation.ts - UPDATED WITH GUEST SUPPORT
export const orderConfirmationTemplate = (order: any) => {
  // Extract customer info based on order type
  const customerName = order.order_type === 'guest' 
    ? order.guest_info.name 
    : order.user_id.name;

  const customerEmail = order.order_type === 'guest' 
    ? order.guest_info.email 
    : order.user_id.email;

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
          background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
          color: white; 
          padding: 40px 20px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 600;
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
        ${order.order_type === 'guest' ? `
        .guest-badge {
          background-color: rgba(255, 255, 255, 0.3);
          padding: 5px 15px;
          border-radius: 20px;
          display: inline-block;
          font-size: 12px;
          margin-top: 10px;
          font-weight: 500;
        }
        ` : ''}
        .content { 
          padding: 30px 20px;
        }
        .greeting {
          font-size: 18px;
          color: #333;
          margin-bottom: 20px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #10b981;
        }
        .item {
          display: flex;
          padding: 15px 0;
          border-bottom: 1px solid #e5e5e5;
        }
        .item:last-child {
          border-bottom: none;
        }
        .item-details {
          flex: 1;
        }
        .item-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }
        .item-variant {
          display: inline-block;
          background-color: #e0e7ff;
          color: #4338ca;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 11px;
          margin-right: 5px;
          margin-bottom: 5px;
        }
        .item-quantity {
          color: #666;
          font-size: 14px;
        }
        .item-price {
          font-weight: 600;
          color: #10b981;
          text-align: right;
        }
        .address-box {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
        }
        .address-box p {
          margin: 5px 0;
          font-size: 14px;
        }
        .totals {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 15px;
        }
        .total-row.grand-total {
          border-top: 2px solid #10b981;
          padding-top: 15px;
          margin-top: 10px;
          font-size: 18px;
          font-weight: 600;
        }
        .button {
          display: inline-block;
          background-color: #10b981;
          color: white !important;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin-top: 20px;
        }
        ${order.order_type === 'guest' ? `
        .guest-info-box {
          background-color: #dbeafe;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .guest-info-box p {
          margin: 5px 0;
          color: #1e40af;
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
          <h1>Order Confirmed!</h1>
          <p style="margin: 10px 0;">Thank you for your order</p>
          <div class="order-number">Order #${order.order_number}</div>
          ${order.order_type === 'guest' ? `
          <div class="guest-badge">Guest Order</div>
          ` : ''}
        </div>
        
        <div class="content">
          <div class="greeting">
            Hi ${customerName},
          </div>

          ${order.order_type === 'guest' ? `
          <div class="guest-info-box">
            <p><strong>Quick Tip:</strong> Create an account to track your orders easily and enjoy faster checkout next time!</p>
            <p style="margin-top: 10px;"><a href="${process.env.NEXT_PUBLIC_BASE_URL || ""}/sign-up" style="color: #1e40af; font-weight: 600;">Create Account →</a></p>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Order Items</div>
            ${order.items
              .map(
                (item: any) => `
              <div class="item">
                <div class="item-details">
                  <div class="item-name">${item.product_name}</div>
                  ${
                    item.variant_attributes &&
                    Object.keys(item.variant_attributes).length > 0
                      ? Object.entries(item.variant_attributes)
                          .map(
                            ([key, value]) =>
                              `<span class="item-variant">${key}: ${value}</span>`
                          )
                          .join("")
                      : ""
                  }
                  <div class="item-quantity">Quantity: ${
                    item.quantity
                  } × $${item.price.toFixed(2)}</div>
                </div>
                <div class="item-price">$${item.subtotal.toFixed(2)}</div>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="section">
            <div class="section-title">Shipping Address</div>
            <div class="address-box">
              <p><strong>${order.shipping_address.full_name}</strong></p>
              <p>${order.shipping_address.phone}</p>
              <p>${order.shipping_address.line1}</p>
              ${
                order.shipping_address.line2
                  ? `<p>${order.shipping_address.line2}</p>`
                  : ""
              }
              <p>${order.shipping_address.city}, ${
    order.shipping_address.state
  } ${order.shipping_address.postal_code}</p>
              <p>${order.shipping_address.country}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Order Summary</div>
            <div class="totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>$${order.pricing.subtotal.toFixed(2)}</span>
              </div>
              ${
                order.pricing.discount_amount > 0
                  ? `
              <div class="total-row" style="color: #10b981;">
                <span>Discount</span>
                <span>-$${order.pricing.discount_amount.toFixed(2)}</span>
              </div>
              `
                  : ""
              }
              <div class="total-row">
                <span>Tax</span>
                <span>$${order.pricing.tax_amount.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Shipping</span>
                <span>${
                  order.pricing.shipping_cost === 0
                    ? "FREE"
                    : `$${order.pricing.shipping_cost.toFixed(2)}`
                }</span>
              </div>
              <div class="total-row grand-total">
                <span>Total</span>
                <span>$${order.pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          ${
            order.customer_notes
              ? `
          <div class="section">
            <div class="section-title">Your Notes</div>
            <p style="color: #666;">${order.customer_notes}</p>
          </div>
          `
              : ""
          }

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || ""}/order-confirmation/${
    order._id
  }" class="button">
              View Order Details
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};