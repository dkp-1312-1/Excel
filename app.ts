const CONFIG = {
    totalRows: 100000,
    totalCols: 500,
    rowHeight: 25,
    colWidth: 100,
    headerWidth: 50,
    headerHeight: 25,
    font: '14px "Segoe UI", sans-serif',
    headerBg: '#f3f2f1',
    gridColor: '#e1dfdd',
    textColor: '#000000'
};
// --- DATA STORE ---
class DataStore {
    private data: Map<string, string | number> = new Map();
 
    public generateInitialData(count: number): void {
        this.setValue(0, 1, 'ID');
        this.setValue(0, 2, 'First Name');
        this.setValue(0, 3, 'Last Name');
        this.setValue(0, 4, 'Age');
        this.setValue(0, 5, 'Salary');
 
        for (let r = 1; r <= count; r++) {
            this.setValue(r, 1, r);
            this.setValue(r, 2, `Raj${r}`);
            this.setValue(r, 3, `Solanki${r}`);
            this.setValue(r, 4, Math.floor(Math.random() * 40) + 20);
            this.setValue(r, 5, Math.floor(Math.random() * 900000) + 100000);
        }
    }
 
    public getValue(row: number, col: number): string | number {
        return this.data.get(`${row},${col}`) ?? '';
    }
 
    public setValue(row: number, col: number, value: string | number): void {
        this.data.set(`${row},${col}`, value);
    }
}
 
// --- RENDERER ---
class CanvasRenderer {
    private ctx: CanvasRenderingContext2D;
 
    constructor(private canvas: HTMLCanvasElement, private dataStore: DataStore) {
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    }
 
    private getColLetter(col: number): string {
        let name = '';
        while (col > 0) {
            let rem = (col - 1) % 26;
            name = String.fromCharCode(65 + rem) + name;
            col = Math.floor((col - 1) / 26);
        }
        return name;
    }
 
    public draw(scrollX: number, scrollY: number, width: number, height: number): void {
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.translate(0.5, 0.5); // For crisp lines
 
        // Calculate visible area
        const startCol = Math.max(1, Math.floor(scrollX / CONFIG.colWidth) + 1);
        const endCol = Math.min(CONFIG.totalCols, startCol + Math.ceil(width / CONFIG.colWidth) + 1);
        const startRow = Math.max(1, Math.floor(scrollY / CONFIG.rowHeight) + 1);
        const endRow = Math.min(CONFIG.totalRows, startRow + Math.ceil(height / CONFIG.rowHeight) + 1);
 
        this.ctx.font = CONFIG.font;
        this.ctx.textBaseline = 'middle';
 
        // 1. Draw Cells
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const x = CONFIG.headerWidth + ((c - 1) * CONFIG.colWidth) - scrollX;
                const y = CONFIG.headerHeight + ((r - 1) * CONFIG.rowHeight) - scrollY;
 
                this.ctx.strokeStyle = CONFIG.gridColor;
                this.ctx.strokeRect(x, y, CONFIG.colWidth, CONFIG.rowHeight);
 
                const val = this.dataStore.getValue(r, c);
                if (val !== '') {
                    this.ctx.fillStyle = CONFIG.textColor;
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.rect(x, y, CONFIG.colWidth, CONFIG.rowHeight);
                    this.ctx.clip();
                    this.ctx.fillText(val.toString(), x + 6, y + (CONFIG.rowHeight / 2));
                    this.ctx.restore();
                }
            }
        }
 
        // 2. Draw Top Headers
        this.ctx.fillStyle = CONFIG.headerBg;
        this.ctx.fillRect(CONFIG.headerWidth, 0, width, CONFIG.headerHeight);
        for (let c = startCol; c <= endCol; c++) {
            const x = CONFIG.headerWidth + ((c - 1) * CONFIG.colWidth) - scrollX;
            this.ctx.strokeStyle = '#ccc';
            this.ctx.strokeRect(x, 0, CONFIG.colWidth, CONFIG.headerHeight);
            this.ctx.fillStyle = CONFIG.textColor;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.getColLetter(c), x + (CONFIG.colWidth / 2), CONFIG.headerHeight / 2);
            this.ctx.textAlign = 'left';
        }
 
        // 3. Draw Left Headers
        this.ctx.fillStyle = CONFIG.headerBg;
        this.ctx.fillRect(0, CONFIG.headerHeight, CONFIG.headerWidth, height);
        for (let r = startRow; r <= endRow; r++) {
            const y = CONFIG.headerHeight + ((r - 1) * CONFIG.rowHeight) - scrollY;
            this.ctx.strokeStyle = '#ccc';
            this.ctx.strokeRect(0, y, CONFIG.headerWidth, CONFIG.rowHeight);
            this.ctx.fillStyle = CONFIG.textColor;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(r.toString(), CONFIG.headerWidth / 2, y + (CONFIG.rowHeight / 2));
            this.ctx.textAlign = 'left';
        }
 
        // 4. Corner Block
        this.ctx.fillStyle = CONFIG.headerBg;
        this.ctx.fillRect(0, 0, CONFIG.headerWidth, CONFIG.headerHeight);
        this.ctx.strokeRect(0, 0, CONFIG.headerWidth, CONFIG.headerHeight);
 
        this.ctx.translate(-0.5, -0.5);
    }
}
 
// --- MAIN APP CONTROLLER ---
class GridApp {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private scrollContent: HTMLElement;
    private dataStore: DataStore;
    private renderer: CanvasRenderer;
 
    constructor() {
        this.container = document.getElementById('grid-container') as HTMLElement;
        this.canvas = document.getElementById('grid-canvas') as HTMLCanvasElement;
        this.scrollContent = document.getElementById('scroll-content') as HTMLElement;
        
        this.dataStore = new DataStore();
        this.renderer = new CanvasRenderer(this.canvas, this.dataStore);
 
        this.init();
    }
 
    private init(): void {
        this.dataStore.generateInitialData(50000);
 
        // Trick the browser into creating huge scrollbars
        this.scrollContent.style.width = `${CONFIG.headerWidth + (CONFIG.totalCols * CONFIG.colWidth)}px`;
        this.scrollContent.style.height = `${CONFIG.headerHeight + (CONFIG.totalRows * CONFIG.rowHeight)}px`;
 
        window.addEventListener('resize', () => this.resize());
        this.container.addEventListener('scroll', () => this.render());
 
        this.resize();
    }
 
    private resize(): void {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.render();
    }
 
    private render(): void {
        this.renderer.draw(
            this.container.scrollLeft,
            this.container.scrollTop,
            this.canvas.width,
            this.canvas.height
        );
    }
}
 console.log("0");
 document.addEventListener('DOMContentLoaded',()=>{
new GridApp();
 })
