import { CONFIG } from '../config/Config.js';
import { GridDataStore } from '../models/GridDataStore.js';
import { GridRenderer } from './GridRenderer.js';
import { SelectionManager } from '../managers/SelectionManager.js';
import { RowModel } from '../models/RowModel.js';
import { ColumnModel } from '../models/ColumnModel.js';
import { ViewportManager } from '../managers/ViewportManager.js';
import { SummaryCalculator } from './SummaryCalculator.js';
import { EditManager } from '../managers/EditManager.js';
import { CommandManager } from '../managers/CommandManager.js';
import { JsonDataLoader } from '../data/JsonDataLoader.js';

export class Grid {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private scrollContent: HTMLElement;
    private statsEl: HTMLElement;

    private cmdManager: CommandManager;
    
    private dataStore: GridDataStore;
    private renderer: GridRenderer;
    private selection: SelectionManager;
    private rowModel: RowModel;
    private colModel: ColumnModel;
    private viewportManager: ViewportManager;
    private summaryCalculator: SummaryCalculator;
    private editManager: EditManager;

    private isRenderPending: boolean = false;

    constructor() {
        this.container = document.getElementById('grid-container') as HTMLElement;
        this.canvas = document.getElementById('grid-canvas') as HTMLCanvasElement;
        this.scrollContent = document.getElementById('scroll-content') as HTMLElement;
        this.statsEl = document.getElementById('stats') as HTMLElement;

        this.cmdManager = new CommandManager();
        this.dataStore = new GridDataStore();
        this.renderer = new GridRenderer(this.canvas, this.dataStore);
        this.selection = new SelectionManager();
        this.rowModel = new RowModel();
        this.colModel = new ColumnModel();
        this.viewportManager = new ViewportManager(this.rowModel, this.colModel);
        this.summaryCalculator = new SummaryCalculator(this.statsEl, this.dataStore, this.selection);
        this.editManager = new EditManager(
            this.container, this.canvas, this.rowModel, this.colModel, this.selection, this.summaryCalculator, this.dataStore, this.cmdManager, () => this.render(), () => this.updateScrollbarSize()
        );
        
        this.init();
    }
 
    private async init(): Promise<void> {
        const dataLoader = new JsonDataLoader();
        await dataLoader.loadJSON('data.json', this.dataStore);
        this.updateScrollbarSize();
        
        this.editManager.bindEvents();
        window.addEventListener('resize', () => this.resize());
        this.container.addEventListener('scroll', () => this.render());
        
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (this.cmdManager.undo()) {
                    this.render();
                    this.updateScrollbarSize();
                    this.summaryCalculator.updateStats();
                }
            }
            if (e.ctrlKey && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                if (this.cmdManager.redo()) {
                    this.render();
                    this.updateScrollbarSize();
                    this.summaryCalculator.updateStats();
                }
            }
        });

        this.resize();
    }

    private updateScrollbarSize(): void {
        this.scrollContent.style.width = `${CONFIG.headerWidth + this.colModel.getColX(CONFIG.totalCols) + this.colModel.getColWidth(CONFIG.totalCols)}px`;
        this.scrollContent.style.height = `${CONFIG.headerHeight + this.rowModel.getRowY(CONFIG.totalRows) + this.rowModel.getRowHeight(CONFIG.totalRows)}px`;
    }
 
    private resize(): void {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.render();
    }
 
    private render(): void {

        if(this.isRenderPending) return;

        //make flag true when executing render
        this.isRenderPending=true;

        requestAnimationFrame(()=>{
            this.executeRender();
            //make flag true after executing render
            this.isRenderPending=false;
        })
        
    }
    private executeRender(): void
    {
        this.renderer.drawSelection(
            this.container.scrollLeft,
            this.container.scrollTop,
            this.canvas.width,
            this.canvas.height,
            this.selection,
            this.rowModel,
            this.colModel,
            this.viewportManager
        );
    }
}