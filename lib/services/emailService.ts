import nodemailer from "nodemailer";
import EmailConfiguration from "../../app/models/EmailConfiguration";
import User from "../../app/models/User";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export class EmailService {
  private static async getConfiguration() {
    console.log("📧 [EMAIL DEBUG] Getting email configuration...");
    try {
      const config = await (EmailConfiguration as any).findOne();
      if (!config) {
        console.error("❌ [EMAIL DEBUG] Email configuration not found in database");
        throw new Error("Email configuration not found");
      }
      console.log("✅ [EMAIL DEBUG] Email configuration found");
      return config;
    } catch (error) {
      console.error("❌ [EMAIL DEBUG] Error getting configuration:", error);
      throw error;
    }
  }

  private static async isUserEmailEnabled(customerEmail: string): Promise<boolean> {
    try {
      const user = await (User as any).findOne(
        { email: customerEmail.toLowerCase().trim() },
        { email_notifications: 1 }
      );
      // Guest user (no account) — always send
      if (!user) return true;
      return user.email_notifications !== false;
    } catch {
      // Fail open — don't silently block emails on DB error
      return true;
    }
  }

  private static async createTransporter() {
    console.log("📧 [EMAIL DEBUG] Creating email transporter...");
    try {
      const config = await this.getConfiguration();

      if (!config.smtp_settings.auth_user || !config.smtp_settings.auth_pass) {
        console.error("❌ [EMAIL DEBUG] Email credentials not configured");
        throw new Error("Email credentials not configured");
      }

      const transporter = nodemailer.createTransport({
        host: config.smtp_settings.host,
        port: config.smtp_settings.port,
        secure: config.smtp_settings.secure,
        auth: {
          user: config.smtp_settings.auth_user,
          pass: config.smtp_settings.auth_pass,
        },
      });

      try {
        await transporter.verify();
        console.log("✅ [EMAIL DEBUG] SMTP connection verified successfully");
      } catch (verifyError) {
        console.error("❌ [EMAIL DEBUG] SMTP connection verification failed:", verifyError);
        throw verifyError;
      }

      return transporter;
    } catch (error) {
      console.error("❌ [EMAIL DEBUG] Failed to create transporter:", error);
      throw error;
    }
  }

  static async sendEmail(options: EmailOptions): Promise<void> {
    console.log("📧 [EMAIL DEBUG] === STARTING EMAIL SEND ===");
    console.log(`📧 [EMAIL DEBUG] To: ${options.to}`);
    console.log(`📧 [EMAIL DEBUG] Subject: ${options.subject}`);

    try {
      const config = await this.getConfiguration();
      const transporter = await this.createTransporter();

      const mailOptions = {
        from: `"${config.sender_info.from_name}" <${config.sender_info.from_email}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo || config.sender_info.reply_to,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ [EMAIL DEBUG] Email sent successfully!");
      console.log(`📧 [EMAIL DEBUG] Message ID: ${info.messageId}`);
    } catch (error: any) {
      console.error("❌ [EMAIL DEBUG] Email send failed:", error.message);
      throw error;
    } finally {
      console.log("📧 [EMAIL DEBUG] === EMAIL SEND COMPLETE ===");
    }
  }

  static async sendContactFormEmail(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }): Promise<void> {
    const config = await this.getConfiguration();

    if (!config.email_notifications.contact_form.enabled) {
      console.log("📧 [EMAIL DEBUG] Contact form emails are disabled");
      return;
    }

    // Contact form goes to admin — no user preference check needed
    const { contactFormTemplate } = await import("../../lib/emailTemplates/contactForm");
    const html = contactFormTemplate(data);

    await this.sendEmail({
      to: config.email_notifications.contact_form.recipient_email,
      subject: `${config.email_notifications.contact_form.subject_prefix} ${data.subject || "New Message"}`,
      html,
      replyTo: data.email,
    });
  }

  static async sendOrderConfirmationEmail(order: any): Promise<void> {
    const config = await this.getConfiguration();

    if (!config.email_notifications?.order_confirmation?.enabled) {
      console.log("📧 [EMAIL DEBUG] Order confirmation emails are disabled");
      return;
    }

    const { orderConfirmationTemplate } = await import(
      "../../lib/emailTemplates/orderConfirmation"
    );
    const html = orderConfirmationTemplate(order);

    const customerEmail =
      order.order_type === "guest"
        ? order.guest_info?.email
        : (order.user_id?.email || order.guest_info?.email);
    const customerName =
      order.order_type === "guest"
        ? order.guest_info?.name
        : (order.user_id?.name || order.guest_info?.name || "Customer");

    // 1. Send to customer
    if (config.email_notifications.order_confirmation.send_to_customer && customerEmail) {
      try {
        const canSend = await this.isUserEmailEnabled(customerEmail);
        if (canSend) {
          const subjectTemplate =
            config.email_notifications.order_confirmation.subject ||
            "Order Confirmation - {{order_number}}";
          const subject = subjectTemplate.replace(
            "{{order_number}}",
            order.order_number || ""
          );

          await this.sendEmail({
            to: customerEmail,
            subject,
            html,
          });
          console.log(`✅ [EMAIL DEBUG] Order confirmation sent to customer: ${customerEmail}`);
        } else {
          console.log(`📧 [EMAIL DEBUG] User has disabled email notifications: ${customerEmail}`);
        }
      } catch (custErr) {
        console.error("❌ [EMAIL DEBUG] Error sending customer order confirmation email:", custErr);
      }
    }

    // 2. Send to admin (Dedicated Admin Order Received Template)
    const adminEmail =
      config.email_notifications.order_confirmation.admin_email ||
      config.sender_info?.from_email ||
      config.smtp_settings?.auth_user;

    if (
      config.email_notifications.order_confirmation.send_to_admin &&
      adminEmail
    ) {
      try {
        const { adminOrderReceivedTemplate } = await import(
          "../../lib/emailTemplates/adminOrderReceived"
        );
        const adminHtml = adminOrderReceivedTemplate(order);

        await this.sendEmail({
          to: adminEmail,
          subject: `📦 [New Order Received] Order #${order.order_number} from ${customerName}`,
          html: adminHtml,
        });
        console.log(`✅ [EMAIL DEBUG] Order notification sent to admin: ${adminEmail}`);
      } catch (adminErr) {
        console.error("❌ [EMAIL DEBUG] Error sending admin order notification email:", adminErr);
      }
    }
  }

  static async sendOrderStatusUpdateEmail(order: any, status: string): Promise<void> {
    const config = await this.getConfiguration();

    if (!config.email_notifications.order_status_update.enabled) {
      console.log("📧 [EMAIL DEBUG] Order status update emails are disabled");
      return;
    }

    const statusConfig = config.email_notifications.order_status_update;
    let shouldSend = false;

    switch (status) {
      case "confirmed": shouldSend = statusConfig.notify_on_confirmed; break;
      case "shipped":   shouldSend = statusConfig.notify_on_shipped;   break;
      case "delivered": shouldSend = statusConfig.notify_on_delivered; break;
      case "cancelled": shouldSend = statusConfig.notify_on_cancelled; break;
    }

    if (!shouldSend) {
      console.log(`📧 [EMAIL DEBUG] Email notifications disabled for status: ${status}`);
      return;
    }

    const customerEmail =
      order.order_type === "guest" ? order.guest_info.email : order.user_id.email;

    const canSend = await this.isUserEmailEnabled(customerEmail);
    if (!canSend) {
      console.log(`📧 [EMAIL DEBUG] User has disabled email notifications: ${customerEmail}`);
      return;
    }

    const { orderStatusUpdateTemplate } = await import(
      "../../lib/emailTemplates/orderStatusUpdate"
    );
    const html = orderStatusUpdateTemplate(order, status);

    await this.sendEmail({
      to: customerEmail,
      subject: `Order ${order.order_number} - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html,
    });
  }

  static async sendReturnRequestEmail(returnRequest: any, order: any): Promise<void> {
    console.log("📧 [RETURN DEBUG] === SENDING RETURN REQUEST EMAIL ===");
    try {
      const config = await this.getConfiguration();

      if (!config.email_notifications.return_notifications?.enabled) {
        console.log("📧 [RETURN DEBUG] Return notifications are disabled - skipping email");
        return;
      }

      let customerEmail = returnRequest.guest_email;
      let customerName = "Customer";

      if (returnRequest.user_id) {
        if (returnRequest.user_id._id) {
          const user = await (User as any).findById(returnRequest.user_id._id);
          if (user) {
            customerEmail = user.email;
            customerName = user.name || customerName;
          }
        } else if (returnRequest.user_id.email) {
          customerEmail = returnRequest.user_id.email;
          customerName = returnRequest.user_id.name || customerName;
        }
      }

      if (!customerEmail) {
        console.error("❌ [RETURN DEBUG] No customer email found");
        return;
      }

      const { returnRequestTemplate } = await import(
        "../../lib/emailTemplates/returnRequest"
      );
      const html = returnRequestTemplate(returnRequest, order);

      // Send to customer — respect email_notifications preference
      const canSend = await this.isUserEmailEnabled(customerEmail);
      if (canSend) {
        await this.sendEmail({
          to: customerEmail,
          subject: `Return Request Received - ${returnRequest.rma_number}`,
          html,
        });
      } else {
        console.log(`📧 [RETURN DEBUG] User has disabled email notifications: ${customerEmail}`);
      }

      // Send to admin — always send, not subject to user preference
      const adminEmail =
        config.email_notifications.return_notifications?.admin_email ||
        config.email_notifications.order_confirmation?.admin_email ||
        config.sender_info.from_email ||
        config.smtp_settings.auth_user;
      const notifyAdmin = config.email_notifications.return_notifications?.notify_on_request ?? true;

      if (adminEmail && notifyAdmin) {
        await this.sendEmail({
          to: adminEmail,
          subject: `New Return Request - ${returnRequest.rma_number} (Order: ${order.order_number})`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>New Return Request</h2>
              <p><strong>RMA Number:</strong> ${returnRequest.rma_number}</p>
              <p><strong>Order Number:</strong> ${order.order_number}</p>
              <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
              <p><strong>Items:</strong> ${returnRequest.items.length} item(s)</p>
              <p><strong>Refund Amount:</strong> Rs. ${Number(returnRequest.refund_amount || 0).toLocaleString()}</p>
              <p><strong>Requested At:</strong> ${new Date(returnRequest.created_at).toLocaleString()}</p>
              <br>
              <p>Please review the return request in the admin panel.</p>
            </div>
          `,
        });
      }

      console.log("✅ [RETURN DEBUG] Return request emails sent successfully");
    } catch (error) {
      console.error("❌ [RETURN DEBUG] Failed to send return request email:", error);
    }
  }

  static async sendReturnStatusUpdateEmail(returnRequest: any, status: string): Promise<void> {
    console.log("📧 [RETURN DEBUG] === SENDING RETURN STATUS UPDATE EMAIL ===");
    try {
      const config = await this.getConfiguration();

      if (!config.email_notifications.return_notifications?.enabled) {
        console.log("📧 [RETURN DEBUG] Return notifications are disabled - skipping email");
        return;
      }

      let shouldNotify = false;
      switch (status) {
        case "approved":   shouldNotify = config.email_notifications.return_notifications.notify_on_approved;  break;
        case "received":   shouldNotify = config.email_notifications.return_notifications.notify_on_received;  break;
        case "processed":  shouldNotify = config.email_notifications.return_notifications.notify_on_processed; break;
        case "completed":  shouldNotify = config.email_notifications.return_notifications.notify_on_completed; break;
        case "rejected":   shouldNotify = config.email_notifications.return_notifications.notify_on_rejected;  break;
      }

      if (!shouldNotify) {
        console.log(`📧 [RETURN DEBUG] Notifications disabled for return status: ${status}`);
        return;
      }

      let customerEmail = returnRequest.guest_email;

      if (returnRequest.user_id) {
        if (returnRequest.user_id._id) {
          const user = await (User as any).findById(returnRequest.user_id._id);
          if (user) customerEmail = user.email;
        } else if (returnRequest.user_id.email) {
          customerEmail = returnRequest.user_id.email;
        }
      }

      if (!customerEmail) {
        console.error("❌ [RETURN DEBUG] No customer email found");
        return;
      }

      const canSend = await this.isUserEmailEnabled(customerEmail);
      if (!canSend) {
        console.log(`📧 [RETURN DEBUG] User has disabled email notifications: ${customerEmail}`);
        return;
      }

      const { returnStatusUpdateTemplate } = await import(
        "../../lib/emailTemplates/returnStatusUpdate"
      );
      const html = returnStatusUpdateTemplate(returnRequest, status);

      await this.sendEmail({
        to: customerEmail,
        subject: `Return Update - ${returnRequest.rma_number}`,
        html,
      });

      console.log("✅ [RETURN DEBUG] Return status update email sent successfully");
    } catch (error) {
      console.error("❌ [RETURN DEBUG] Failed to send return status update email:", error);
    }
  }

  static async sendRefundConfirmationEmail(returnRequest: any, order: any): Promise<void> {
    console.log("📧 [REFUND DEBUG] === SENDING REFUND CONFIRMATION EMAIL ===");
    try {
      const config = await this.getConfiguration();

      if (!config.email_notifications.return_notifications?.enabled) {
        console.log("📧 [REFUND DEBUG] Return notifications are disabled - skipping email");
        return;
      }

      let customerEmail = returnRequest.guest_email;

      if (returnRequest.user_id) {
        if (returnRequest.user_id._id) {
          const user = await (User as any).findById(returnRequest.user_id._id);
          if (user) customerEmail = user.email;
        } else if (returnRequest.user_id.email) {
          customerEmail = returnRequest.user_id.email;
        }
      }

      if (!customerEmail) {
        console.error("❌ [REFUND DEBUG] No customer email found");
        return;
      }

      const canSend = await this.isUserEmailEnabled(customerEmail);
      if (!canSend) {
        console.log(`📧 [REFUND DEBUG] User has disabled email notifications: ${customerEmail}`);
        return;
      }

      const { refundConfirmationTemplate } = await import(
        "../../lib/emailTemplates/refundConfirmation"
      );
      const html = refundConfirmationTemplate(returnRequest, order);

      await this.sendEmail({
        to: customerEmail,
        subject: `Refund Processed - ${returnRequest.rma_number}`,
        html,
      });

      console.log("✅ [REFUND DEBUG] Refund confirmation email sent successfully");
    } catch (error) {
      console.error("❌ [REFUND DEBUG] Failed to send refund confirmation email:", error);
    }
  }
}