import { CONFIG } from './Config.js';
import { DataStore } from './DataStore.js';
import { CanvasRendering } from './CanvasRendering.js';
import { SelectionManager } from './SelectionManager.js';
import { DimensionManager } from './DimensionManager.js';

export class GridApp {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private scrollContent: HTMLElement;
    private statsEl: HTMLElement;
    
    private dataStore: DataStore;
    private renderer: CanvasRendering;
    private selection: SelectionManager;
    private dimensionManager:DimensionManager;
    
    private isSelecting: boolean = false;
    private resizingCol:number=-1;
    private resizingRow:number=-1;
    private startMousePos:number=0;
    private startSize:number=0;
 
    constructor() {
        this.container = document.getElementById('grid-container') as HTMLElement;
        this.canvas = document.getElementById('grid-canvas') as HTMLCanvasElement;
        this.scrollContent = document.getElementById('scroll-content') as HTMLElement;
        this.statsEl = document.getElementById('stats') as HTMLElement;
 
        this.dataStore = new DataStore();
        this.renderer = new CanvasRendering(this.canvas, this.dataStore);
        this.selection = new SelectionManager();
        this.dimensionManager=new DimensionManager();


        this.init();
    }
 
    private init(): void {
        this.dataStore.generateInitialData(50000);
        this.updateScrollbarSize();
        this.bindEvents();
        this.resize();
    }

    private updateScrollbarSize():void
    {
        this.scrollContent.style.width = `${CONFIG.headerWidth + (CONFIG.totalCols * CONFIG.colWidth)}px`;
        this.scrollContent.style.height = `${CONFIG.headerHeight + (CONFIG.totalRows * CONFIG.rowHeight)}px`;
    }
 
    private bindEvents(): void {
        window.addEventListener('resize', () => this.resize());
        this.container.addEventListener('scroll', () => this.render());
 
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e)); 
        window.addEventListener('mouseup', () => this.handleMouseUp());
    }
 
    private getCellFromEvent(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scrollX=this.container.scrollLeft;
        const scrollY=this.container.scrollTop;

        // Calculate absolute grid coordinates
        const targetX = mouseX - CONFIG.headerWidth + scrollX;
        const targetY = mouseY - CONFIG.headerHeight + scrollY;
 
        let col = 1;
        while (this.dimensionManager.getColX(col) + this.dimensionManager.getColWidth(col) <= targetX && col < CONFIG.totalCols) {
            col++;
        }
        
        let row = 1;
        while (this.dimensionManager.getRowY(row) + this.dimensionManager.getRowHeight(row) <= targetY && row < CONFIG.totalRows) {
            row++;
        }
        return {row,col,mouseX,mouseY};
    }

    private handleMouseDown(e: MouseEvent): void {
        if (e.button !== 0) return;
        const {row,col,mouseX,mouseY}=this.getCellFromEvent(e);

        // Start Resizing
        if (this.canvas.style.cursor === 'col-resize') {
            this.resizingCol = col;
            this.startSize = this.dimensionManager.getColWidth(col);
            this.startMousePos = e.clientX;
            return;
        }
        if (this.canvas.style.cursor === 'row-resize') {
            this.resizingRow = row;
            this.startSize = this.dimensionManager.getRowHeight(row);
            this.startMousePos = e.clientY;
            return;
        }

        //  Row / Column Selection
        if (mouseY <= CONFIG.headerHeight && mouseX > CONFIG.headerWidth) {
            this.selection.selectWholeColumn(col);
            this.isSelecting = true;
            this.render();
            return;
        }
        if (mouseX <= CONFIG.headerWidth && mouseY > CONFIG.headerHeight) {
            this.selection.selectWholeRow(row);
            this.isSelecting = true;
            this.render();
            return;
        }

        // Normal Cell Selection
        if (mouseX > CONFIG.headerWidth && mouseY > CONFIG.headerHeight) {
            this.selection.setStart(row, col);
            this.isSelecting = true;
            this.render();
        }
    }
 
    private handleMouseMove(e: MouseEvent): void {
        const { row, col, mouseX, mouseY } = this.getCellFromEvent(e);
 
        // Drag to Resize
        if (this.resizingCol !== -1) {
            const diff = e.clientX - this.startMousePos;
            this.dimensionManager.setColWidth(this.resizingCol, this.startSize + diff);
            this.render();
            return;
        }
        if (this.resizingRow !== -1) {
            const diff = e.clientY - this.startMousePos;
            this.dimensionManager.setRowHeight(this.resizingRow, this.startSize + diff);
            this.render();
            return;
        }
        // Drag to Select
        if (this.isSelecting) {
            // Prevent going out of bounds while dragging
            const safeRow = Math.max(1, Math.min(CONFIG.totalRows, row));
            const safeCol = Math.max(1, Math.min(CONFIG.totalCols, col));
            this.selection.setEnd(safeRow, safeCol);
            this.render();
            this.updateStats();
            return;
        }

        // Hover to change cursor (Boundary Detection)
        let cursor = 'cell';
        const scrollX = this.container.scrollLeft;
        const scrollY = this.container.scrollTop;
        
        const rightEdge = CONFIG.headerWidth + this.dimensionManager.getColX(col) + this.dimensionManager.getColWidth(col) - scrollX;
        const bottomEdge = CONFIG.headerHeight + this.dimensionManager.getRowY(row) + this.dimensionManager.getRowHeight(row) - scrollY;
 
        // If hovering over Top Header and near the right edge of a column
        if (mouseY <= CONFIG.headerHeight && Math.abs(mouseX - rightEdge) < 5) {
            cursor = 'col-resize';
        }
        // If hovering over Left Header and near the bottom edge of a row
        else if (mouseX <= CONFIG.headerWidth && Math.abs(mouseY - bottomEdge) < 5) {
            cursor = 'row-resize';
        }
        this.canvas.style.cursor = cursor;
    }

    private handleMouseUp(): void {
        this.isSelecting = false;

        // If we were resizing, we need to update the scrollbar div when we let go
        if (this.resizingCol !== -1 || this.resizingRow !== -1) {
            this.updateScrollbarSize();
        }
        this.resizingCol = -1;
        this.resizingRow = -1;
    }

    private updateStats(): void {
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
 
    private resize(): void {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.render();
    }
 
    private render(): void {
        this.renderer.drawSelection(
            this.container.scrollLeft,
            this.container.scrollTop,
            this.canvas.width,
            this.canvas.height,
            this.selection,
            this.dimensionManager
        );
    }
}