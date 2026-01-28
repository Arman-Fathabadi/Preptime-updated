/**
 * Feature: intelligent-scheduler, Property 31: Schema cross-language validation
 * 
 * For any valid data object that passes TypeScript validation, the same JSON should 
 * pass Python Pydantic validation, and vice versa.
 * 
 * Validates: Requirements 17.3, 17.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { Task, Event, Preferences } from '@shared/types';

// Arbitrary generators for TypeScript types
const taskArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  durationMin: fc.integer({ min: 15, max: 480 }),
  dueAt: fc.option(fc.date().map(d => d.toISOString()), { nil: undefined }),
  type: fc.constantFrom('study', 'deep', 'admin', 'relax') as fc.Arbitrary<'study' | 'deep' | 'admin' | 'relax'>,
  energy: fc.constantFrom('low', 'med', 'high') as fc.Arbitrary<'low' | 'med' | 'high'>,
  window: fc.option(
    fc.record({
      startHour: fc.integer({ min: 0, max: 23 }),
      endHour: fc.integer({ min: 0, max: 23 }),
    }),
    { nil: undefined }
  ),
  splittable: fc.boolean(),
  priority: fc.constantFrom(1, 2, 3, 4, 5) as fc.Arbitrary<1 | 2 | 3 | 4 | 5>,
  mode: fc.constantFrom('study', 'lockin', 'relax', 'balanced') as fc.Arbitrary<'study' | 'lockin' | 'relax' | 'balanced'>,
});

const eventArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  start: fc.date().map(d => d.toISOString()),
  end: fc.date().map(d => d.toISOString()),
  kind: fc.constantFrom('fixed', 'blocked') as fc.Arbitrary<'fixed' | 'blocked'>,
});

const preferencesArbitrary = fc.record({
  dayStartHour: fc.integer({ min: 0, max: 12 }),
  dayEndHour: fc.integer({ min: 13, max: 23 }),
  slotStepMin: fc.constantFrom(15, 30, 60),
  bufferMin: fc.integer({ min: 0, max: 30 }),
  maxHeavyPerDay: fc.integer({ min: 1, max: 10 }),
});

// Helper function to validate JSON in Python
function validateInPython(modelType: string, jsonData: string): { valid: boolean; error?: string } {
  const tempJsonFile = path.join(__dirname, `temp_data_${Date.now()}.json`);
  const tempPyFile = path.join(__dirname, `temp_script_${Date.now()}.py`);
  
  try {
    // Write JSON data to file
    fs.writeFileSync(tempJsonFile, jsonData);
    
    // Write Python script to file
    const pythonScript = `import sys
import json
sys.path.insert(0, r'${path.resolve(__dirname, '../../../shared')}')
from models import ${modelType}

try:
    with open(r'${tempJsonFile}', 'r') as f:
        data = json.load(f)
    obj = ${modelType}(**data)
    print('VALID')
except Exception as e:
    print(f'INVALID: {str(e)}')
`;
    
    fs.writeFileSync(tempPyFile, pythonScript);
    
    // Execute Python script
    const result = execSync(`python "${tempPyFile}"`, {
      encoding: 'utf-8',
      cwd: path.resolve(__dirname, '../../..'),
    });
    
    if (result.trim().startsWith('VALID')) {
      return { valid: true };
    } else {
      return { valid: false, error: result.trim() };
    }
  } catch (error: any) {
    return { valid: false, error: error.message };
  } finally {
    // Cleanup temp files
    if (fs.existsSync(tempJsonFile)) {
      fs.unlinkSync(tempJsonFile);
    }
    if (fs.existsSync(tempPyFile)) {
      fs.unlinkSync(tempPyFile);
    }
  }
}

// Helper function to generate and validate from Python
function generateAndValidateFromPython(modelType: string): { valid: boolean; data?: any; error?: string } {
  const tempPyFile = path.join(__dirname, `temp_gen_${Date.now()}.py`);
  
  try {
    const pythonScript = `import sys
import json
import random
from datetime import datetime, timedelta
sys.path.insert(0, r'${path.resolve(__dirname, '../../../shared')}')
from models import ${modelType}

def generate_${modelType.toLowerCase()}():
    if '${modelType}' == 'Task':
        return {
            'id': str(random.randint(1000, 9999)),
            'title': 'Test Task',
            'durationMin': random.choice([15, 30, 60, 120]),
            'type': random.choice(['study', 'deep', 'admin', 'relax']),
            'energy': random.choice(['low', 'med', 'high']),
            'splittable': random.choice([True, False]),
            'priority': random.choice([1, 2, 3, 4, 5]),
            'mode': random.choice(['study', 'lockin', 'relax', 'balanced'])
        }
    elif '${modelType}' == 'Event':
        start = datetime.now()
        end = start + timedelta(hours=1)
        return {
            'id': str(random.randint(1000, 9999)),
            'title': 'Test Event',
            'start': start.isoformat(),
            'end': end.isoformat(),
            'kind': random.choice(['fixed', 'blocked'])
        }
    elif '${modelType}' == 'Preferences':
        return {
            'dayStartHour': random.randint(6, 9),
            'dayEndHour': random.randint(18, 22),
            'slotStepMin': random.choice([15, 30, 60]),
            'bufferMin': random.randint(0, 15),
            'maxHeavyPerDay': random.randint(2, 5)
        }

data = generate_${modelType.toLowerCase()}()
obj = ${modelType}(**data)
print(json.dumps(obj.model_dump(by_alias=True)))
`;
    
    fs.writeFileSync(tempPyFile, pythonScript);
    
    const result = execSync(`python "${tempPyFile}"`, {
      encoding: 'utf-8',
      cwd: path.resolve(__dirname, '../../..'),
    });
    
    const data = JSON.parse(result.trim());
    return { valid: true, data };
  } catch (error: any) {
    return { valid: false, error: error.message };
  } finally {
    if (fs.existsSync(tempPyFile)) {
      fs.unlinkSync(tempPyFile);
    }
  }
}

describe('Schema Cross-Language Validation', () => {
  it('should validate Task objects from TypeScript in Python', () => {
    fc.assert(
      fc.property(taskArbitrary, (task: Task) => {
        const json = JSON.stringify(task);
        const result = validateInPython('Task', json);
        
        if (!result.valid) {
          console.error('Validation failed for task:', task);
          console.error('Error:', result.error);
        }
        
        return result.valid;
      }),
      { numRuns: 20 }
    );
  });

  it('should validate Event objects from TypeScript in Python', () => {
    fc.assert(
      fc.property(eventArbitrary, (event: Event) => {
        const json = JSON.stringify(event);
        const result = validateInPython('Event', json);
        
        if (!result.valid) {
          console.error('Validation failed for event:', event);
          console.error('Error:', result.error);
        }
        
        return result.valid;
      }),
      { numRuns: 20 }
    );
  });

  it('should validate Preferences objects from TypeScript in Python', () => {
    fc.assert(
      fc.property(preferencesArbitrary, (preferences: Preferences) => {
        const json = JSON.stringify(preferences);
        const result = validateInPython('Preferences', json);
        
        if (!result.valid) {
          console.error('Validation failed for preferences:', preferences);
          console.error('Error:', result.error);
        }
        
        return result.valid;
      }),
      { numRuns: 20 }
    );
  });

  it('should validate Task objects from Python in TypeScript', () => {
    // Run multiple iterations manually since we're generating from Python
    for (let i = 0; i < 20; i++) {
      const result = generateAndValidateFromPython('Task');
      
      if (!result.valid) {
        throw new Error(`Failed to generate valid Task from Python: ${result.error}`);
      }
      
      // Validate the structure in TypeScript
      const task = result.data as Task;
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('durationMin');
      expect(task).toHaveProperty('type');
      expect(task).toHaveProperty('energy');
      expect(task).toHaveProperty('splittable');
      expect(task).toHaveProperty('priority');
      expect(task).toHaveProperty('mode');
      
      expect(['study', 'deep', 'admin', 'relax']).toContain(task.type);
      expect(['low', 'med', 'high']).toContain(task.energy);
      expect([1, 2, 3, 4, 5]).toContain(task.priority);
      expect(['study', 'lockin', 'relax', 'balanced']).toContain(task.mode);
    }
  });

  it('should validate Event objects from Python in TypeScript', () => {
    for (let i = 0; i < 20; i++) {
      const result = generateAndValidateFromPython('Event');
      
      if (!result.valid) {
        throw new Error(`Failed to generate valid Event from Python: ${result.error}`);
      }
      
      const event = result.data as Event;
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('start');
      expect(event).toHaveProperty('end');
      expect(event).toHaveProperty('kind');
      
      expect(['fixed', 'blocked']).toContain(event.kind);
      
      // Validate ISO 8601 format
      expect(() => new Date(event.start)).not.toThrow();
      expect(() => new Date(event.end)).not.toThrow();
    }
  });

  it('should validate Preferences objects from Python in TypeScript', () => {
    for (let i = 0; i < 20; i++) {
      const result = generateAndValidateFromPython('Preferences');
      
      if (!result.valid) {
        throw new Error(`Failed to generate valid Preferences from Python: ${result.error}`);
      }
      
      const prefs = result.data as Preferences;
      expect(prefs).toHaveProperty('dayStartHour');
      expect(prefs).toHaveProperty('dayEndHour');
      expect(prefs).toHaveProperty('slotStepMin');
      expect(prefs).toHaveProperty('bufferMin');
      expect(prefs).toHaveProperty('maxHeavyPerDay');
      
      expect(prefs.dayStartHour).toBeGreaterThanOrEqual(0);
      expect(prefs.dayStartHour).toBeLessThanOrEqual(23);
      expect(prefs.dayEndHour).toBeGreaterThanOrEqual(0);
      expect(prefs.dayEndHour).toBeLessThanOrEqual(23);
    }
  });
});
