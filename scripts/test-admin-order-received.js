const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

async function testAdminOrderReceivedEmail() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const config = await db.collection("emailconfigurations").findOne();
  const { adminOrderReceivedTemplate } = require("./lib/emailTemplates/adminOrderReceived");

  const mockOrder = {
    order_number: "ORD-882194-TEST",
    order_type: "guest",
    guest_info: {
      name: "Talal Ahmad",
      email: "talal@example.com",
      phone: "03001234567",
    },
    payment_method: "cod",
    payment_status: "pending",
    shipping_address: {
      address_line1: "Suite 404, Atelier Road, Clifton",
      city: "Karachi",
      province: "Sindh",
    },
    items: [
      {
        product_name: "Modern wooden lamp",
        quantity: 1,
        price: 200,
        variant_attributes: { color: "Green", size: "s" },
      },
      {
        product_name: "Classic wooden lamp",
        quantity: 1,
        price: 206,
        variant_attributes: { color: "White", size: "Large" },
      },
    ],
    pricing: {
      subtotal: 406,
      shipping_cost: 0,
      total: 406,
      currency: "PKR",
    },
    placed_at: new Date(),
  };

  const html = adminOrderReceivedTemplate(mockOrder);

  const transporter = nodemailer.createTransport({
    host: config.smtp_settings.host,
    port: config.smtp_settings.port,
    secure: config.smtp_settings.secure,
    auth: {
      user: config.smtp_settings.auth_user,
      pass: config.smtp_settings.auth_pass,
    },
  });

  console.log("Sending dedicated Admin Order Received email to:", config.email_notifications.order_confirmation.admin_email);
  const info = await transporter.sendMail({
    from: `"${config.sender_info.from_name}" <${config.sender_info.from_email}>`,
    to: config.email_notifications.order_confirmation.admin_email,
    subject: `📦 [New Order Received] Order #${mockOrder.order_number} from ${mockOrder.guest_info.name}`,
    html,
  });

  console.log("✅ Admin Order Received email sent! MessageId:", info.messageId);

  await mongoose.disconnect();
}

testAdminOrderReceivedEmail().catch(console.error);
