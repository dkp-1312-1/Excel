import { GridDataStore } from '../models/GridDataStore.js';

import { CONFIG } from '../config/Config.js';

 
export class JsonDataLoader {
    public async loadJSON(url: string, dataStore: GridDataStore): Promise<void> {
        try {
            const response = await fetch('/api/data');
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
            const data: Record<string, string | number> = await response.json();
            
            for (const key in data) {
                const parts = key.split(',');
                if (parts.length === 2) {
                    const row = parseInt(parts[0]!, 10);
                    const col = parseInt(parts[1]!, 10);
                    dataStore.setValue(row, col, data[key]!);
                }
            }
        } 
        catch (error) {
            console.error('Error loading data:', error);
        }
    }
}