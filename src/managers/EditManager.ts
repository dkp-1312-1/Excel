import { CONFIG } from '../config/Config.js';
import { RowModel } from '../models/RowModel.js';
import { ColumnModel } from '../models/ColumnModel.js';
import { SelectionManager } from './SelectionManager.js';
import { SummaryCalculator } from '../components/SummaryCalculator.js';
import { GridDataStore } from '../models/GridDataStore.js';
import { CommandManager } from './CommandManager.js';
import { EditCellCommand } from '../commands/EditCellCommand.js';
import { ResizeColumnCommand } from '../commands/ResizeColumnCommand.js';
import { ResizeRowCommand } from '../commands/ResizeRowCommand.js';
import type { ViewportManager } from './ViewportManager.js';

export class EditManager {
    private isSelecting: boolean = false;
    private resizingCol: number = -1;
    private resizingRow: number = -1;
    private startMousePos: number = 0;
    private startSize: number = 0;
    private lastMouseDownX: number = 0;
    private lastMouseDownY: number = 0;
    private lastDragTime: number = 0;

    private editor!: HTMLInputElement;
    constructor(
        private container: HTMLElement,
        private canvas: HTMLCanvasElement,
        private rowModel: RowModel,
        private colModel: ColumnModel,
        private selection: SelectionManager,
        private summaryCalculator: SummaryCalculator,
        private dataStore: GridDataStore,
        private cmdManager: CommandManager,
        private viewPortManager:ViewportManager,
        private renderCallback: () => void,
        private updateScrollbarCallback: () => void
    ) {

        this.createEditor();
    }

    private createEditor(): void {
        this.editor = document.createElement('input');
        this.editor.type = 'text';
        this.editor.style.position = 'absolute';
        this.editor.style.display = 'none';
        this.editor.style.boxSizing = 'border-box';
        this.editor.style.border = CONFIG.editorBorder;
        this.editor.style.outline = 'none';
        this.editor.style.font = CONFIG.font;
        this.editor.style.padding = CONFIG.editorPadding;
        this.editor.style.zIndex = CONFIG.editorZIndex;
        this.container.appendChild(this.editor);

        this.editor.addEventListener('blur', () => this.commitEdit());
        this.editor.addEventListener('keydown', (e) => {
            if (e.key === CONFIG.commitKey) {
                this.commitEdit();
            }
        });

        this.container.addEventListener('scroll', () => {
            if (this.editor.style.display === 'block') {
                this.commitEdit();
            }
        })
    }

    public bindEvents(): void {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', () => this.handleMouseUp());

        this.canvas.addEventListener('dblclick', (e) => {
            this.handleDoubleClick(e);
        });

        window.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
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

        let col: number = 1;
        while (this.colModel.getColX(col) + this.colModel.getColWidth(col) <= targetX && col < CONFIG.totalCols) {
            col++;
        }

        let row: number = 1;
        while (this.rowModel.getRowY(row) + this.rowModel.getRowHeight(row) <= targetY && row < CONFIG.totalRows) {
            row++;
        }
        return { row, col, mouseX, mouseY };
    }

    private handleMouseDown(e: MouseEvent): void {
        if (e.button !== 0) return;

        this.lastMouseDownX = e.clientX;
        this.lastMouseDownY = e.clientY;

        if (this.editor.style.display === 'block') {
            this.commitEdit();
        }

        const { row, col, mouseX, mouseY } = this.getCellFromEvent(e);

        // Start Resizing
        if (this.canvas.style.cursor === 'col-resize') {
            this.resizingCol = col;
            this.startSize = this.colModel.getColWidth(col);
            this.startMousePos = e.clientX;
            return;
        }
        if (this.canvas.style.cursor === 'row-resize') {
            this.resizingRow = row;
            this.startSize = this.rowModel.getRowHeight(row);
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

        if (this.resizingCol !== -1 || this.resizingRow !== -1 || this.isSelecting) {
            if (Math.abs(e.clientX - this.lastMouseDownX) > CONFIG.dragThreshold || Math.abs(e.clientY - this.lastMouseDownY) > CONFIG.dragThreshold) {
                this.lastDragTime = Date.now();
            }
        }

        // Drag to Resize
        if (this.resizingCol !== -1) {
            const diff = e.clientX - this.startMousePos;
            this.colModel.setColWidth(this.resizingCol, this.startSize + diff);
            this.renderCallback();
            return;
        }
        if (this.resizingRow !== -1) {
            const diff = e.clientY - this.startMousePos;
            this.rowModel.setRowHeight(this.resizingRow, this.startSize + diff);
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
            this.summaryCalculator.updateStats();
            return;
        }

        // Hover to change cursor (Boundary Detection)
        let cursor: string = 'cell';
        const scrollX = this.container.scrollLeft;
        const scrollY = this.container.scrollTop;

        const rightEdge = CONFIG.headerWidth + this.colModel.getColX(col) + this.colModel.getColWidth(col) - scrollX;
        const bottomEdge = CONFIG.headerHeight + this.rowModel.getRowY(row) + this.rowModel.getRowHeight(row) - scrollY;

        // If hovering over Top Header and near the right edge of a column
        if (mouseY <= CONFIG.headerHeight && Math.abs(mouseX - rightEdge) < CONFIG.resizeHoverMargin) {
            cursor = 'col-resize';
        }
        // If hovering over Left Header and near the bottom edge of a row
        else if (mouseX <= CONFIG.headerWidth && Math.abs(mouseY - bottomEdge) < CONFIG.resizeHoverMargin) {
            cursor = 'row-resize';
        }
        this.canvas.style.cursor = cursor;
    }

    private handleMouseUp(): void {
        this.isSelecting = false;

        // If we were resizing a column, record the command
        if (this.resizingCol !== -1) {
            const finalWidth = this.colModel.getColWidth(this.resizingCol);
            if (finalWidth !== this.startSize) {
                const cmd = new ResizeColumnCommand(this.colModel, this.resizingCol, this.startSize, finalWidth);
                this.cmdManager.executeCommand(cmd);
            }
            this.updateScrollbarCallback();
        }

        // If we were resizing a row, record the command
        if (this.resizingRow !== -1) {
            const finalHeight = this.rowModel.getRowHeight(this.resizingRow);
            if (finalHeight !== this.startSize) {
                const cmd = new ResizeRowCommand(this.rowModel, this.resizingRow, this.startSize, finalHeight);
                this.cmdManager.executeCommand(cmd);
            }
            this.updateScrollbarCallback();
        }

        this.resizingCol = -1;
        this.resizingRow = -1;
    }

    private handleDoubleClick(e: MouseEvent): void {
        if (e.button !== 0) {
            return;
        }
        if (Date.now() - this.lastDragTime < CONFIG.doubleClickDragTimeout) {
            return;
        }
        const { row, col, mouseX, mouseY } = this.getCellFromEvent(e);

        if (mouseX <= CONFIG.headerWidth || mouseY <= CONFIG.headerHeight) {
            return;
        }
        this.openEditor(row, col);
    }

    private handleKeyDown(e: KeyboardEvent): void {
        //if editing ,then use it normally
        if (this.editor.style.display === 'block') {
            return;
        }
        const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);

        if (!isArrowKey) { return; }

        e.preventDefault();

        let row = this.selection.hasSelection() ? this.selection.startRow : 1;
        let col = this.selection.hasSelection() ? this.selection.startCol : 1;

        if (e.key === 'ArrowUp') 
        {
            row--;
        } 
        if (e.key === 'ArrowDown')
        {
            row++;
        } 
        if (e.key === 'ArrowLeft')
        {
            col--;
        }
        if (e.key === 'ArrowRight')
        {
            col++;
        } 
        row = Math.max(1, Math.min(CONFIG.totalRows, row));
        col = Math.max(1, Math.min(CONFIG.totalCols, col));

        this.selection.setStart(row, col);

        this.scrollToCell(row, col);
        this.renderCallback();
        this.summaryCalculator.updateStats();
    }

    private scrollToCell(row: number, col: number): void 
    {
        this.viewPortManager.getVisibleRange(this.container.scrollLeft,this.container.scrollTop,this.rowModel.getRowHeight(row),this.colModel.getColWidth(col));
        // const scrollX=this.container.scrollLeft;
        // const scrollY=this.container.scrollTop;
        // const viewWidth=this.container.clientWidth;
        // const viewHeight=this.container.clientHeight;

        // const cellLeft=CONFIG.headerWidth+this.colModel.getColX(col);
        // const cellRight=cellLeft+this.colModel.getColWidth(col);4

        // if(cellLeft<scrollX+CONFIG.headerWidth)
        // {
        //     this.container.scrollLeft=cellLeft-CONFIG.headerWidth;
        // }
        // else if(cellRight>scrollX+viewWidth)
        // {
        //     this.container.scrollLeft=cellRight-viewWidth;
        // }

        // const cellTop=CONFIG.headerHeight+this.rowModel.getRowY(row);
        // const cellBottom=cellTop+this.rowModel.getRowHeight(row);
        // if(cellTop<scrollY+CONFIG.headerHeight)
        // {
        //     this.container.scrollTop=cellTop-CONFIG.headerHeight;
        // }
        // else if(cellBottom>scrollY+viewHeight)
        // {
        //     this.container.scrollTop=cellBottom-viewHeight;
        // }
    }
    private openEditor(row: number, col: number) {
        const scrollX = this.container.scrollLeft;
        const scrollY = this.container.scrollTop;

        const x = CONFIG.headerWidth + this.colModel.getColX(col);
        const y = CONFIG.headerHeight + this.rowModel.getRowY(row);
        const w = this.colModel.getColWidth(col);
        const h = this.rowModel.getRowHeight(row);
        console.log(x, y, scrollX, scrollY);
        this.editor.style.left = `${x}px`;
        this.editor.style.top = `${y}px`;
        this.editor.style.width = `${w}px`;
        this.editor.style.height = `${h}px`;
        this.editor.style.display = 'block';

        const cell = this.dataStore.getValue(row, col);
        const currentVal = cell ? cell.value : '';
        this.editor.value = currentVal.toString();
        this.editor.focus();
    }

    private commitEdit(): void {
        if (this.editor.style.display === 'none') return;

        const range = this.selection.getRange();
        const row = range.rMin;
        const col = range.cMin;

        const cell = this.dataStore.getValue(row, col);
        const oldVal = cell ? cell.value : '';
        const newVal = this.editor.value;

        // Only create a command if the text actually changed
        if (oldVal.toString() !== newVal.toString()) {
            const cmd = new EditCellCommand(this.dataStore, row, col, oldVal, newVal);
            this.cmdManager.executeCommand(cmd);
        }

        this.editor.style.display = 'none';
        this.editor.blur();

        this.renderCallback();
        this.summaryCalculator.updateStats();
    }
}
