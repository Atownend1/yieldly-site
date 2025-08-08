import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface ReminderData {
  email: string;
  toName: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  pay_link?: string;
  client_email?: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const reminderData: ReminderData = JSON.parse(event.body || '{}');
    
    // Validate required fields
    const required = ['email', 'toName', 'invoice_number', 'amount', 'due_date'];
    const missing = required.filter(field => !reminderData[field as keyof ReminderData]);
    
    if (missing.length > 0) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: `Missing required fields: ${missing.join(', ')}` 
        })
      };
    }

    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    const pipedriveToken = process.env.PIPEDRIVE_API_TOKEN;
    const pipedriveBaseUrl = process.env.PIPEDRIVE_BASE_URL || 'https://api.pipedrive.com/v1';

    let emailSent = false;
    let simulationMode = true;

    // Try to send via SendGrid if API key is available
    if (sendGridApiKey) {
      try {
        emailSent = await sendViaMailer(reminderData, sendGridApiKey);
        simulationMode = false;
      } catch (error) {
        console.error('SendGrid send failed:', error);
        // Fall back to simulation mode
      }
    }

    // Log activity in Pipedrive regardless of email status
    if (pipedriveToken) {
      try {
        await logActivityInPipedrive(reminderData, pipedriveBaseUrl, pipedriveToken, emailSent, simulationMode);
      } catch (error) {
        console.error('Failed to log activity in Pipedrive:', error);
        // Don't fail the whole request
      }
    }

    const message = simulationMode 
      ? `Reminder sent (simulated) for invoice ${reminderData.invoice_number}`
      : `Reminder sent successfully for invoice ${reminderData.invoice_number}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message,
        sent: emailSent,
        simulation_mode: simulationMode,
        invoice_number: reminderData.invoice_number
      })
    };

  } catch (error) {
    console.error('Send reminder error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
};

async function sendViaMailer(
  reminderData: ReminderData,
  sendGridApiKey: string
): Promise<boolean> {
  const clientEmail = reminderData.client_email || 
    `billing@${reminderData.toName.toLowerCase().replace(/\s+/g, '')}.com`;

  const emailContent = {
    personalizations: [{
      to: [{ email: clientEmail, name: reminderData.toName }],
      subject: `Payment Reminder - Invoice ${reminderData.invoice_number}`
    }],
    from: {
      email: process.env.FROM_EMAIL || 'noreply@yieldlycf.com',
      name: 'Yieldly'
    },
    content: [{
      type: 'text/html',
      value: generateEmailHTML(reminderData)
    }]
  };

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendGridApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailContent)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${response.status} - ${error}`);
  }

  return true;
}

function generateEmailHTML(data: ReminderData): string {
  const payButton = data.pay_link 
    ? `<a href="${data.pay_link}" style="background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Pay Now</a>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1e3a8a; margin: 0;">Payment Reminder</h2>
      </div>
      
      <p>Dear ${data.toName},</p>
      
      <p>This is a friendly reminder that invoice <strong>${data.invoice_number}</strong> for <strong>£${data.amount.toLocaleString()}</strong> was due on <strong>${data.due_date}</strong>.</p>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">Invoice Details</h3>
        <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${data.invoice_number}</p>
        <p style="margin: 5px 0;"><strong>Amount Due:</strong> £${data.amount.toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>Due Date:</strong> ${data.due_date}</p>
      </div>
      
      ${payButton}
      
      <p>Please arrange payment at your earliest convenience. If you have any questions about this invoice or need to discuss payment terms, please don't hesitate to contact us.</p>
      
      <p>If you have already sent payment, please disregard this reminder and accept our thanks.</p>
      
      <p>Best regards,<br>
      Your Legal Team</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        This is an automated reminder. If you believe this message was sent in error, please contact us immediately.
      </p>
    </body>
    </html>
  `;
}

async function logActivityInPipedrive(
  reminderData: ReminderData,
  baseUrl: string,
  token: string,
  emailSent: boolean,
  simulationMode: boolean
): Promise<void> {
  // Find person by email to get associated deals
  const searchUrl = `${baseUrl}/persons/search?term=${encodeURIComponent(reminderData.email)}&api_token=${token}`;
  
  try {
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.success || !searchData.data?.items?.length) {
      console.log('Person not found for reminder activity logging');
      return;
    }

    const personId = searchData.data.items[0].item.id;

    // Find open deals for this person
    const dealsUrl = `${baseUrl}/persons/${personId}/deals?status=open&api_token=${token}`;
    const dealsResponse = await fetch(dealsUrl);
    const dealsData = await dealsResponse.json();

    if (dealsData.success && dealsData.data?.length > 0) {
      const latestDeal = dealsData.data[0];
      
      // Add activity note
      const activityUrl = `${baseUrl}/notes?api_token=${token}`;
      
      const activityContent = `Payment Reminder ${simulationMode ? '(Demo)' : 'Sent'}

Invoice: ${reminderData.invoice_number}
Client: ${reminderData.toName}
Amount: £${reminderData.amount.toLocaleString()}
Due Date: ${reminderData.due_date}
Status: ${emailSent ? 'Email sent successfully' : 'Simulated (demo mode)'}

Timestamp: ${new Date().toISOString()}
${simulationMode ? '\n⚠️ This was a demonstration - no actual email was sent.' : ''}`;

      await fetch(activityUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: activityContent,
          deal_id: latestDeal.id,
          add_time: new Date().toISOString()
        })
      });
    }
  } catch (error) {
    console.error('Error logging activity in Pipedrive:', error);
    throw error;
  }
}

export { handler };