import { DataStore } from './DataStore.js';
import { SelectionManager } from './SelectionManager.js';

export class StatsManager {
    constructor(private statsEl: HTMLElement, private dataStore: DataStore, private selection: SelectionManager) {}

    public updateStats(): void {
        if (!this.selection.hasSelection()) return;
 
        const range = this.selection.getRange();
        let count = 0, sum = 0, min = Infinity, max = -Infinity, hasNum = false;
 
        // Only compute stats if range isn't absurdly massive to prevent UI freezing
        // (If they select 100,000 rows, we might skip full traversal or limit it)
        const cellCount = (range.rMax - range.rMin + 1) * (range.cMax - range.cMin + 1);
        
        if (cellCount > 500000) {
             this.statsEl.innerText = `Count: ${cellCount} | Range too large for sum computations`;
             return;
        }
 
        for (let r = range.rMin; r <= range.rMax; r++) {
            for (let c = range.cMin; c <= range.cMax; c++) {
                const val = this.dataStore.getValue(r, c);
                if (val !== '') {
                    count++;
                    const num = parseFloat(val.toString());
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
