"use strict";
class Renderer {
    constructor(config, dataStore, rowManager, colManager, selectionManager) {
        this.headerBg = '#f3f2f1';
        this.gridLineColor = '#e1dfdd';
        this.textColor = '#323130';
        this.font = '12px Calibri, sans-serif';
        this.config = config;
        this.dataStore = dataStore;
        this.rowManager = rowManager;
        this.colManager = colManager;
        this.selectionManager = selectionManager;
        this.container = document.getElementById('grid-container');
        this.scrollContent = document.getElementById('scroll-content');
        this.canvas = document.getElementById('grid-canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.init();
    }
    init() {
        const totalHeight = this.config.totalRows * this.config.defaultRowHeight;
        const totalWidth = this.config.totalCols * this.config.defaultColWidth;
        this.scrollContent.style.height = `${totalHeight}px`;
        this.scrollContent.style.width = `${totalWidth}px`;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.container.addEventListener('scroll', () => {
            // Need to offset canvas based on scroll container scroll to keep it in view
            this.canvas.style.transform = `translate(${this.container.scrollLeft}px, ${this.container.scrollTop}px)`;
            this.render();
        });
        this.render();
    }
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        this.ctx.scale(dpr, dpr);
        this.render();
    }
    getColumnName(index) {
        let name = '';
        let temp = index;
        while (temp > 0) {
            let mod = (temp - 1) % 26;
            name = String.fromCharCode(65 + mod) + name;
            temp = Math.floor((temp - mod) / 26);
        }
        return name;
    }
    render() {
        const scrollTop = this.container.scrollTop;
        const scrollLeft = this.container.scrollLeft;
        const rect = this.container.getBoundingClientRect(); // use container rect to compute visible rows
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, rect.width, rect.height);
        const startRow = Math.max(1, Math.floor(scrollTop / this.config.defaultRowHeight) + 1);
        const endRow = Math.min(this.config.totalRows, startRow + Math.ceil(rect.height / this.config.defaultRowHeight) + 1);
        const startCol = Math.max(1, Math.floor(scrollLeft / this.config.defaultColWidth) + 1);
        const endCol = Math.min(this.config.totalCols, startCol + Math.ceil(rect.width / this.config.defaultColWidth) + 1);
        const headerRowHeight = 25;
        const headerColWidth = 50;
        this.ctx.font = this.font;
        this.ctx.textBaseline = 'middle';
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.gridLineColor;
        this.ctx.lineWidth = 1;
        let y = headerRowHeight - (scrollTop % this.config.defaultRowHeight);
        let firstRowY = y;
        // Draw horizontal lines and text
        for (let r = startRow; r <= endRow; r++) {
            const h = this.rowManager.getRowHeight(r);
            let x = headerColWidth - (scrollLeft % this.config.defaultColWidth);
            this.ctx.moveTo(headerColWidth, Math.floor(y) + 0.5);
            this.ctx.lineTo(rect.width, Math.floor(y) + 0.5);
            for (let c = startCol; c <= endCol; c++) {
                const w = this.colManager.getColWidth(c);
                const val = this.dataStore.getValue(r, c);
                if (val !== undefined && val !== '') {
                    this.ctx.fillStyle = this.textColor;
                    this.ctx.textAlign = 'left';
                    this.ctx.fillText(val.toString(), x + 5, y + h / 2);
                }
                x += w;
            }
            y += h;
        }
        // Draw vertical lines
        let xLine = headerColWidth - (scrollLeft % this.config.defaultColWidth);
        for (let c = startCol; c <= endCol + 1; c++) {
            this.ctx.moveTo(Math.floor(xLine) + 0.5, headerRowHeight);
            this.ctx.lineTo(Math.floor(xLine) + 0.5, rect.height);
            if (c <= endCol) {
                xLine += this.colManager.getColWidth(c);
            }
        }
        this.ctx.stroke();
        this.drawSelection(startRow, endRow, startCol, endCol, scrollTop, scrollLeft, headerRowHeight, headerColWidth);
        // Draw Headers background
        this.ctx.fillStyle = this.headerBg;
        this.ctx.fillRect(0, 0, rect.width, headerRowHeight); // top header
        this.ctx.fillRect(0, 0, headerColWidth, rect.height); // left header
        // Draw headers borders and text
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#c8c6c4';
        this.ctx.fillStyle = this.textColor;
        this.ctx.textAlign = 'center';
        let xHeader = headerColWidth - (scrollLeft % this.config.defaultColWidth);
        for (let c = startCol; c <= endCol; c++) {
            const w = this.colManager.getColWidth(c);
            this.ctx.moveTo(Math.floor(xHeader) + 0.5, 0);
            this.ctx.lineTo(Math.floor(xHeader) + 0.5, headerRowHeight);
            this.ctx.fillText(this.getColumnName(c), xHeader + w / 2, headerRowHeight / 2);
            xHeader += w;
        }
        this.ctx.moveTo(0, Math.floor(headerRowHeight) + 0.5);
        this.ctx.lineTo(rect.width, Math.floor(headerRowHeight) + 0.5);
        let yHeader = firstRowY;
        for (let r = startRow; r <= endRow; r++) {
            const h = this.rowManager.getRowHeight(r);
            this.ctx.moveTo(0, Math.floor(yHeader) + 0.5);
            this.ctx.lineTo(headerColWidth, Math.floor(yHeader) + 0.5);
            this.ctx.fillText(r.toString(), headerColWidth / 2, yHeader + h / 2);
            yHeader += h;
        }
        this.ctx.moveTo(Math.floor(headerColWidth) + 0.5, 0);
        this.ctx.lineTo(Math.floor(headerColWidth) + 0.5, rect.height);
        this.ctx.stroke();
        // Corner cell
        this.ctx.fillStyle = '#e1dfdd';
        this.ctx.fillRect(0, 0, headerColWidth, headerRowHeight);
        this.ctx.strokeRect(0.5, 0.5, headerColWidth, headerRowHeight);
        // Active header highlights
        const range = this.selectionManager.getSelectedRange();
        if (range.rMin > 0) {
            this.ctx.fillStyle = '#caeaeb'; // highlight col/row headers
            // Highlight row headers
            let ry = firstRowY;
            for (let r = startRow; r <= endRow; r++) {
                const h = this.rowManager.getRowHeight(r);
                if (r >= range.rMin && r <= range.rMax) {
                    this.ctx.fillRect(0, ry, headerColWidth - 1, h);
                    this.ctx.fillStyle = this.textColor;
                    this.ctx.fillText(r.toString(), headerColWidth / 2, ry + h / 2);
                    this.ctx.fillStyle = '#caeaeb';
                }
                ry += h;
            }
            // Highlight col headers
            let cx = headerColWidth - (scrollLeft % this.config.defaultColWidth);
            for (let c = startCol; c <= endCol; c++) {
                const w = this.colManager.getColWidth(c);
                if (c >= range.cMin && c <= range.cMax) {
                    this.ctx.fillRect(cx, 0, w, headerRowHeight - 1);
                    this.ctx.fillStyle = this.textColor;
                    this.ctx.fillText(this.getColumnName(c), cx + w / 2, headerRowHeight / 2);
                    this.ctx.fillStyle = '#caeaeb';
                }
                cx += w;
            }
        }
    }
    drawSelection(sRow, eRow, sCol, eCol, scrollTop, scrollLeft, headerRowHeight, headerColWidth) {
        const range = this.selectionManager.getSelectedRange();
        if (range.rMin === 0)
            return;
        let selX = headerColWidth - scrollLeft;
        for (let c = 1; c < range.cMin; c++)
            selX += this.colManager.getColWidth(c);
        let selY = headerRowHeight - scrollTop;
        for (let r = 1; r < range.rMin; r++)
            selY += this.rowManager.getRowHeight(r);
        let selWidth = 0;
        for (let c = range.cMin; c <= range.cMax; c++)
            selWidth += this.colManager.getColWidth(c);
        let selHeight = 0;
        for (let r = range.rMin; r <= range.rMax; r++)
            selHeight += this.rowManager.getRowHeight(r);
        this.ctx.fillStyle = 'rgba(33, 115, 70, 0.1)';
        this.ctx.fillRect(selX, selY, selWidth, selHeight);
        this.ctx.strokeStyle = '#217346';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(Math.floor(selX) + 0.5, Math.floor(selY) + 0.5, selWidth, selHeight);
    }
}
class InputHandler {
    constructor(config, rowManager, colManager, selectionManager, renderer) {
        this.isDragging = false;
        this.anchorRow = 1;
        this.anchorCol = 1;
        this.config = config;
        this.rowManager = rowManager;
        this.colManager = colManager;
        this.selectionManager = selectionManager;
        this.renderer = renderer;
        this.canvas = document.getElementById('grid-canvas');
        this.container = document.getElementById('grid-container');
        this.init();
    }
    init() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
    }
    getCellFromMouse(e) {
        const rect = this.container.getBoundingClientRect();
        // Since canvas translates, the mouse position relative to the container 
        // corresponds directly to the screen coords. Wait, if canvas is translated,
        // it acts as a sticky element. So x, y from container bounding box is fine.
        const mouseX = e.clientX - rect.left + this.container.scrollLeft;
        const mouseY = e.clientY - rect.top + this.container.scrollTop;
        const headerRowHeight = 25;
        const headerColWidth = 50;
        let col = 1;
        let cx = headerColWidth;
        while (col <= this.config.totalCols) {
            const w = this.colManager.getColWidth(col);
            if (mouseX >= cx && mouseX < cx + w)
                break;
            cx += w;
            col++;
        }
        let row = 1;
        let cy = headerRowHeight;
        while (row <= this.config.totalRows) {
            const h = this.rowManager.getRowHeight(row);
            if (mouseY >= cy && mouseY < cy + h)
                break;
            cy += h;
            row++;
        }
        return {
            row: Math.min(row, this.config.totalRows),
            col: Math.min(col, this.config.totalCols)
        };
    }
    onMouseDown(e) {
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Ensure clicking inside the grid area (not on headers for now)
        if (x > 50 && y > 25) {
            const { row, col } = this.getCellFromMouse(e);
            this.anchorRow = row;
            this.anchorCol = col;
            this.selectionManager.setSelection(row, col, row, col);
            this.isDragging = true;
            this.renderer.render();
        }
    }
    onMouseMove(e) {
        if (!this.isDragging)
            return;
        const { row, col } = this.getCellFromMouse(e);
        this.selectionManager.setSelection(this.anchorRow, this.anchorCol, row, col);
        this.renderer.render();
    }
    onMouseUp(e) {
        this.isDragging = false;
    }
}
// Phase 0: Project Setup & Architecture (architecture.ts)
// ==========================================
// 1. CONFIGURATION & INTERFACES
// ==========================================
// ==========================================
// 2. ROW & COLUMN MANAGERS
// Handles custom resizing of rows and columns
// ==========================================
class RowManager {
    constructor(defaultHeight) {
        this.defaultHeight = defaultHeight;
        this.customHeight = new Map();
    }
    getRowHeight(row) {
        var _a;
        return (_a = this.customHeight.get(row)) !== null && _a !== void 0 ? _a : this.defaultHeight;
    }
    setRowHeight(row, height) {
        this.customHeight.set(row, height);
    }
}
class ColumnManager {
    constructor(defaultWidth) {
        this.defaultWidth = defaultWidth;
        this.customWidths = new Map();
    }
    getColWidth(col) {
        var _a;
        return (_a = this.customWidths.get(col)) !== null && _a !== void 0 ? _a : this.defaultWidth;
    }
    setColWidth(col, width) {
        this.customWidths.set(col, width);
    }
}
// ==========================================
// 3. DATA STORE (The Model)
// Uses a Sparse Matrix to optimize memory usage
// ==========================================
class DataStore {
    constructor() {
        //Key format: "row,col" -> Value
        this.data = new Map();
    }
    /**
     * Requirement: Generate 50,000 records with different values
     * and load them into our sparse matrix.
     */
    generateInitialData(recordCount) {
        //Set Headers (Row 0)
        this.setValue(0, 1, 'ID');
        this.setValue(0, 2, 'First Name');
        this.setValue(0, 3, 'Last Name');
        this.setValue(0, 4, 'age');
        this.setValue(0, 5, 'salary');
        for (let r = 1; r <= recordCount; r++) {
            const record = {
                id: r,
                firstName: `Raji${r}`,
                lastName: `Solanki${r}`,
                age: Math.floor(Math.random() * 40) + 20,
                salary: Math.floor(Math.random() * 900000) + 100000
            };
            this.setValue(r, 1, record.id);
            this.setValue(r, 2, record.firstName);
            this.setValue(r, 3, record.lastName);
            this.setValue(r, 4, record.age);
            this.setValue(r, 5, record.salary);
        }
        console.log(`Successfully loaded ${recordCount} records into DataStore.`);
    }
    getValue(row, col) {
        var _a;
        return (_a = this.data.get(`${row},${col}`)) !== null && _a !== void 0 ? _a : '';
    }
    setValue(row, col, value) {
        this.data.set(`${row},${col}`, value);
    }
}
// ==========================================
// 4. SELECTION MANAGER
// Tracks active cell and selected ranges
// ==========================================
class SelectionManager {
    constructor() {
        this.startRow = 1;
        this.startCol = 1;
        this.endRow = 1;
        this.endCol = 1;
    }
    setSelection(startRow, startCol, endRow, endCol) {
        this.startRow = startRow;
        this.startCol = startCol;
        this.endRow = endRow;
        this.endCol = endCol;
    }
    getSelectedRange() {
        return {
            rMin: Math.min(this.startRow, this.endRow),
            rMax: Math.max(this.startRow, this.endRow),
            cMin: Math.min(this.startCol, this.endCol),
            cMax: Math.max(this.startCol, this.endCol)
        };
    }
}
class CommandManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }
    executeCommand(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
    }
}
// ==========================================
// 6. MAIN GRID CONTROLLER (Bootstrapper)
// ==========================================
class GridApp {
    constructor(config) {
        this.config = config;
        this.dataStore = new DataStore();
        this.rowManager = new RowManager(this.config.defaultRowHeight);
        this.colManager = new ColumnManager(this.config.defaultColWidth);
        this.selectionManager = new SelectionManager();
        this.commandManager = new CommandManager();
        this.init();
    }
    init() {
        this.dataStore.generateInitialData(50000);
    }
    setupUI() {
        this.renderer = new Renderer(this.config, this.dataStore, this.rowManager, this.colManager, this.selectionManager);
        this.inputHandler = new InputHandler(this.config, this.rowManager, this.colManager, this.selectionManager, this.renderer);
    }
}
const appConfig = {
    totalRows: 100000,
    totalCols: 500,
    defaultRowHeight: 25,
    defaultColWidth: 100
};
const myExcelGrid = new GridApp(appConfig);
window.onload = () => {
    myExcelGrid.setupUI();
};
//# sourceMappingURL=app.js.map