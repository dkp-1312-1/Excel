import { CONFIG } from './Config.js';
import { GridDataStore } from './GridDataStore.js';
import { SelectionManager } from './SelectionManager.js';

export class SummaryCalculator {
    constructor(private statsEl: HTMLElement, private dataStore: GridDataStore, private selection: SelectionManager) {}

    public updateStats(): void {
        if (!this.selection.hasSelection()) return;
 
        const range = this.selection.getRange();
        let count = 0, sum = 0, min = Infinity, max = -Infinity, hasNum = false;
 
        // Only compute stats if range isn't absurdly massive to prevent UI freezing
        // (If they select 100,000 rows, we might skip full traversal or limit it)
        const cellCount = (range.rMax - range.rMin + 1) * (range.cMax - range.cMin + 1);
        
        if (cellCount > CONFIG.maxCellsForStats) {
             this.statsEl.innerText = `Count: ${cellCount} | ${CONFIG.statsTooLargeMsg}`;
             return;
        }
 
        for (let r = range.rMin; r <= range.rMax; r++) {
            for (let c = range.cMin; c <= range.cMax; c++) {
                const cell = this.dataStore.getValue(r, c);
                if (cell !== null && cell.value !== '') {
                    count++;
                    const num = parseFloat(cell.value.toString());
                    if (!isNaN(num)) {
                        hasNum = true;
                        sum += num;
                        if (num < min) min = num;
                        if (num > max) max = num;
                    }
                }
            }
        }
        
        if (hasNum) {
            const avg = (sum / count).toFixed(2);
            this.statsEl.innerText = `Count: ${count} | Sum: ${sum.toFixed(2)} | Avg: ${avg} | Min: ${min} | Max: ${max}`;
        } else {
            this.statsEl.innerText = `Count: ${count}`;
        }
    }
}
