/**
 * Unit tests for Next.js API schedule route.
 * 
 * Feature: intelligent-scheduler
 * Tests API proxy functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Import the handler after mocking fetch
const mockFetch = global.fetch as ReturnType<typeof vi.fn>;

describe('Next.js API /api/schedule', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 405 for non-POST requests', async () => {
    // Dynamically import to ensure mocks are in place
    const { default: handler } = await import('../../pages/api/schedule');

    const req = {
      method: 'GET',
      body: {},
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should proxy successful requests to FastAPI and return 200', async () => {
    const { default: handler } = await import('../../pages/api/schedule');

    // Mock successful FastAPI response
    const mockResponse = {
      scheduledBlocks: [
        {
          id: 'block1',
          taskId: 'task1',
          start: '2024-01-01T10:00:00',
          end: '2024-01-01T11:00:00',
        },
      ],
      unscheduledTasks: [],
      explanations: {
        block1: ['Reason 1', 'Reason 2'],
      },
      metrics: {
        freeHours: 5.0,
        scheduledHours: 1.0,
        tasksOnTime: 1,
        deepWorkHours: 0.5,
        contextSwitchPenalty: 0,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as any);

    const req = {
      method: 'POST',
      body: {
        tasks: [],
        events: [],
        preferences: {},
        dateRange: { start: '2024-01-01', end: '2024-01-02' },
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await handler(req, res);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/schedule',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('should return 503 when FastAPI is unavailable', async () => {
    const { default: handler } = await import('../../pages/api/schedule');

    // Mock network error (FastAPI unavailable)
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const req = {
      method: 'POST',
      body: {
        tasks: [],
        events: [],
        preferences: {},
        dateRange: { start: '2024-01-01', end: '2024-01-02' },
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Service unavailable',
      details: 'Unable to connect to scheduling service',
    });
  });

  it('should forward FastAPI error responses', async () => {
    const { default: handler } = await import('../../pages/api/schedule');

    // Mock FastAPI error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'Invalid request data' }),
    } as any);

    const req = {
      method: 'POST',
      body: {
        tasks: [],
        events: [],
        preferences: {},
        dateRange: { start: '2024-01-01', end: '2024-01-02' },
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Scheduling failed',
      details: 'Invalid request data',
    });
  });

  it('should handle empty task list', async () => {
    const { default: handler } = await import('../../pages/api/schedule');

    // Mock successful response with empty schedule
    const mockResponse = {
      scheduledBlocks: [],
      unscheduledTasks: [],
      explanations: {},
      metrics: {
        freeHours: 8.0,
        scheduledHours: 0.0,
        tasksOnTime: 0,
        deepWorkHours: 0.0,
        contextSwitchPenalty: 0,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as any);

    const req = {
      method: 'POST',
      body: {
        tasks: [],
        events: [],
        preferences: {
          dayStartHour: 9,
          dayEndHour: 17,
          slotStepMin: 30,
          bufferMin: 0,
          maxHeavyPerDay: 3,
        },
        dateRange: { start: '2024-01-01T09:00:00', end: '2024-01-02T09:00:00' },
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });
});
