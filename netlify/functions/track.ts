import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface TrackingEvent {
  email?: string;
  event_name: string;
  event_data?: Record<string, any>;
  timestamp?: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
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

  try {
    const trackingData: TrackingEvent = JSON.parse(event.body || '{}');
    
    if (!trackingData.event_name) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'event_name is required' })
      };
    }

    // Get Pipedrive credentials
    const pipedriveToken = process.env.PIPEDRIVE_API_TOKEN;
    const pipedriveBaseUrl = process.env.PIPEDRIVE_BASE_URL || 'https://api.pipedrive.com/v1';

    if (!pipedriveToken) {
      console.log('PIPEDRIVE_API_TOKEN not set, tracking event locally only');
      
      // Push to GTM dataLayer (client-side will handle this)
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Event tracked locally',
          gtm_push: true
        })
      };
    }

    // If email is provided, try to find the latest open deal and add activity note
    if (trackingData.email) {
      try {
        await addActivityToDeal(trackingData, pipedriveBaseUrl, pipedriveToken);
      } catch (error) {
        console.error('Failed to add activity to deal:', error);
        // Don't fail the request for this
      }
    }

    // Log the event for debugging
    console.log('Tracking event:', {
      event_name: trackingData.event_name,
      email: trackingData.email,
      timestamp: trackingData.timestamp || new Date().toISOString(),
      data: trackingData.event_data
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Event tracked successfully'
      })
    };

  } catch (error) {
    console.error('Tracking error:', error);
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

async function addActivityToDeal(
  trackingData: TrackingEvent,
  baseUrl: string,
  token: string
): Promise<void> {
  // First, find person by email
  const searchUrl = `${baseUrl}/persons/search?term=${encodeURIComponent(trackingData.email!)}&api_token=${token}`;
  
  try {
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.success || !searchData.data?.items?.length) {
      console.log('Person not found for email:', trackingData.email);
      return;
    }

    const personId = searchData.data.items[0].item.id;

    // Find latest open deal for this person
    const dealsUrl = `${baseUrl}/persons/${personId}/deals?status=open&api_token=${token}`;
    const dealsResponse = await fetch(dealsUrl);
    const dealsData = await dealsResponse.json();

    if (!dealsData.success || !dealsData.data?.length) {
      console.log('No open deals found for person:', personId);
      return;
    }

    // Get the most recent deal
    const latestDeal = dealsData.data.sort((a: any, b: any) => 
      new Date(b.add_time).getTime() - new Date(a.add_time).getTime()
    )[0];

    // Add note to the deal
    const noteUrl = `${baseUrl}/notes?api_token=${token}`;
    
    const noteContent = `User Activity: ${trackingData.event_name}

Timestamp: ${trackingData.timestamp || new Date().toISOString()}
Event Data: ${JSON.stringify(trackingData.event_data || {}, null, 2)}

Source: Website tracking`;

    await fetch(noteUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: noteContent,
        deal_id: latestDeal.id,
        add_time: new Date().toISOString()
      })
    });

    console.log(`Activity logged to deal ${latestDeal.id} for event: ${trackingData.event_name}`);

  } catch (error) {
    console.error('Error in addActivityToDeal:', error);
    throw error;
  }
}

export { handler };