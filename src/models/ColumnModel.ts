import { CONFIG } from '../config/Config.js';

export class ColumnModel {
    private customWidths: Map<number, number> = new Map();

    public getColWidth(col: number): number {
        return this.customWidths.get(col) ?? CONFIG.colWidth;
    }

    public setColWidth(col: number, width: number): void {
        this.customWidths.set(col, Math.max(width, CONFIG.minColWidth));
    }

    public getColX(col: number): number {
        let totalWidthRequired: number = (col - 1) * CONFIG.colWidth;
        for (const [column, width] of this.customWidths.entries()) {
            if (column < col) {
                totalWidthRequired += (width - CONFIG.colWidth);
            }
        }
        return totalWidthRequired;
    }
}
