import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface FormspreeData {
  email: string;
  name: string;
  firm?: string;
  size?: string;
  message?: string;
}

interface PipedriveResponse {
  success: boolean;
  data?: any;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const formData: FormspreeData = JSON.parse(event.body || '{}');
    
    if (!formData.email || !formData.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and name are required' })
      };
    }

    // Get Pipedrive credentials
    const pipedriveToken = process.env.PIPEDRIVE_API_TOKEN;
    const pipedriveBaseUrl = process.env.PIPEDRIVE_BASE_URL || 'https://api.pipedrive.com/v1';

    if (!pipedriveToken) {
      console.log('PIPEDRIVE_API_TOKEN not set, skipping Pipedrive integration');
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          message: 'Form received (Pipedrive integration disabled)' 
        })
      };
    }

    // 1. Create/Update Pipedrive Person
    const personResponse = await createOrUpdatePerson(formData, pipedriveBaseUrl, pipedriveToken);
    
    if (!personResponse.success) {
      throw new Error('Failed to create person in Pipedrive');
    }

    const personId = personResponse.data.id;

    // 2. Create Deal
    const dealResponse = await createDeal(personId, formData, pipedriveBaseUrl, pipedriveToken);
    
    if (!dealResponse.success) {
      throw new Error('Failed to create deal in Pipedrive');
    }

    // 3. Add Note
    await addNote(dealResponse.data.id, formData, pipedriveBaseUrl, pipedriveToken);

    // 4. Optional: Send to Instantly webhook
    const instantlyWebhook = process.env.INSTANTLY_WEBHOOK_URL;
    if (instantlyWebhook) {
      try {
        await fetch(instantlyWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            firstName: formData.name.split(' ')[0],
            lastName: formData.name.split(' ').slice(1).join(' ') || '',
            company: formData.firm || '',
            source: 'yieldly_website'
          })
        });
      } catch (error) {
        console.error('Failed to send to Instantly:', error);
        // Don't fail the whole request for this
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Lead processed successfully',
        personId,
        dealId: dealResponse.data.id
      })
    };

  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
};

async function createOrUpdatePerson(
  formData: FormspreeData, 
  baseUrl: string, 
  token: string
): Promise<PipedriveResponse> {
  // First, search for existing person by email
  const searchUrl = `${baseUrl}/persons/search?term=${encodeURIComponent(formData.email)}&api_token=${token}`;
  
  try {
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.success && searchData.data?.items?.length > 0) {
      // Person exists, update if needed
      const existingPerson = searchData.data.items[0].item;
      const updateUrl = `${baseUrl}/persons/${existingPerson.id}?api_token=${token}`;
      
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: [{ value: formData.email, primary: true }],
          org_name: formData.firm || null
        })
      });
      
      return await updateResponse.json();
    } else {
      // Create new person
      const createUrl = `${baseUrl}/persons?api_token=${token}`;
      
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: [{ value: formData.email, primary: true }],
          org_name: formData.firm || null
        })
      });
      
      return await createResponse.json();
    }
  } catch (error) {
    console.error('Error in createOrUpdatePerson:', error);
    return { success: false };
  }
}

async function createDeal(
  personId: number,
  formData: FormspreeData,
  baseUrl: string,
  token: string
): Promise<PipedriveResponse> {
  const dealUrl = `${baseUrl}/deals?api_token=${token}`;
  
  try {
    const response = await fetch(dealUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Inbound – Website (${formData.name})`,
        person_id: personId,
        value: 6000, // £500/month * 12 months
        currency: 'GBP',
        stage_id: 1, // Assuming stage 1 is "New"
        status: 'open',
        add_time: new Date().toISOString()
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error in createDeal:', error);
    return { success: false };
  }
}

async function addNote(
  dealId: number,
  formData: FormspreeData,
  baseUrl: string,
  token: string
): Promise<void> {
  const noteUrl = `${baseUrl}/notes?api_token=${token}`;
  
  const noteContent = `Form submitted from website
  
Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.firm || 'Not provided'}
Firm Size: ${formData.size || 'Not provided'}
Message: ${formData.message || 'No message provided'}

Source: Yieldly website form
Timestamp: ${new Date().toISOString()}`;

  try {
    await fetch(noteUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: noteContent,
        deal_id: dealId,
        add_time: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error adding note:', error);
    // Don't throw - note is not critical
  }
}

export { handler };