import nodemailer from "nodemailer";

export interface BookingNotificationPayload {
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  serviceName: string;
  startAt: Date;
  price: number;
}

// Notification delivery is abstracted behind this interface so a future
// WhatsApp Business API integration can be dropped in without touching the
// booking flow that calls it.
interface NotificationProvider {
  notifyAdminNewBooking(payload: BookingNotificationPayload): Promise<void>;
  notifyCustomerConfirmation(payload: BookingNotificationPayload): Promise<void>;
}

class EmailNotificationProvider implements NotificationProvider {
  private transporter() {
    if (!process.env.SMTP_HOST) return null;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
  }

  async notifyAdminNewBooking(payload: BookingNotificationPayload): Promise<void> {
    const subject = `Nueva reserva: ${payload.customerName} — ${payload.serviceName}`;
    const body = formatBody(payload);
    await this.send(process.env.NOTIFICATION_EMAIL, subject, body);
  }

  async notifyCustomerConfirmation(payload: BookingNotificationPayload): Promise<void> {
    if (!payload.customerEmail) return;
    const subject = `Confirmación de tu turno en MaurisBarber`;
    const body = formatBody(payload);
    await this.send(payload.customerEmail, subject, body);
  }

  private async send(to: string | undefined, subject: string, text: string) {
    if (!to) return;
    const transporter = this.transporter();
    if (!transporter) {
      console.log(`[notifications] (SMTP no configurado) Para: ${to}\n${subject}\n${text}`);
      return;
    }
    await transporter.sendMail({
      from: process.env.SMTP_USER ?? "no-reply@maurisbarber.com",
      to,
      subject,
      text,
    });
  }
}

function formatBody(payload: BookingNotificationPayload): string {
  const date = payload.startAt.toLocaleString("es-UY", {
    dateStyle: "full",
    timeStyle: "short",
  });
  return [
    `Cliente: ${payload.customerName}`,
    `Teléfono: ${payload.customerPhone}`,
    `Servicio: ${payload.serviceName}`,
    `Fecha: ${date}`,
    `Precio: $${payload.price}`,
  ].join("\n");
}

export const notifications: NotificationProvider = new EmailNotificationProvider();
