
import type { NextApiRequest, NextApiResponse } from 'next';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const headers: Record<string, string> = {};
        if (process.env.HF_TOKEN) {
            headers['Authorization'] = `Bearer ${process.env.HF_TOKEN}`;
        }

        const response = await fetch(`${ML_SERVICE_URL}/health`, {
            method: 'GET',
            headers,
        });

        if (response.ok) {
            return res.status(200).json({ status: 'woken' });
        }
        return res.status(response.status).json({ status: 'error' });
    } catch (error) {
        return res.status(503).json({ status: 'unavailable' });
    }
}
