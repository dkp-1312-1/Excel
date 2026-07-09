import { CONFIG } from "./Config.js";
import { DataStore } from "./DataStore.js";
import type { DimensionManager } from "./DimensionManager.js";
import { SelectionManager } from "./SelectionManager.js";

export class CanvasRendering {
    private ctx: CanvasRenderingContext2D;

    constructor(private canvas: HTMLCanvasElement, private dataStore: DataStore) {
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    }
    //Converts column index number into an Excel-style letter coordinate.
    private getColLetter(col: number): string {
        let letter = '';
        while (col > 0) {
            let reminder = (col - 1) % 26;
            letter = String.fromCharCode(65 + reminder) + letter;
            col = Math.floor((col - 1) / 26);
        }
        return letter;
    }
    public drawSelection(scrollX: number, scrollY: number, width: number, height: number, selection: SelectionManager, dimension: DimensionManager): void {
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.translate(0.5, 0.5);

        //Calculate visible range of scroll
        let startCol = 1;
        while (dimension.getColX(startCol) + dimension.getColWidth(startCol) < scrollX && startCol < CONFIG.totalCols) {
            startCol++;
        }
        let endCol = startCol;
        while (dimension.getColX(endCol) < scrollX + width && endCol < CONFIG.totalCols) {
            endCol++;
        }
 
        let startRow = 1;
        while (dimension.getRowY(startRow) + dimension.getRowHeight(startRow) < scrollY && startRow < CONFIG.totalRows) {
            startRow++;
        }
        
        let endRow = startRow;
        while (dimension.getRowY(endRow) < scrollY + height && endRow < CONFIG.totalRows) {
            endRow++;
        }

        this.ctx.font = CONFIG.font;

        //make text align in terms of top,middle,bottom
        this.ctx.textBaseline = 'middle';

        //draw cells and texts
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const x = CONFIG.headerWidth + dimension.getColX(c) - scrollX;
                const y = CONFIG.headerHeight + dimension.getRowY(r) - scrollY;
                const w=dimension.getColWidth(c);
                const h=dimension.getRowHeight(r);

                this.ctx.strokeStyle = CONFIG.gridColor;
                this.ctx.strokeRect(x, y,w,h);

                const val = this.dataStore.getValue(r, c);
                if (val !== '') {
                    //Set Value in Cell
                    this.ctx.fillStyle = CONFIG.textColor;
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.rect(x, y,w,h);
                    this.ctx.clip();
                    this.ctx.fillText(val.toString(), x + 6, y + (h / 2));
                    this.ctx.restore();
                }
            }
        }

        //draw selection
        if (selection.hasSelection()) {
            //get coordinates for length and width
            const range = selection.getRange();
            const x = CONFIG.headerWidth + dimension.getColX(range.cMin) - scrollX;
            const y = CONFIG.headerHeight +dimension.getRowY(range.rMin) - scrollY;
             // Width is the right edge of cMax minus the left edge of cMin
            const selW =  dimension.getColWidth(range.cMax)+dimension.getColX(range.cMax) - dimension.getColX(range.cMin);
            // Height is the bottom edge of rMax minus the top edge of rMin
            const selH =  dimension.getRowHeight(range.rMax)+dimension.getRowY(range.rMax) - dimension.getRowY(range.rMin);
 
            //draw box for selection
            this.ctx.fillStyle = CONFIG.selectionBg;
            this.ctx.fillRect(x, y, selW, selH);
            this.ctx.strokeStyle = CONFIG.selectionBorder;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y,selW, selH);
            this.ctx.lineWidth = 1;
        }

        //draw  First Row As A,B,C,... 
        this.ctx.fillStyle = CONFIG.headerBg;
        this.ctx.fillRect(CONFIG.headerWidth, 0, width, CONFIG.headerHeight);
        for (let c = startCol; c <= endCol; c++) {
            const x = CONFIG.headerWidth + dimension.getColX(c)- scrollX;
            const w=dimension.getColWidth(c);

            this.ctx.strokeStyle = '#ccc';
            this.ctx.strokeRect(x, 0, w, CONFIG.headerHeight);

            this.ctx.fillStyle = CONFIG.textColor;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.getColLetter(c), x + (w / 2), CONFIG.headerHeight / 2);
            this.ctx.textAlign = 'left';
        }

        //draw First Column As 1,2,3,...
        this.ctx.fillStyle = CONFIG.headerBg;
        this.ctx.fillRect(0, CONFIG.headerHeight, CONFIG.headerWidth, height);
        for (let r = startRow; r <= endRow; r++) {
            const y = CONFIG.headerHeight + dimension.getRowY(r) - scrollY;
            const h=dimension.getRowHeight(r);

            this.ctx.strokeStyle = '#ccc';
            this.ctx.strokeRect(0, y, CONFIG.headerWidth, h);

            this.ctx.fillStyle = CONFIG.textColor;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(r.toString(), CONFIG.headerWidth / 2, y + (h / 2));
            this.ctx.textAlign = 'left';
        }

        //draw first Cell which intersect (1,2,3,...) & (A,B,C,...)
        this.ctx.fillStyle = CONFIG.headerBg;
        this.ctx.fillRect(0, 0, CONFIG.headerWidth, CONFIG.headerHeight);
        this.ctx.strokeRect(0, 0, CONFIG.headerWidth, CONFIG.headerHeight);
        
        this.ctx.translate(-0.5, -0.5);
    }
}