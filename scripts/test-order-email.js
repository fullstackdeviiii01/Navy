const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });
const mongoose = require("mongoose");

async function testOrderConfirmationEmail() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);

  const { EmailService } = require("./lib/services/emailService");

  const mockOrder = {
    order_number: "ORD-TEST-EMAIL-001",
    order_type: "guest",
    guest_info: {
      name: "Test Customer",
      email: "rehan048686@gmail.com",
      phone: "03001234567",
    },
    shipping_address: {
      full_name: "Test Customer",
      address_line1: "123 Test Street",
      city: "Karachi",
      province: "Sindh",
      postal_code: "75500",
      phone: "03001234567",
    },
    items: [
      {
        product_name: "Modern wooden lamp",
        quantity: 1,
        price: 200,
        variant_attributes: { color: "Green", size: "s" },
      },
    ],
    pricing: {
      subtotal: 200,
      shipping_cost: 0,
      total: 200,
      currency: "PKR",
    },
    placed_at: new Date(),
  };

  console.log("=== SENDING TEST ORDER CONFIRMATION EMAIL ===");
  await EmailService.sendOrderConfirmationEmail(mockOrder);
  console.log("=== TEST FINISHED ===");

  await mongoose.disconnect();
}

testOrderConfirmationEmail().catch(console.error);
