import { GridDataStore } from './GridDataStore.js';

export class JsonDataLoader {
    public async loadJSON(url: string, dataStore: GridDataStore): Promise<void> {
        try {
            const response = await fetch(url);
            const data = await response.json();

            dataStore.setValue(0, 1, 'ID');
            dataStore.setValue(0, 2, 'First Name');
            dataStore.setValue(0, 3, 'Last Name');
            dataStore.setValue(0, 4, 'Age');
            dataStore.setValue(0, 5, 'Salary');
            
            let row = 1;
            for (const record of data) {
                dataStore.setValue(row, 1, record.id);
                dataStore.setValue(row, 2, record.firstName);
                dataStore.setValue(row, 3, record.lastName);
                dataStore.setValue(row, 4, record.age);
                dataStore.setValue(row, 5, record.salary);
                row++;
            }
        } catch (error) {
            console.error('Error loading JSON data:', error);
        }
    }
}
