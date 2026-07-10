import { CONFIG } from './Config.js';
import { DataStore } from './DataStore.js';
import { CanvasRendering } from './CanvasRendering.js';
import { SelectionManager } from './SelectionManager.js';
import { DimensionManager } from './DimensionManager.js';
import { StatsManager } from './StatsManager.js';
import { InputManager } from './InputManager.js';

export class GridApp {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private scrollContent: HTMLElement;
    private statsEl: HTMLElement;
    
    private dataStore: DataStore;
    private renderer: CanvasRendering;
    private selection: SelectionManager;
    private dimensionManager: DimensionManager;
    private statsManager: StatsManager;
    private inputManager: InputManager;

    private isRenderPending:boolean=false;
    constructor() {
        this.container = document.getElementById('grid-container') as HTMLElement;
        this.canvas = document.getElementById('grid-canvas') as HTMLCanvasElement;
        this.scrollContent = document.getElementById('scroll-content') as HTMLElement;
        this.statsEl = document.getElementById('stats') as HTMLElement;
 
        this.dataStore = new DataStore();
        this.renderer = new CanvasRendering(this.canvas, this.dataStore);
        this.selection = new SelectionManager();
        this.dimensionManager = new DimensionManager();
        this.statsManager = new StatsManager(this.statsEl, this.dataStore, this.selection);
        this.inputManager = new InputManager(
            this.container,this.canvas,this.dimensionManager,this.selection,this.statsManager,this.dataStore,() => this.render(),() => this.updateScrollbarSize()
        );
        
        this.init();
    }
 
    private init(): void {
        this.dataStore.generateInitialData(50000);
        this.updateScrollbarSize();
        
        this.inputManager.bindEvents();
        window.addEventListener('resize', () => this.resize());
        this.container.addEventListener('scroll', () => this.render());
        
        this.resize();
    }

    private updateScrollbarSize(): void {
        this.scrollContent.style.width = `${CONFIG.headerWidth + this.dimensionManager.getColX(CONFIG.totalCols)+this.dimensionManager.getColWidth(CONFIG.totalCols)}px`;
        this.scrollContent.style.height = `${CONFIG.headerHeight + this.dimensionManager.getRowY(CONFIG.totalRows)+this.dimensionManager.getRowHeight(CONFIG.totalRows)}px`;
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
    private executeRender():void
    {
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