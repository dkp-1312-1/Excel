import { CONFIG } from '../config/Config.js';
import { GridDataStore } from '../models/GridDataStore.js';
import { RowModel } from '../models/RowModel.js';
import { ColumnModel } from '../models/ColumnModel.js';
import { ViewportManager } from '../managers/ViewportManager.js';
import { SelectionManager } from '../managers/SelectionManager.js';

export class GridRenderer {
    private ctx: CanvasRenderingContext2D;

    constructor(private canvas: HTMLCanvasElement, private dataStore: GridDataStore) {
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    }
    //Converts column index number into an Excel-style letter coordinate.
    private getColLetter(col: number): string {
        let letter: string = '';
        while (col > 0) {
            let reminder: number = (col - 1) % 26;
            letter = String.fromCharCode(65 + reminder) + letter;
            col = Math.floor((col - 1) / 26);
        }
        return letter;
    }
    public drawSelection(scrollX: number, scrollY: number, width: number, height: number, selection: SelectionManager, rowModel: RowModel, colModel: ColumnModel, viewportManager: ViewportManager): void {
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.translate(0.5, 0.5);

        //Calculate visible range of scroll
        const { startRow, endRow, startCol, endCol } = viewportManager.getVisibleRange(scrollX, scrollY, width, height);

        this.ctx.font = CONFIG.font;

        //make text align in terms of top,middle,bottom
        this.ctx.textBaseline = CONFIG.textBaseline;

        //draw cells and texts
        for (let r: number = startRow; r <= endRow; r++) {
            for (let c: number = startCol; c <= endCol; c++) {
                const x = CONFIG.headerWidth + colModel.getColX(c) - scrollX;
                const y = CONFIG.headerHeight + rowModel.getRowY(r) - scrollY;
                const w = colModel.getColWidth(c);
                const h = rowModel.getRowHeight(r);

                this.ctx.strokeStyle = CONFIG.gridColor;
                this.ctx.strokeRect(x, y, w, h);

                const cell = this.dataStore.getValue(r, c);
                if (cell !== null && cell.value !== '') {
                    //Set Value in Cell
                    this.ctx.fillStyle = CONFIG.textColor;
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.rect(x, y, w, h);
                    this.ctx.clip();
                    this.ctx.fillText(cell.value.toString(), x + CONFIG.cellTextPadding, y + (h / 2));
                    this.ctx.restore();
                }
            }
        }

        //draw selection
        if (selection.hasSelection()) {
            //get coordinates for length and width
            const range = selection.getRange();
            const x = CONFIG.headerWidth + colModel.getColX(range.cMin) - scrollX;
            const y = CONFIG.headerHeight + rowModel.getRowY(range.rMin) - scrollY;
             // Width is the right edge of cMax minus the left edge of cMin
            const selW = colModel.getColWidth(range.cMax) + colModel.getColX(range.cMax) - colModel.getColX(range.cMin);
            // Height is the bottom edge of rMax minus the top edge of rMin
            const selH = rowModel.getRowHeight(range.rMax) + rowModel.getRowY(range.rMax) - rowModel.getRowY(range.rMin);
 
            //draw box for selection
            this.ctx.fillStyle = CONFIG.selectionBg;
            this.ctx.fillRect(x, y, selW, selH);
            this.ctx.strokeStyle = CONFIG.selectionBorder;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, selW, selH);
            this.ctx.lineWidth = 1;
        }

        //draw  First Row As A,B,C,... 
        this.ctx.fillStyle = CONFIG.headerBg;
        this.ctx.fillRect(CONFIG.headerWidth, 0, width, CONFIG.headerHeight);
        for (let c: number = startCol; c <= endCol; c++) {
            const x = CONFIG.headerWidth + colModel.getColX(c) - scrollX;
            const w = colModel.getColWidth(c);

            this.ctx.strokeStyle = CONFIG.headerBorderColor;
            this.ctx.strokeRect(x, 0, w, CONFIG.headerHeight);

            this.ctx.fillStyle = CONFIG.textColor;
            this.ctx.textAlign = CONFIG.textAlignCenter;
            this.ctx.fillText(this.getColLetter(c), x + (w / 2), CONFIG.headerHeight / 2);
            this.ctx.textAlign = CONFIG.textAlignLeft;
        }

        //draw First Column As 1,2,3,...
        this.ctx.fillStyle = CONFIG.headerBg;
        this.ctx.fillRect(0, CONFIG.headerHeight, CONFIG.headerWidth, height);
        for (let r: number = startRow; r <= endRow; r++) {
            const y = CONFIG.headerHeight + rowModel.getRowY(r) - scrollY;
            const h = rowModel.getRowHeight(r);

            this.ctx.strokeStyle = CONFIG.headerBorderColor;
            this.ctx.strokeRect(0, y, CONFIG.headerWidth, h);

            this.ctx.fillStyle = CONFIG.textColor;
            this.ctx.textAlign = CONFIG.textAlignCenter;
            this.ctx.fillText(r.toString(), CONFIG.headerWidth / 2, y + (h / 2));
            this.ctx.textAlign = CONFIG.textAlignLeft;
        }

        //draw first Cell which intersect (1,2,3,...) & (A,B,C,...)
        this.ctx.fillStyle = CONFIG.headerBg;
        this.ctx.fillRect(0, 0, CONFIG.headerWidth, CONFIG.headerHeight);
        this.ctx.strokeRect(0, 0, CONFIG.headerWidth, CONFIG.headerHeight);
        
        this.ctx.translate(-0.5, -0.5);
    }
}