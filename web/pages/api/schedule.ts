/**
 * Next.js API route for scheduling.
 * Proxies requests to the FastAPI ML service.
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// ML service URL - can be configured via environment variable
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

interface ScheduleRequest {
  tasks: any[];
  events: any[];
  preferences: any;
  dateRange: {
    start: string;
    end: string;
  };
}

interface ScheduleResponse {
  scheduledBlocks: any[];
  unscheduledTasks: string[];
  explanations: Record<string, string[]>;
  metrics: Record<string, number>;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScheduleResponse | ErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Proxy request to FastAPI service
    const response = await fetch(`${ML_SERVICE_URL}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    // Get response data
    const data = await response.json();

    // Forward status code and response
    if (response.ok) {
      return res.status(200).json(data);
    } else {
      // Forward error from FastAPI
      return res.status(response.status).json({
        error: 'Scheduling failed',
        details: data.detail || 'Unknown error',
      });
    }
  } catch (error) {
    // Handle FastAPI unavailable or network errors
    console.error('Error proxying to ML service:', error);
    return res.status(503).json({
      error: 'Service unavailable',
      details: 'Unable to connect to scheduling service',
    });
  }
}
