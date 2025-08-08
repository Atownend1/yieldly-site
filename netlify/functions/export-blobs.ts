import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

interface LeadData {
  email: string;
  name: string;
  company?: string;
  source?: string;
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
    const leadData: LeadData = JSON.parse(event.body || '{}');
    
    // Validate required fields
    if (!leadData.email || !leadData.name) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Email and name are required' 
        })
      };
    }

    // Get current month/year for the CSV filename
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const csvFilename = `leads/${year}-${month}.csv`;

    // Initialize Netlify Blobs store
    const store = getStore('yieldly-leads');

    // Get existing CSV content or create header
    let csvContent = '';
    try {
      const existingContent = await store.get(csvFilename, { type: 'text' });
      csvContent = existingContent || '';
    } catch (error) {
      // File doesn't exist, start with header
      csvContent = 'Timestamp,Email,Name,Company,Source\n';
    }

    // If file is empty or doesn't have header, add it
    if (!csvContent.trim()) {
      csvContent = 'Timestamp,Email,Name,Company,Source\n';
    }

    // Prepare new row
    const timestamp = now.toISOString();
    const email = leadData.email.replace(/"/g, '""'); // Escape quotes
    const name = (leadData.name || '').replace(/"/g, '""');
    const company = (leadData.company || '').replace(/"/g, '""');
    const source = leadData.source || 'website';

    const newRow = `"${timestamp}","${email}","${name}","${company}","${source}"\n`;

    // Append new row
    csvContent += newRow;

    // Save back to Netlify Blobs
    await store.set(csvFilename, csvContent);

    // Also maintain a "latest leads" file for quick access
    await store.set('latest-lead.json', JSON.stringify({
      ...leadData,
      timestamp,
      csvFile: csvFilename
    }));

    console.log(`Lead exported to ${csvFilename}:`, {
      email: leadData.email,
      name: leadData.name,
      timestamp
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Lead exported successfully',
        filename: csvFilename,
        timestamp
      })
    };

  } catch (error) {
    console.error('Export error:', error);
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

// Scheduled function to run monthly exports (called by Netlify cron)
export const scheduled: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const store = getStore('yieldly-leads');
    
    // Get current and previous month files
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    
    // Archive previous month if it's a new month
    const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const prevYear = now.getMonth() === 0 ? currentYear - 1 : currentYear;
    const prevMonthStr = String(prevMonth).padStart(2, '0');
    
    const currentFile = `leads/${currentYear}-${currentMonth}.csv`;
    const prevFile = `leads/${prevYear}-${prevMonthStr}.csv`;
    
    // Check if previous month file exists and current month file is new
    try {
      const prevContent = await store.get(prevFile, { type: 'text' });
      const currentContent = await store.get(currentFile, { type: 'text' });
      
      if (prevContent && !currentContent) {
        // Archive previous month
        await store.set(`archive/${prevFile}`, prevContent);
        console.log(`Archived ${prevFile} to archive folder`);
      }
    } catch (error) {
      // Files don't exist, which is fine
      console.log('No previous month file to archive');
    }

    // Create summary report
    const summaryData = {
      month: `${currentYear}-${currentMonth}`,
      archivedFile: prevFile,
      timestamp: now.toISOString(),
      nextRun: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    await store.set('last-archive-summary.json', JSON.stringify(summaryData));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Monthly archive completed',
        summary: summaryData
      })
    };

  } catch (error) {
    console.error('Scheduled export error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Scheduled export failed'
      })
    };
  }
};

export { handler };