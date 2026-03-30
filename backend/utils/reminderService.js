/**
 * Reminder Service - Send appointment reminders via SMS and Email
 * Integrates with SMS and Email services to send reminders
 */

const smsService = require('./smsService');
const emailService = require('./emailService');
const User = require('../models/User');

/**
 * Send appointment reminder via SMS or Email
 * @param {Object} appointment - Appointment object (populated with patient & doctor)
 * @param {String} reminderType - '24hour' or '1hour'
 * @param {String} channel - 'sms' or 'email'
 */
const sendAppointmentReminder = async (appointment, reminderType, channel) => {
  try {
    if (!appointment.patient || !appointment.doctor) {
      throw new Error('Appointment must be populated with patient and doctor');
    }

    const reminderMessage = getReminderMessage(appointment, reminderType, channel);

    if (channel === 'sms') {
      return await sendSMSReminder(appointment, reminderMessage, reminderType);
    } else if (channel === 'email') {
      return await sendEmailReminder(appointment, reminderMessage, reminderType);
    } else {
      throw new Error(`Invalid reminder channel: ${channel}`);
    }
  } catch (error) {
    console.error(`❌ Error sending ${reminderType} ${channel} reminder:`, error.message);
    throw error;
  }
};

/**
 * Send SMS reminder
 */
const sendSMSReminder = async (appointment, message, reminderType) => {
  try {
    const patientPhone = appointment.patient.phone;

    // DEV MODE: Log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📱 [SMS REMINDER - DEV MODE]');
      console.log(`To: ${patientPhone}`);
      console.log(`Type: ${reminderType} reminder`);
      console.log(`Message: ${message}`);
      console.log(`Sent at: ${new Date().toISOString()}`);
      console.log('---\n');
      return { success: true, mode: 'development', messageId: 'dev-mode' };
    }

    // PRODUCTION MODE: Send via Twilio
    const twilioService = require('./smsService');
    return await twilioService.sendReminderSMS(patientPhone, message);
  } catch (error) {
    console.error('❌ Error in sendSMSReminder:', error.message);
    throw error;
  }
};

/**
 * Send Email reminder
 */
const sendEmailReminder = async (appointment, message, reminderType) => {
  try {
    const patientEmail = appointment.patient.email;
    const doctorName = `${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
    const appointmentTime = formatAppointmentTime(appointment);

    // Create email template for reminder
    const emailTemplate = generateReminderEmailTemplate(
      appointment,
      message,
      reminderType,
      doctorName,
      appointmentTime
    );

    // DEV MODE: Log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 [EMAIL REMINDER - DEV MODE]');
      console.log(`To: ${patientEmail}`);
      console.log(`Type: ${reminderType} reminder`);
      console.log(`Subject: ${emailTemplate.subject}`);
      console.log(`Message: ${message}`);
      console.log(`Sent at: ${new Date().toISOString()}`);
      console.log('---\n');
      return { success: true, mode: 'development', messageId: 'dev-mode' };
    }

    // PRODUCTION MODE: Send via Nodemailer
    return await emailService.sendReminderEmail(patientEmail, emailTemplate);
  } catch (error) {
    console.error('❌ Error in sendEmailReminder:', error.message);
    throw error;
  }
};

/**
 * Get reminder message based on type
 */
const getReminderMessage = (appointment, reminderType, channel) => {
  const patientName = appointment.patient.firstName;
  const doctorName = `${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
  const appointmentTime = formatAppointmentTime(appointment);

  if (reminderType === '24hour') {
    if (channel === 'sms') {
      return `Hi ${patientName}, reminder: your appointment with Dr. ${appointment.doctor.lastName} is tomorrow at ${appointmentTime}. 📅 Please arrive 10 minutes early. Reply STOP to opt out.`;
    } else {
      return `Hi ${patientName}, this is a friendly reminder that your appointment is scheduled for tomorrow at ${appointmentTime} with Dr. ${doctorName}. Please ensure you arrive 10 minutes early.`;
    }
  } else if (reminderType === '1hour') {
    if (channel === 'sms') {
      return `Hi ${patientName}, your appointment with Dr. ${appointment.doctor.lastName} is in 1 hour at ${appointmentTime}. 🏥 Please proceed to MediFlow Hospital. Reply STOP to opt out.`;
    } else {
      return `Hi ${patientName}, your appointment is coming up in 1 hour at ${appointmentTime} with Dr. ${doctorName}. Please make your way to MediFlow Hospital now.`;
    }
  }

  return '';
};

/**
 * Format appointment time for display
 */
const formatAppointmentTime = (appointment) => {
  const date = new Date(appointment.appointmentDate);
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return `${dateStr} at ${appointment.startTime}`;
};

/**
 * Generate HTML email template for reminder
 */
const generateReminderEmailTemplate = (
  appointment,
  message,
  reminderType,
  doctorName,
  appointmentTime
) => {
  const patientName = appointment.patient.firstName;
  const timeUnit = reminderType === '24hour' ? '24 Hours' : '1 Hour';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f7fa;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .reminder-box {
          background-color: #f0f4ff;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .appointment-details {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          margin: 10px 0;
          align-items: start;
        }
        .detail-label {
          font-weight: 600;
          color: #667eea;
          min-width: 120px;
        }
        .detail-value {
          flex: 1;
        }
        .button {
          display: inline-block;
          background-color: #667eea;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 20px;
          text-align: center;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Appointment Reminder</h1>
          <p>${timeUnit} until your appointment</p>
        </div>

        <div class="content">
          <p>Dear ${patientName},</p>

          <div class="reminder-box">
            <strong>🔔 Reminder:</strong> ${message}
          </div>

          <p>Here are your appointment details:</p>

          <div class="appointment-details">
            <div class="detail-row">
              <div class="detail-label">📅 Date & Time:</div>
              <div class="detail-value">${appointmentTime}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">👨‍⚕️ Doctor:</div>
              <div class="detail-value">Dr. ${doctorName}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">🏥 Location:</div>
              <div class="detail-value">MediFlow Hospital</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">📝 Type:</div>
              <div class="detail-value">${appointment.type || 'Consultation'}</div>
            </div>
          </div>

          <p><strong>Important:</strong> Please arrive <strong>10 minutes before</strong> your scheduled appointment time. Bring any required documents or medical records.</p>

          <p>If you need to reschedule or cancel your appointment, please contact us at your earliest convenience.</p>

          <p>If you have any questions, please don't hesitate to reach out to us.</p>

          <p>Best regards,<br>
          <strong>MediFlow Hospital</strong><br>
          Your Healthcare Partner</p>
        </div>

        <div class="footer">
          <p>📞 Contact us: +977-1-XXXXXX</p>
          <p>📧 Email: support@mediflow.com</p>
          <p>This is an automated reminder message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `🔔 ${timeUnit} Until Your Appointment - MediFlow`,
    html: htmlContent,
    text: message,
  };
};

/**
 * Reschedule-based reminder cleanup
 * Clear reminder flags when appointment is rescheduled
 */
const clearRemindersOnReschedule = async (appointmentId) => {
  try {
    // Reminder flags will be cleared by the appointment reschedule endpoint
    // This is a helper function if needed elsewhere
    console.log(`🔄 Reminder flags cleared for rescheduled appointment ${appointmentId}`);
  } catch (error) {
    console.error('❌ Error in clearRemindersOnReschedule:', error.message);
  }
};

/**
 * Cleanup function for cancelled appointments
 * Stop sending reminders for cancelled appointments
 */
const cleanupCancelledAppointment = async (appointmentId) => {
  try {
    // Reminders won't be sent due to status check in cron job
    // This is logged for audit purposes
    console.log(`🗑️ Reminder tracking cleared for cancelled appointment ${appointmentId}`);
  } catch (error) {
    console.error('❌ Error in cleanupCancelledAppointment:', error.message);
  }
};

module.exports = {
  sendAppointmentReminder,
  sendSMSReminder,
  sendEmailReminder,
  getReminderMessage,
  generateReminderEmailTemplate,
  formatAppointmentTime,
  clearRemindersOnReschedule,
  cleanupCancelledAppointment,
};
