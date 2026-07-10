import { CONFIG } from './Config.js';
import { DimensionManager } from './DimensionManager.js';
import { SelectionManager } from './SelectionManager.js';
import { StatsManager } from './StatsManager.js';

export class InputManager {
    private isSelecting: boolean = false;
    private resizingCol: number = -1;
    private resizingRow: number = -1;
    private startMousePos: number = 0;
    private startSize: number = 0;

    constructor(
        private container: HTMLElement,
        private canvas: HTMLCanvasElement,
        private dimensionManager: DimensionManager,
        private selection: SelectionManager,
        private statsManager: StatsManager,
        private renderCallback: () => void,
        private updateScrollbarCallback: () => void
    ) {}

    public bindEvents(): void {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', () => this.handleMouseUp());
    }

    private getCellFromEvent(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scrollX = this.container.scrollLeft;
        const scrollY = this.container.scrollTop;

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
        return { row, col, mouseX, mouseY };
    }

    private handleMouseDown(e: MouseEvent): void {
        if (e.button !== 0) return;
        const { row, col, mouseX, mouseY } = this.getCellFromEvent(e);

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
            this.renderCallback();
            return;
        }
        if (mouseX <= CONFIG.headerWidth && mouseY > CONFIG.headerHeight) {
            this.selection.selectWholeRow(row);
            this.isSelecting = true;
            this.renderCallback();
            return;
        }

        // Normal Cell Selection
        if (mouseX > CONFIG.headerWidth && mouseY > CONFIG.headerHeight) {
            this.selection.setStart(row, col);
            this.isSelecting = true;
            this.renderCallback();
        }
    }

    private handleMouseMove(e: MouseEvent): void {
        const { row, col, mouseX, mouseY } = this.getCellFromEvent(e);
 
        // Drag to Resize
        if (this.resizingCol !== -1) {
            const diff = e.clientX - this.startMousePos;
            this.dimensionManager.setColWidth(this.resizingCol, this.startSize + diff);
            this.renderCallback();
            return;
        }
        if (this.resizingRow !== -1) {
            const diff = e.clientY - this.startMousePos;
            this.dimensionManager.setRowHeight(this.resizingRow, this.startSize + diff);
            this.renderCallback();
            return;
        }
        // Drag to Select
        if (this.isSelecting) {
            // Prevent going out of bounds while dragging
            const safeRow = Math.max(1, Math.min(CONFIG.totalRows, row));
            const safeCol = Math.max(1, Math.min(CONFIG.totalCols, col));
            this.selection.setEnd(safeRow, safeCol);
            this.renderCallback();
            this.statsManager.updateStats();
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
            this.updateScrollbarCallback();
        }
        this.resizingCol = -1;
        this.resizingRow = -1;
    }
}
