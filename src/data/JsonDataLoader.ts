import { GridDataStore } from '../models/GridDataStore.js';
import { firstNames, lastNames } from './data.js';
import { CONFIG } from '../config/Config.js';

 
export class JsonDataLoader {
    public async loadJSON(url: string, dataStore: GridDataStore): Promise<void> {
        try {
            // Setting headers
            dataStore.setValue(0, 1, 'ID');
            dataStore.setValue(0, 2, 'First Name');
            dataStore.setValue(0, 3, 'Last Name');
            dataStore.setValue(0, 4, 'Age');
            dataStore.setValue(0, 5, 'Salary');
 
            // Generating data
            for (let row: number = 1; row <= CONFIG.dataRows; row++) {
                const firstName: string = firstNames[Math.floor(Math.random() * firstNames.length)]!;
                const lastName: string = lastNames[Math.floor(Math.random() * lastNames.length)]!;
                const age: number = Math.floor(Math.random() * 40) + 20;
                const salary: number = Math.floor(Math.random() * 900000) + 100000;
 
                dataStore.setValue(row, 1, row);
                dataStore.setValue(row, 2, firstName);
                dataStore.setValue(row, 3, lastName);
                dataStore.setValue(row, 4, age);
                dataStore.setValue(row, 5, salary);
            }
        } 
        catch (error) {
            console.error('Error generating data:', error);
        }
    }
}