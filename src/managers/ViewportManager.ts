import { CONFIG } from '../config/Config.js';
import type { RowModel } from '../models/RowModel.js';
import type { ColumnModel } from '../models/ColumnModel.js';

export interface canvasRange{
    startRow:number;
    endRow:number;
    startCol:number;
    endCol:number
}
export class ViewportManager {
    constructor(
        private rowModel: RowModel,
        private colModel: ColumnModel
    ) {}

    public getVisibleRange(scrollX: number, scrollY: number, width: number, height: number): canvasRange{
        let startCol: number = 1;
        while (this.colModel.getColX(startCol) + this.colModel.getColWidth(startCol) < scrollX && startCol < CONFIG.totalCols) {
            startCol++;
        }

        let endCol: number = startCol;
        while (this.colModel.getColX(endCol) < scrollX + width && endCol < CONFIG.totalCols) {
            endCol++;
        }

        let startRow: number = 1;
        while (this.rowModel.getRowY(startRow) + this.rowModel.getRowHeight(startRow) < scrollY && startRow < CONFIG.totalRows) {
            startRow++;
        }
        
        let endRow: number = startRow;
        while (this.rowModel.getRowY(endRow) < scrollY + height && endRow < CONFIG.totalRows) {
            endRow++;
        }

        return { startRow, endRow, startCol, endCol };
    }
}
