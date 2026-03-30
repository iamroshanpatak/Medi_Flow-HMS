const twilio = require('twilio');

// Initialize Twilio client
const initTwilioClient = () => {
  if (process.env.NODE_ENV === 'production') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      console.warn('⚠️ Twilio credentials not configured. SMS notifications will be logged only.');
      return null;
    }
    
    return twilio(accountSid, authToken);
  }
  return null; // Development mode - log to console
};

// Send appointment confirmation SMS
const sendAppointmentConfirmationSMS = async (patientData) => {
  try {
    const { patientPhone, patientName, doctorName, appointmentDate, startTime, endTime } = patientData;

    if (!patientPhone) {
      console.warn('⚠️ Patient phone number missing. SMS not sent.');
      return { success: false, error: 'Phone number required' };
    }

    const appointmentDateTime = new Date(appointmentDate);
    const dateString = appointmentDateTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const messageBody = `Hi ${patientName}, your appointment is confirmed! 
📅 Date: ${dateString}
🕐 Time: ${startTime} - ${endTime}
👨‍⚕️ Doctor: Dr. ${doctorName}
🏥 MediFlow Hospital
Reply STOP to opt out.`;

    if (process.env.NODE_ENV === 'production') {
      const client = initTwilioClient();
      
      if (!client) {
        console.log('📱 [SMS] Would send to:', patientPhone);
        console.log('Message:', messageBody);
        return { success: true, messageId: 'dev-mode' };
      }

      const message = await client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patientPhone,
      });

      console.log('✅ SMS sent:', message.sid);
      return { success: true, messageId: message.sid };
    } else {
      // Development mode - log to console
      console.log('\n📱 [SMS DEV MODE]');
      console.log('To:', patientPhone);
      console.log('Message:', messageBody);
      console.log('---\n');
      return { success: true, messageId: 'dev-mode' };
    }
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment cancellation SMS
const sendAppointmentCancellationSMS = async (patientData) => {
  try {
    const { patientPhone, patientName, doctorName, appointmentDate } = patientData;

    if (!patientPhone) {
      console.warn('⚠️ Patient phone number missing. SMS not sent.');
      return { success: false, error: 'Phone number required' };
    }

    const appointmentDateTime = new Date(appointmentDate);
    const dateString = appointmentDateTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const messageBody = `Hi ${patientName}, your appointment with Dr. ${doctorName} on ${dateString} has been cancelled. 
Please contact us at +977-1-XXXXXX to reschedule or book another appointment. 
🏥 MediFlow Hospital`;

    if (process.env.NODE_ENV === 'production') {
      const client = initTwilioClient();
      
      if (!client) {
        console.log('📱 [SMS] Would send to:', patientPhone);
        console.log('Message:', messageBody);
        return { success: true, messageId: 'dev-mode' };
      }

      const message = await client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patientPhone,
      });

      console.log('✅ SMS sent (cancellation):', message.sid);
      return { success: true, messageId: message.sid };
    } else {
      // Development mode - log to console
      console.log('\n📱 [SMS DEV MODE - Cancellation]');
      console.log('To:', patientPhone);
      console.log('Message:', messageBody);
      console.log('---\n');
      return { success: true, messageId: 'dev-mode' };
    }
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment reschedule SMS
const sendAppointmentRescheduleSMS = async (patientData) => {
  try {
    const { patientPhone, patientName, doctorName, newDate, newStartTime, newEndTime, oldDate } = patientData;

    if (!patientPhone) {
      console.warn('⚠️ Patient phone number missing. SMS not sent.');
      return { success: false, error: 'Phone number required' };
    }

    const newDateTime = new Date(newDate);
    const newDateString = newDateTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const oldDateTime = new Date(oldDate);
    const oldDateString = oldDateTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const messageBody = `Hi ${patientName}, your appointment has been rescheduled! 
❌ Old: ${oldDateString}
✅ New: ${newDateString} at ${newStartTime} - ${newEndTime}
👨‍⚕️ Doctor: Dr. ${doctorName}
🏥 MediFlow Hospital`;

    if (process.env.NODE_ENV === 'production') {
      const client = initTwilioClient();
      
      if (!client) {
        console.log('📱 [SMS] Would send to:', patientPhone);
        console.log('Message:', messageBody);
        return { success: true, messageId: 'dev-mode' };
      }

      const message = await client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patientPhone,
      });

      console.log('✅ SMS sent (reschedule):', message.sid);
      return { success: true, messageId: message.sid };
    } else {
      // Development mode - log to console
      console.log('\n📱 [SMS DEV MODE - Reschedule]');
      console.log('To:', patientPhone);
      console.log('Message:', messageBody);
      console.log('---\n');
      return { success: true, messageId: 'dev-mode' };
    }
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment reminder SMS (24 hours before)
const sendAppointmentReminderSMS = async (patientData) => {
  try {
    const { patientPhone, patientName, doctorName, appointmentDate, startTime } = patientData;

    if (!patientPhone) {
      console.warn('⚠️ Patient phone number missing. SMS not sent.');
      return { success: false, error: 'Phone number required' };
    }

    const appointmentDateTime = new Date(appointmentDate);
    const dateString = appointmentDateTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const messageBody = `Hi ${patientName}, reminder: You have an appointment tomorrow at ${startTime} with Dr. ${doctorName}. 
📅 Date: ${dateString}
Please arrive 15 minutes early. 🏥 MediFlow Hospital`;

    if (process.env.NODE_ENV === 'production') {
      const client = initTwilioClient();
      
      if (!client) {
        console.log('📱 [SMS] Would send to:', patientPhone);
        console.log('Message:', messageBody);
        return { success: true, messageId: 'dev-mode' };
      }

      const message = await client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patientPhone,
      });

      console.log('✅ SMS sent (reminder):', message.sid);
      return { success: true, messageId: message.sid };
    } else {
      // Development mode - log to console
      console.log('\n📱 [SMS DEV MODE - Reminder]');
      console.log('To:', patientPhone);
      console.log('Message:', messageBody);
      console.log('---\n');
      return { success: true, messageId: 'dev-mode' };
    }
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

// Send queue status SMS
const sendQueueStatusSMS = async (patientData) => {
  try {
    const { patientPhone, patientName, tokenNumber, position, estimatedWaitTime, doctorName } = patientData;

    if (!patientPhone) {
      console.warn('⚠️ Patient phone number missing. SMS not sent.');
      return { success: false, error: 'Phone number required' };
    }

    const messageBody = `Hi ${patientName}, you are #${position} in queue. 
🎫 Token: ${tokenNumber}
⏱️ Est. wait: ${estimatedWaitTime} minutes
👨‍⚕️ Doctor: Dr. ${doctorName}
🏥 MediFlow Hospital`;

    if (process.env.NODE_ENV === 'production') {
      const client = initTwilioClient();
      
      if (!client) {
        console.log('📱 [SMS] Would send to:', patientPhone);
        console.log('Message:', messageBody);
        return { success: true, messageId: 'dev-mode' };
      }

      const message = await client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patientPhone,
      });

      console.log('✅ SMS sent (queue status):', message.sid);
      return { success: true, messageId: message.sid };
    } else {
      // Development mode - log to console
      console.log('\n📱 [SMS DEV MODE - Queue Status]');
      console.log('To:', patientPhone);
      console.log('Message:', messageBody);
      console.log('---\n');
      return { success: true, messageId: 'dev-mode' };
    }
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

// Send patient notification when called for consultation
const sendPatientCalledSMS = async (patientData) => {
  try {
    const { patientPhone, patientName, doctorName } = patientData;

    if (!patientPhone) {
      console.warn('⚠️ Patient phone number missing. SMS not sent.');
      return { success: false, error: 'Phone number required' };
    }

    const messageBody = `Hi ${patientName}, Dr. ${doctorName} is ready for you now! 
🏥 Please proceed to the consultation room at MediFlow Hospital.`;

    if (process.env.NODE_ENV === 'production') {
      const client = initTwilioClient();
      
      if (!client) {
        console.log('📱 [SMS] Would send to:', patientPhone);
        console.log('Message:', messageBody);
        return { success: true, messageId: 'dev-mode' };
      }

      const message = await client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patientPhone,
      });

      console.log('✅ SMS sent (patient called):', message.sid);
      return { success: true, messageId: message.sid };
    } else {
      // Development mode - log to console
      console.log('\n📱 [SMS DEV MODE - Patient Called]');
      console.log('To:', patientPhone);
      console.log('Message:', messageBody);
      console.log('---\n');
      return { success: true, messageId: 'dev-mode' };
    }
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAppointmentConfirmationSMS,
  sendAppointmentCancellationSMS,
  sendAppointmentRescheduleSMS,
  sendAppointmentReminderSMS,
  sendQueueStatusSMS,
  sendPatientCalledSMS,
};
