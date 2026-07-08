// Phase 0: Project Setup & Architecture (architecture.ts)
// ==========================================
// 1. CONFIGURATION & INTERFACES
// ==========================================

interface GridConfig {
    totalRows: number;
    totalCols: number;
    defaultRowHeight: number;
    defaultColWidth: number;
}
interface CellRecord {
    id: number;
    firstName: string;
    lastName: string;
    age: number,
    salary: number;
}

// ==========================================
// 2. ROW & COLUMN MANAGERS
// Handles custom resizing of rows and columns
// ==========================================

class RowManager {
    private customHeight: Map<number, number> = new Map();
    constructor(private defaultHeight: number) { }

    public getRowHeight(row: number): number {
        return this.customHeight.get(row) ?? this.defaultHeight;
    }
    public setRowHeight(row: number, height: number): void {
        this.customHeight.set(row, height);
    }
}
class ColumnManager {
    private customWidths: Map<number, number> = new Map();

    constructor(private defaultWidth: number) { }
    public getColWidth(col: number): number {
        return this.customWidths.get(col) ?? this.defaultWidth;
    }
    public setColWidth(col: number, width: number): void {
        this.customWidths.set(col, width);
    }
}


// ==========================================
// 3. DATA STORE (The Model)
// Uses a Sparse Matrix to optimize memory usage
// ==========================================

class DataStore {
    //Key format: "row,col" -> Value
    private data: Map<string, string | number> = new Map();
    /**
     * Requirement: Generate 50,000 records with different values
     * and load them into our sparse matrix.
     */
    public generateInitialData(recordCount: number): void {
        //Set Headers (Row 0)
        this.setValue(0, 1, 'ID');
        this.setValue(0, 2, 'First Name');
        this.setValue(0, 3, 'Last Name');
        this.setValue(0, 4, 'age');
        this.setValue(0, 5, 'salary');

        for (let r = 1; r <= recordCount; r++) {
            const record: CellRecord = {
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
    public getValue(row: number, col: number): String | number {
        return this.data.get(`${row},${col}`) ?? '';
    }
    public setValue(row: number, col: number, value: string | number): void {
        this.data.set(`${row},${col}`, value);
    }
}

// ==========================================
// 4. SELECTION MANAGER
// Tracks active cell and selected ranges
// ==========================================

class SelectionManager {
    private startRow: number = 1;
    private startCol: number = 1;
    private endRow: number = 1;
    private endCol: number = 1;

    public setSelection(startRow: number, startCol: number, endRow: number, endCol: number): void {
        this.startRow = startRow;
        this.startCol = startCol;
        this.endRow = endRow;
        this.endCol = endCol;
    }
    public getSelectedRange() {
        return {
            rMin: Math.min(this.startRow, this.endRow),
            rMax: Math.max(this.startRow, this.endRow),
            cMin: Math.min(this.startCol, this.endCol),
            cMax: Math.max(this.startCol, this.endCol)
        };
    }
}


// ==========================================
// 5. COMMAND PATTERN (For Undo/Redo)
// 

interface Command {
    execute(): void;
    undo(): void;
}

class CommandManager {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];

    public executeCommand(command: Command): void {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
    }
}


// ==========================================
// 6. MAIN GRID CONTROLLER (Bootstrapper)
// ==========================================

class GridApp {
    public config: GridConfig;
    public dataStore: DataStore;
    public rowManager: RowManager;
    public colManager: ColumnManager;
    public selectionManager: SelectionManager;
    public commandManager: CommandManager;
    
    public renderer!: Renderer;
    public inputHandler!: InputHandler;

    constructor(config: GridConfig) {
        this.config = config;

        this.dataStore = new DataStore();
        this.rowManager = new RowManager(this.config.defaultRowHeight);
        this.colManager = new ColumnManager(this.config.defaultColWidth);
        this.selectionManager = new SelectionManager();
        this.commandManager = new CommandManager();
        this.init();
    }
    private init(): void {
        this.dataStore.generateInitialData(50000);
    }
    
    public setupUI(): void {
        this.renderer = new Renderer(this.config, this.dataStore, this.rowManager, this.colManager, this.selectionManager);
        this.inputHandler = new InputHandler(this.config, this.rowManager, this.colManager, this.selectionManager, this.renderer);
    }
}
const appConfig:GridConfig={
    totalRows:100000,
    totalCols:500,
    defaultRowHeight:25,
    defaultColWidth:100
};
const myExcelGrid=new GridApp(appConfig);
window.onload = () => {
    myExcelGrid.setupUI();
};
