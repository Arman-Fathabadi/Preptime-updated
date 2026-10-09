import type { NextApiRequest, NextApiResponse } from 'next';
import { enforceRateLimit } from '../../utils/rateLimit';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

interface GenerateMonthRequest {
    week1Blocks: any[];
    week1Tasks: any[];
    existingEvents: any[];
    preferences: any;
    startDate: string;
}

interface GenerateMonthResponse {
    generatedTasks: any[];
    scheduledBlocks: any[];
    appliedTechniques: string[];
    patterns: any;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GenerateMonthResponse | { error: string }>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!enforceRateLimit(req, res, 'generate-month', 6)) return;

    try {
        console.log(`Submitting month generation request to: ${ML_SERVICE_URL}/generate-month`);

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (process.env.HF_TOKEN) {
            headers['Authorization'] = `Bearer ${process.env.HF_TOKEN}`;
        }

        const response = await fetch(`${ML_SERVICE_URL}/generate-month`, {
            method: 'POST',
            headers,
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`ML service error (${response.status}): ${errorText}`);
            throw new Error(`ML service error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Generate month API error:', error);
        console.error('Failed to connect to ML Service at:', ML_SERVICE_URL);
        res.status(503).json({
            error: error instanceof Error ? error.message : 'Month generation service unavailable'
        });
    }
}
