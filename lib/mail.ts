import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendReminderEmail(to: string, reminder: { title: string; description?: string; dueDate: string; priority: string }) {
  const mailOptions = {
    from: `"Finance App" <${process.env.GMAIL_USER}>`,
    to,
    subject: `🔔 IMPORTANT REMINDER: ${reminder.title}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
        <h2 style="color: #ef4444;">${reminder.priority.toUpperCase()} PRIORITY REMINDER</h2>
        <p>This is an automated notification for your upcoming financial task.</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${reminder.title}</h3>
          <p>${reminder.description || 'No description provided.'}</p>
          <p><strong>Due Date:</strong> ${new Date(reminder.dueDate).toLocaleDateString()} at ${new Date(reminder.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Stay on top of your finances! Check your dashboard for more details.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
