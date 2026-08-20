import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailConfigurationDocument extends Document {
  smtp_settings: {
    host: string;
    port: number;
    secure: boolean;
    auth_user: string;
    auth_pass: string;
  };
  email_notifications: {
    contact_form: {
      enabled: boolean;
      recipient_email: string;
      subject_prefix: string;
    };
    order_confirmation: {
      enabled: boolean;
      send_to_customer: boolean;
      send_to_admin: boolean;
      admin_email: string;
      subject: string;
    };
    order_status_update: {
      enabled: boolean;
      notify_on_confirmed: boolean;
      notify_on_shipped: boolean;
      notify_on_delivered: boolean;
      notify_on_cancelled: boolean;
    };
    // ADD RETURN NOTIFICATIONS HERE
    return_notifications: {
      enabled: boolean;
      notify_on_request: boolean;
      notify_on_approved: boolean;
      notify_on_received: boolean;
      notify_on_processed: boolean;
      notify_on_completed: boolean;
      notify_on_rejected: boolean;
      admin_email: string;
    };
  };
  sender_info: {
    from_name: string;
    from_email: string;
    reply_to: string;
  };
  updated_by: mongoose.Types.ObjectId;
  updated_at: Date;
  created_at: Date;
}

const EmailConfigurationSchema = new Schema<IEmailConfigurationDocument>(
  {
    smtp_settings: {
      host: {
        type: String,
        required: true,
        default: "smtp.gmail.com",
      },
      port: {
        type: Number,
        required: true,
        default: 587,
      },
      secure: {
        type: Boolean,
        default: false,
      },
      auth_user: {
        type: String,
        required: true,
      },
      auth_pass: {
        type: String,
        required: true,
      },
    },
    email_notifications: {
      contact_form: {
        enabled: {
          type: Boolean,
          default: true,
        },
        recipient_email: {
          type: String,
          required: true,
        },
        subject_prefix: {
          type: String,
          default: "Contact Form:",
        },
      },
      order_confirmation: {
        enabled: {
          type: Boolean,
          default: true,
        },
        send_to_customer: {
          type: Boolean,
          default: true,
        },
        send_to_admin: {
          type: Boolean,
          default: true,
        },
        admin_email: {
          type: String,
        },
        subject: {
          type: String,
          default: "Order Placed Successfully - {{order_number}}",
          immutable: true,
        },
      },
      order_status_update: {
        enabled: {
          type: Boolean,
          default: true,
        },
        notify_on_confirmed: {
          type: Boolean,
          default: true,
        },
        notify_on_shipped: {
          type: Boolean,
          default: true,
        },
        notify_on_delivered: {
          type: Boolean,
          default: true,
        },
        notify_on_cancelled: {
          type: Boolean,
          default: true,
        },
      },
      // ADD RETURN NOTIFICATIONS SECTION
      return_notifications: {
        enabled: {
          type: Boolean,
          default: true,
        },
        notify_on_request: {
          type: Boolean,
          default: true,
        },
        notify_on_approved: {
          type: Boolean,
          default: true,
        },
        notify_on_received: {
          type: Boolean,
          default: true,
        },
        notify_on_processed: {
          type: Boolean,
          default: true,
        },
        notify_on_completed: {
          type: Boolean,
          default: true,
        },
        notify_on_rejected: {
          type: Boolean,
          default: true,
        },
        admin_email: {
          type: String,
        },
      },
    },
    sender_info: {
      from_name: {
        type: String,
        required: true,
        default: "Your Store",
      },
      from_email: {
        type: String,
        required: true,
      },
      reply_to: {
        type: String,
      },
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default (mongoose.models.EmailConfiguration ||
  mongoose.model<IEmailConfigurationDocument>(
    "EmailConfiguration",
    EmailConfigurationSchema
  )) as Model<IEmailConfigurationDocument>;