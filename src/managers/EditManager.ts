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
import type { GridContext } from '../handlers/PointerHandler.js';
import { PointerHandler} from '../handlers/PointerHandler.js';
import { CellSelectionHandler } from '../handlers/CellSelectionHandler.js';
import { ColumnSelectionHandler } from '../handlers/ColumnSelectionHandler.js';
import { ResizingHandler } from '../handlers/ResizingHandler.js';
import { RowSelectionHandler } from '../handlers/RowSelectionHandler.js';

export class EditManager {
    private lastpointerDownX: number = 0;
    private lastpointerDownY: number = 0;
    private lastDragTime: number = 0;

    private activeHandler: PointerHandler | null = null;
    private handlers: PointerHandler[] = [];

    private editor!: HTMLInputElement;
    private boundBlur: (e: Event) => void;
    private boundEditorKeyDown: (e: KeyboardEvent) => void;
    private boundScroll: (e: Event) => void;
    private boundpointerDown: (e: PointerEvent) => void;
    private boundpointerMove: (e: PointerEvent) => void;
    private boundpointerUp: (e: PointerEvent) => void;
    private boundpointerCancel: (e: PointerEvent) => void;
    private boundDblClick: (e: MouseEvent) => void;
    private boundWindowKeyDown: (e: KeyboardEvent) => void;
    constructor(
        private container: HTMLElement,
        private canvas: HTMLCanvasElement,
        private rowModel: RowModel,
        private colModel: ColumnModel,
        private selection: SelectionManager,
        private summaryCalculator: SummaryCalculator,
        private dataStore: GridDataStore,
        private cmdManager: CommandManager,
        private viewPortManager: ViewportManager,
        private renderCallback: () => void,
        private updateScrollbarCallback: () => void
    ) {
        this.boundBlur = () => this.commitEdit();
        this.boundEditorKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                this.editor.style.display = 'none';
                this.editor.blur();
            }
        };
        this.boundScroll = () => {
            if (this.editor.style.display === 'block') {
                this.commitEdit();
            }
        };
        this.boundpointerDown = (e: PointerEvent) => this.handlepointerDown(e);
        this.boundpointerMove = (e: PointerEvent) => this.handlepointerMove(e);
        this.boundpointerUp = (e: PointerEvent) => this.handlepointerUp(e);
        this.boundpointerCancel = (e: PointerEvent) => this.handlepointerUp(e);
        this.boundDblClick = (e: MouseEvent) => this.handleDoubleClick(e);
        this.boundWindowKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);

        this.createEditor();
        this.initializeHandlers();
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

        this.editor.addEventListener('blur', this.boundBlur);
        this.editor.addEventListener('keydown', this.boundEditorKeyDown);

        this.container.addEventListener('scroll', this.boundScroll)
    }

    private initializeHandlers():void
    {
        const context: GridContext = {
            rowModel: this.rowModel,
            colModel: this.colModel,
            selection: this.selection,
            summaryCalculator: this.summaryCalculator,
            cmdManager: this.cmdManager,
            renderCallback: this.renderCallback,
            updateScrollbarCallback: this.updateScrollbarCallback,
            scrollToCell: (row:number, col:number) => this.scrollToCell(row, col)
        };

        this.handlers = [
            new ResizingHandler(context),
            new ColumnSelectionHandler(context),
            new RowSelectionHandler(context),
            new CellSelectionHandler(context)
        ];
    }
    public bindEvents(): void {
        this.canvas.addEventListener('pointerdown', this.boundpointerDown);
        this.canvas.addEventListener('pointermove', this.boundpointerMove);
        window.addEventListener('pointerup', this.boundpointerUp);
        this.canvas.addEventListener('pointercancel', this.boundpointerCancel);

        this.canvas.addEventListener('dblclick', this.boundDblClick);

        window.addEventListener('keydown', this.boundWindowKeyDown);
    }

    public unbindEvents(): void {
        this.editor.removeEventListener('blur', this.boundBlur);
        this.editor.removeEventListener('keydown', this.boundEditorKeyDown);
        this.container.removeEventListener('scroll', this.boundScroll);

        this.canvas.removeEventListener('pointerdown', this.boundpointerDown);
        this.canvas.removeEventListener('pointermove', this.boundpointerMove);
        window.removeEventListener('pointerup', this.boundpointerUp);
        this.canvas.removeEventListener('dblclick', this.boundDblClick);
        window.removeEventListener('keydown', this.boundWindowKeyDown);
    }

    private getCellFromEvent(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const pointerX = e.clientX - rect.left;
        const pointerY = e.clientY - rect.top;

        const scrollX = this.container.scrollLeft;
        const scrollY = this.container.scrollTop;

        // Calculate absolute grid coordinates
        const targetX = pointerX - CONFIG.headerWidth + scrollX;
        const targetY = pointerY - CONFIG.headerHeight + scrollY;

        let col: number = 1;
        while (this.colModel.getColX(col) + this.colModel.getColWidth(col) <= targetX && col < CONFIG.totalCols) {
            col++;
        }

        let row: number = 1;
        while (this.rowModel.getRowY(row) + this.rowModel.getRowHeight(row) <= targetY && row < CONFIG.totalRows) {
            row++;
        }
        return { row, col, pointerX, pointerY };
    }

    private handlepointerDown(e: PointerEvent): void {
        if (e.button !== 0) return;

        this.canvas.setPointerCapture(e.pointerId);

        this.lastpointerDownX = e.clientX;
        this.lastpointerDownY = e.clientY;

        if (this.editor.style.display === 'block') {
            this.commitEdit();
        }

        const data = this.getCellFromEvent(e);
        const currentCursor = this.canvas.style.cursor;
 
        // Iterate through handlers. The first one to return `true` becomes active.
        for (const handler of this.handlers) {
            if (handler.onPointerDown(e, data, currentCursor)) {
                this.activeHandler = handler;
                break;
            }
        }
    }

    private handlepointerMove(e: PointerEvent): void {
        const data = this.getCellFromEvent(e);

         // Track drag time for double click logic
        if (this.activeHandler) {
            if (Math.abs(e.clientX - this.lastpointerDownX) > CONFIG.dragThreshold || Math.abs(e.clientY - this.lastpointerDownY) > CONFIG.dragThreshold) {
                this.lastDragTime = Date.now();
            }
            // Delegate the move event to the active handler
            this.activeHandler.onPointerMove(e, data);
            return; 
        }

         // Hover logic (Determine boundary cursors when NO handler is active)
        let cursor: string = 'cell';
        const scrollX = this.container.scrollLeft;
        const scrollY = this.container.scrollTop;
 
        const rightEdge = CONFIG.headerWidth + this.colModel.getColX(data.col) + this.colModel.getColWidth(data.col) - scrollX;
        const bottomEdge = CONFIG.headerHeight + this.rowModel.getRowY(data.row) + this.rowModel.getRowHeight(data.row) - scrollY;

        if (data.pointerY <= CONFIG.headerHeight && Math.abs(data.pointerX - rightEdge) < CONFIG.resizeHoverMargin) {
            cursor = 'col-resize';
        } else if (data.pointerX <= CONFIG.headerWidth && Math.abs(data.pointerY - bottomEdge) < CONFIG.resizeHoverMargin) {
            cursor = 'row-resize';
        }
        this.canvas.style.cursor = cursor;
    }

    private handlepointerUp(e: PointerEvent): void {
        if (this.canvas.hasPointerCapture(e.pointerId)) {
            this.canvas.releasePointerCapture(e.pointerId);
        }
 
        if (this.activeHandler) {
            this.activeHandler.onPointerUp(e);
            this.activeHandler = null; // Reset for the next click
        }
    }

    private handleDoubleClick(e: MouseEvent): void {
        if (e.button !== 0) {
            return;
        }
        if (Date.now() - this.lastDragTime < CONFIG.doubleClickDragTimeout) {
            return;
        }
        const { row, col, pointerX, pointerY } = this.getCellFromEvent(e);

        if (pointerX <= CONFIG.headerWidth || pointerY <= CONFIG.headerHeight) {
            return;
        }
        this.openEditor(row, col);
    }

    private handleKeyDown(e: KeyboardEvent): void {
        //if editing ,then use it normally
        if (this.editor.style.display === 'block') {
            if (e.key === 'Enter' || e.key === CONFIG.commitKey) {
                e.preventDefault();
                this.commitEdit();

                // Hide the editor / return it to normal state
                this.editor.style.display = 'none';
            }
            return;
        }   
        if (e.key === 'Enter' || e.key === CONFIG.commitKey) {
            e.preventDefault();

            if (this.selection.hasSelection()) {
                this.openEditor(this.selection.startRow, this.selection.startCol);
            }
            return;
        }

        const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);

        if (!isArrowKey) { return; }

        e.preventDefault();

        let row = this.selection.hasSelection() ? this.selection.startRow : 1;
        let col = this.selection.hasSelection() ? this.selection.startCol : 1;

        if (e.key === 'ArrowUp') {
            row--;
        }
        if (e.key === 'ArrowDown') {
            row++;
        }
        if (e.key === 'ArrowLeft') {
            col--;
        }
        if (e.key === 'ArrowRight') {
            col++;
        }
        row = Math.max(1, Math.min(CONFIG.totalRows, row));
        col = Math.max(1, Math.min(CONFIG.totalCols, col));
        this.commitEdit();
        this.selection.setStart(row, col);

        this.scrollToCell(row, col);
        this.renderCallback();
        this.summaryCalculator.updateStats();
    }

    private scrollToCell(row: number, col: number): void {
        const scrollX = this.container.scrollLeft;
        const scrollY = this.container.scrollTop;
        const viewWidth = this.container.clientWidth;
        const viewHeight = this.container.clientHeight;

        const { startRow, endRow, startCol, endCol } = this.viewPortManager.getVisibleRange(scrollX, scrollY, viewWidth, viewHeight);

        if (col <= startCol) {
            this.container.scrollLeft = this.colModel.getColX(col);
        } else if (col >= endCol-2) {
            this.container.scrollLeft = CONFIG.headerWidth + this.colModel.getColX(col) + this.colModel.getColWidth(col) - viewWidth;
        }

        if (row <= startRow) {
            this.container.scrollTop = this.rowModel.getRowY(row);
        } else if (row >= endRow-2) {
            this.container.scrollTop = CONFIG.headerHeight + this.rowModel.getRowY(row) + this.rowModel.getRowHeight(row) - viewHeight;
        }
    }
    private openEditor(row: number, col: number) {
        const scrollX = this.container.scrollLeft;
        const scrollY = this.container.scrollTop;

        const x = CONFIG.headerWidth + this.colModel.getColX(col);
        const y = CONFIG.headerHeight + this.rowModel.getRowY(row);
        const w = this.colModel.getColWidth(col);
        const h = this.rowModel.getRowHeight(row);
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
