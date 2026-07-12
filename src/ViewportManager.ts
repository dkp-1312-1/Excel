import { CONFIG } from "./Config.js";
import type { RowModel } from "./RowModel.js";
import type { ColumnModel } from "./ColumnModel.js";

export class ViewportManager {
    constructor(
        private rowModel: RowModel,
        private colModel: ColumnModel
    ) {}

    public getVisibleRange(scrollX: number, scrollY: number, width: number, height: number): { startRow: number, endRow: number, startCol: number, endCol: number } {
        let startCol = 1;
        while (this.colModel.getColX(startCol) + this.colModel.getColWidth(startCol) < scrollX && startCol < CONFIG.totalCols) {
            startCol++;
        }
        let endCol = startCol;
        while (this.colModel.getColX(endCol) < scrollX + width && endCol < CONFIG.totalCols) {
            endCol++;
        }

        let startRow = 1;
        while (this.rowModel.getRowY(startRow) + this.rowModel.getRowHeight(startRow) < scrollY && startRow < CONFIG.totalRows) {
            startRow++;
        }
        
        let endRow = startRow;
        while (this.rowModel.getRowY(endRow) < scrollY + height && endRow < CONFIG.totalRows) {
            endRow++;
        }

        return { startRow, endRow, startCol, endCol };
    }
}
