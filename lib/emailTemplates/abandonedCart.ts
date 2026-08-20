// lib/emailTemplates/abandonedCart.ts
export const abandonedCartTemplate = (cart: any, user: any) => {
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
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
          color: white; 
          padding: 40px 20px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
          font-size: 15px;
        }
        .content { 
          padding: 30px 20px;
        }
        .intro {
          text-align: center;
          margin-bottom: 30px;
        }
        .intro p {
          font-size: 16px;
          color: #666;
          margin: 5px 0;
        }
        .item {
          padding: 15px;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          margin-bottom: 15px;
          background-color: #fafafa;
        }
        .item-row {
          display: table;
          width: 100%;
        }
        .item-left {
          display: table-cell;
          vertical-align: top;
        }
        .item-right {
          display: table-cell;
          vertical-align: top;
          text-align: right;
          white-space: nowrap;
          padding-left: 10px;
          width: 80px;
        }
        .item-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
          font-size: 15px;
        }
        .item-variant {
          display: inline-block;
          background-color: #e0e7ff;
          color: #4338ca;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 11px;
          margin-right: 5px;
          margin-bottom: 4px;
        }
        .item-quantity {
          color: #666;
          font-size: 13px;
          margin-top: 4px;
        }
        .item-price {
          font-weight: 600;
          color: #f59e0b;
          font-size: 15px;
        }
        .total-box {
          background-color: #fffbeb;
          border: 2px solid #f59e0b;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 30px 0;
        }
        .total-label {
          margin: 0 0 5px 0;
          font-size: 14px;
          color: #666;
        }
        .total-amount {
          font-size: 32px;
          font-weight: 700;
          color: #f59e0b;
          margin: 10px 0;
        }
        .total-shipping {
          margin: 5px 0 0 0;
          font-size: 13px;
          color: #666;
        }
        .button {
          display: inline-block;
          background-color: #f59e0b;
          color: white !important;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
        }
        .trust-box {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          background-color: #f0fdf4;
          border-radius: 8px;
        }
        .trust-box p {
          margin: 4px 0;
          color: #15803d;
          font-size: 14px;
          font-weight: 600;
        }
        .footer { 
          text-align: center; 
          padding: 20px;
          background-color: #f9f9f9;
          color: #888; 
          font-size: 12px;
          border-top: 1px solid #e5e5e5;
        }
        .footer p {
          margin: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You Left Something Behind!</h1>
          <p>Complete your purchase today</p>
        </div>
        
        <div class="content">
          <div class="intro">
            <p>Hi ${user.name || "there"},</p>
            <p>We noticed you left ${cart.items.length} ${cart.items.length === 1 ? "item" : "items"} in your cart. Don't miss out!</p>
          </div>

          <div style="margin-bottom: 30px;">
            ${cart.items.map((item: any) => {
              const name = item.product_id?.name || "Product";
              const price = (item.price_at_addition * item.quantity).toFixed(2);

              let variantHtml = "";
              if (item.variant_attributes) {
                let entries: [string, string][] = [];
                if (item.variant_attributes instanceof Map) {
                  entries = Array.from(item.variant_attributes.entries()) as [string, string][];
                } else if (typeof item.variant_attributes === "object") {
                  const plain = Object.fromEntries
                    ? Object.fromEntries(Object.entries(item.variant_attributes).filter(([k]) => !k.startsWith("$")))
                    : {};
                  entries = Object.entries(plain) as [string, string][];
                }
                if (entries.length > 0) {
                  variantHtml = entries
                    .map(([key, value]) => `<span class="item-variant">${key}: ${value}</span>`)
                    .join("");
                }
              }

              return `
                <div class="item">
                  <div class="item-row">
                    <div class="item-left">
                      <div class="item-name">${name}</div>
                      ${variantHtml}
                      <div class="item-quantity">Quantity: ${item.quantity}</div>
                    </div>
                    <div class="item-right">
                      <div class="item-price">$${price}</div>
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>

          <div class="total-box">
            <p class="total-label">Your Cart Total</p>
            <div class="total-amount">$${cart.subtotal.toFixed(2)}</div>
            <p class="total-shipping">Free shipping on orders over $100</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || ""}/cart" class="button">
              Complete Your Purchase
            </a>
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
};