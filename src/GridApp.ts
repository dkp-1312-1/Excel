import { CONFIG } from './Config.js';
import { DataStore } from './DataStore.js';
import { CanvasRendering } from './CanvasRendering.js';
import { SelectionManager } from './SelectionManager.js';
 
export class GridApp {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private scrollContent: HTMLElement;
    private statsEl: HTMLElement;
    
    private dataStore: DataStore;
    private renderer: CanvasRendering;
    private selection: SelectionManager;
    
    private isDragging: boolean = false;
 
    constructor() {
        this.container = document.getElementById('grid-container') as HTMLElement;
        this.canvas = document.getElementById('grid-canvas') as HTMLCanvasElement;
        this.scrollContent = document.getElementById('scroll-content') as HTMLElement;
        this.statsEl = document.getElementById('stats') as HTMLElement;
 
        this.dataStore = new DataStore();
        this.renderer = new CanvasRendering(this.canvas, this.dataStore);
        this.selection = new SelectionManager();
 
        this.init();
    }
 
    private init(): void {
        this.dataStore.generateInitialData(50000);
        this.scrollContent.style.width = `${CONFIG.headerWidth + (CONFIG.totalCols * CONFIG.colWidth)}px`;
        this.scrollContent.style.height = `${CONFIG.headerHeight + (CONFIG.totalRows * CONFIG.rowHeight)}px`;
 
        this.bindEvents();
        this.resize();
    }
 
    private bindEvents(): void {
        window.addEventListener('resize', () => this.resize());
        this.container.addEventListener('scroll', () => this.render());
 
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', () => this.isDragging = false);
    }
 
    private getCellFromEvent(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
 
        if (x > CONFIG.headerWidth && y > CONFIG.headerHeight) {
            const col = Math.floor((x - CONFIG.headerWidth + this.container.scrollLeft) / CONFIG.colWidth) + 1;
            const row = Math.floor((y - CONFIG.headerHeight + this.container.scrollTop) / CONFIG.rowHeight) + 1;
            return { row, col };
        }
        return null;
    }
 
    private handleMouseDown(e: MouseEvent): void {
        if (e.button !== 0) return;
        const cell = this.getCellFromEvent(e);
        if (cell) {
            this.selection.setStart(cell.row, cell.col);
            this.selection.setEnd(cell.row,cell.col);
            this.isDragging = true;
            this.render();
            this.updateStats();
        }
    }
 
    private handleMouseMove(e: MouseEvent): void {
        if (!this.isDragging) return;
        const cell = this.getCellFromEvent(e);
        if (cell) {
            const r = Math.max(1, Math.min(CONFIG.totalRows, cell.row));
            const c = Math.max(1, Math.min(CONFIG.totalCols, cell.col));
            this.selection.setEnd(r, c);
            this.render();
            this.updateStats();
        }
    }
 
    private updateStats(): void {
        if (!this.selection.hasSelection()) return;
 
        const range = this.selection.getRange();
        let count = 0, sum = 0, min = Infinity, max = -Infinity, hasNum = false;
 
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
            this.statsEl.innerText = `Count: ${count} | Sum: ${sum} | Avg: ${avg} | Min: ${min} | Max: ${max}`;
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
            this.selection
        );
    }
}