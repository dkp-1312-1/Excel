import { GridDataStore } from '../models/GridDataStore.js';
import type { ICommand } from './ICommand.js';

export class EditCellCommand implements ICommand {
    constructor(
        private dataStore: GridDataStore,
        private row: number,
        private col: number,
        private oldVal: string | number,
        private newVal: string | number
    ) {}

    execute(): void { 
        this.dataStore.setValue(this.row, this.col, this.newVal); 
        this.saveToServer(this.newVal);
    }
    
    undo(): void { 
        this.dataStore.setValue(this.row, this.col, this.oldVal); 
        this.saveToServer(this.oldVal);
    }

    private saveToServer(value: string | number): void {
        fetch('/api/cell', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ row: this.row, col: this.col, value })
        }).catch(err => console.error('Failed to save cell:', err));
    }
}
