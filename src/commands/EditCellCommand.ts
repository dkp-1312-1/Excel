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
    }
    
    undo(): void { 
        this.dataStore.setValue(this.row, this.col, this.oldVal); 
    }
}
