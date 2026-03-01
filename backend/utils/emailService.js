const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For development, use Ethereal email (fake SMTP service)
  // For production, use real SMTP credentials from environment variables
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development mode - log to console
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.password',
      },
    });
  }
};

// Send appointment confirmation email
const sendAppointmentConfirmation = async (appointmentData) => {
  try {
    const { patientEmail, patientName, doctorName, appointmentDate, startTime, endTime, reason } = appointmentData;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'MediFlow <noreply@mediflow.com>',
      to: patientEmail,
      subject: '✅ Appointment Confirmed - MediFlow',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 MediFlow</h1>
              <h2>Appointment Confirmed!</h2>
            </div>
            <div class="content">
              <p>Dear ${patientName},</p>
              <p>Your appointment has been successfully confirmed. Here are the details:</p>
              
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="label">👨‍⚕️ Doctor:</span> Dr. ${doctorName}
                </div>
                <div class="detail-row">
                  <span class="label">📅 Date:</span> ${new Date(appointmentDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div class="detail-row">
                  <span class="label">🕐 Time:</span> ${startTime} - ${endTime}
                </div>
                <div class="detail-row">
                  <span class="label">📝 Reason:</span> ${reason}
                </div>
              </div>

              <p><strong>⚠️ Important Information:</strong></p>
              <ul>
                <li>Please arrive 15 minutes before your appointment time</li>
                <li>Bring your ID and health insurance card</li>
                <li>Bring any relevant medical documents or test results</li>
              </ul>

              <p>If you need to reschedule or cancel, please log in to your MediFlow account.</p>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/appointments" class="button">
                  View My Appointments
                </a>
              </div>

              <div class="footer">
                <p>This is an automated message from MediFlow Hospital Management System</p>
                <p>© ${new Date().getFullYear()} MediFlow. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    if (process.env.NODE_ENV === 'production') {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      // In development, just log
      console.log('📧 [DEV MODE] Email would be sent to:', patientEmail);
      console.log('Subject:', mailOptions.subject);
      return { success: true, messageId: 'dev-mode' };
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment cancellation email
const sendAppointmentCancellation = async (appointmentData) => {
  try {
    const { patientEmail, patientName, doctorName, appointmentDate, startTime, cancellationReason } = appointmentData;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'MediFlow <noreply@mediflow.com>',
      to: patientEmail,
      subject: '❌ Appointment Cancelled - MediFlow',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f56565 0%, #c53030 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f56565; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #c53030; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 MediFlow</h1>
              <h2>Appointment Cancelled</h2>
            </div>
            <div class="content">
              <p>Dear ${patientName},</p>
              <p>Your appointment has been cancelled. Here are the details:</p>
              
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="label">👨‍⚕️ Doctor:</span> Dr. ${doctorName}
                </div>
                <div class="detail-row">
                  <span class="label">📅 Date:</span> ${new Date(appointmentDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div class="detail-row">
                  <span class="label">🕐 Time:</span> ${startTime}
                </div>
                ${cancellationReason ? `<div class="detail-row">
                  <span class="label">📝 Reason:</span> ${cancellationReason}
                </div>` : ''}
              </div>

              <p>If you'd like to book a new appointment, you can do so anytime through your MediFlow account.</p>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/book-appointment" class="button">
                  Book New Appointment
                </a>
              </div>

              <div class="footer">
                <p>This is an automated message from MediFlow Hospital Management System</p>
                <p>© ${new Date().getFullYear()} MediFlow. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    if (process.env.NODE_ENV === 'production') {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      console.log('📧 [DEV MODE] Email would be sent to:', patientEmail);
      console.log('Subject:', mailOptions.subject);
      return { success: true, messageId: 'dev-mode' };
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment reschedule email
const sendAppointmentReschedule = async (appointmentData) => {
  try {
    const {
      patientEmail,
      patientName,
      doctorName,
      oldDate,
      oldTime,
      newDate,
      newStartTime,
      newEndTime,
      reason,
    } = appointmentData;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'MediFlow <noreply@mediflow.com>',
      to: patientEmail,
      subject: '🔄 Appointment Rescheduled - MediFlow',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #9f7aea 0%, #667eea 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9f7aea; }
            .old-details { opacity: 0.6; text-decoration: line-through; }
            .new-details { background: #e9f5ff; padding: 15px; border-radius: 5px; margin-top: 15px; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 MediFlow</h1>
              <h2>Appointment Rescheduled</h2>
            </div>
            <div class="content">
              <p>Dear ${patientName},</p>
              <p>Your appointment has been rescheduled successfully.</p>
              
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="label">👨‍⚕️ Doctor:</span> Dr. ${doctorName}
                </div>
                
                <div class="old-details">
                  <p style="font-weight: bold; margin-top: 15px;">Previous Schedule:</p>
                  <div class="detail-row">
                    <span class="label">📅 Date:</span> ${new Date(oldDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div class="detail-row">
                    <span class="label">🕐 Time:</span> ${oldTime}
                  </div>
                </div>

                <div class="new-details">
                  <p style="font-weight: bold; margin-bottom: 10px; color: #667eea;">✨ New Schedule:</p>
                  <div class="detail-row">
                    <span class="label">📅 Date:</span> ${new Date(newDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div class="detail-row">
                    <span class="label">🕐 Time:</span> ${newStartTime} - ${newEndTime}
                  </div>
                  ${reason ? `<div class="detail-row">
                    <span class="label">📝 Reason:</span> ${reason}
                  </div>` : ''}
                </div>
              </div>

              <p><strong>⚠️ Important Information:</strong></p>
              <ul>
                <li>Please arrive 15 minutes before your new appointment time</li>
                <li>Bring your ID and health insurance card</li>
                <li>Bring any relevant medical documents or test results</li>
              </ul>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/appointments" class="button">
                  View My Appointments
                </a>
              </div>

              <div class="footer">
                <p>This is an automated message from MediFlow Hospital Management System</p>
                <p>© ${new Date().getFullYear()} MediFlow. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    if (process.env.NODE_ENV === 'production') {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      console.log('📧 [DEV MODE] Email would be sent to:', patientEmail);
      console.log('Subject:', mailOptions.subject);
      return { success: true, messageId: 'dev-mode' };
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment reminder email (1 day before)
const sendAppointmentReminder = async (appointmentData) => {
  try {
    const { patientEmail, patientName, doctorName, appointmentDate, startTime, endTime } = appointmentData;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'MediFlow <noreply@mediflow.com>',
      to: patientEmail,
      subject: '⏰ Appointment Reminder - Tomorrow - MediFlow',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f6ad55; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #ed8936; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 MediFlow</h1>
              <h2>⏰ Appointment Reminder</h2>
            </div>
            <div class="content">
              <p>Dear ${patientName},</p>
              <p><strong>This is a reminder that you have an appointment tomorrow!</strong></p>
              
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="label">👨‍⚕️ Doctor:</span> Dr. ${doctorName}
                </div>
                <div class="detail-row">
                  <span class="label">📅 Date:</span> ${new Date(appointmentDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div class="detail-row">
                  <span class="label">🕐 Time:</span> ${startTime} - ${endTime}
                </div>
              </div>

              <p><strong>⚠️ Don't forget:</strong></p>
              <ul>
                <li>Arrive 15 minutes early</li>
                <li>Bring your ID and insurance card</li>
                <li>Bring any medical documents</li>
              </ul>

              <div class="footer">
                <p>This is an automated reminder from MediFlow Hospital Management System</p>
                <p>© ${new Date().getFullYear()} MediFlow. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    if (process.env.NODE_ENV === 'production') {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      console.log('📧 [DEV MODE] Email would be sent to:', patientEmail);
      console.log('Subject:', mailOptions.subject);
      return { success: true, messageId: 'dev-mode' };
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendAppointmentReschedule,
  sendAppointmentReminder,
};
