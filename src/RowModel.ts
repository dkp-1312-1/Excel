import { CONFIG } from "./Config.js";

export class RowModel {
    private customHeights: Map<number, number> = new Map();

    public getRowHeight(row: number): number {
        return this.customHeights.get(row) ?? CONFIG.rowHeight;
    }

    public setRowHeight(row: number, height: number): void {
        this.customHeights.set(row, Math.max(height, CONFIG.minRowHeight));
    }

    public getRowY(row: number): number {
        let totalHeightRequired: number = (row - 1) * CONFIG.rowHeight;
        for (const [tempRow, height] of this.customHeights.entries()) {
            if (tempRow < row) {
                totalHeightRequired += (height - CONFIG.rowHeight);
            }
        }
        return totalHeightRequired;
    }
}
