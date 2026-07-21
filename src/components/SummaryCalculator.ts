import { CONFIG } from '../config/Config.js';
import { GridDataStore } from '../models/GridDataStore.js';
import { SelectionManager, type rangeData } from '../managers/SelectionManager.js';
import type { CellModel } from '../models/CellModel.js';

export class SummaryCalculator {
    constructor(private statsEl: HTMLElement, private dataStore: GridDataStore, private selection: SelectionManager) {}

    public updateStats(): void {
        if (!this.selection.hasSelection()) return;
 
        const range:rangeData = this.selection.getRange();
        let count: number = 0, sum: number = 0, min: number = Infinity, max: number = -Infinity, hasNum: boolean = false;
 
        // (If they select 100,000 rows, we might skip full traversal or limit it)
        const cellCount:number = (range.rMax - range.rMin + 1) * (range.cMax - range.cMin + 1);
        
        if (cellCount > CONFIG.maxCellsForStats) {
             this.statsEl.innerText = `Count: ${cellCount} | ${CONFIG.statsTooLargeMsg}`;
             return;
        }
 
        for (let r: number = range.rMin; r <= range.rMax; r++) {
            for (let c: number = range.cMin; c <= range.cMax; c++) {
                const cell:CellModel = this.dataStore.getValue(r, c)!;
                if (cell !== null && cell.value !== '') {
                    if (Number(cell.value.toString())) {
                        const num:number=parseFloat(cell.value.toString());
                        count++;
                        hasNum = true;
                        sum += num;
                        if (num < min) min = num;
                        if (num > max) max = num;
                    }
                }
            }
        }
        
        if (hasNum) 
        {
            const avg:number = Number((sum / count).toFixed(2));
            this.statsEl.innerText = `Count: ${count} | Sum: ${sum.toFixed(2)} | Avg: ${avg} | Min: ${min} | Max: ${max}`;
        } 
        else 
        {
            this.statsEl.innerText = `Count: ${count}`;
        }
    }
}
