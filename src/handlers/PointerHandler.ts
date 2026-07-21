import type { SummaryCalculator } from "../components/SummaryCalculator.js";
import type { CommandManager } from "../managers/CommandManager.js";
import type { SelectionManager } from "../managers/SelectionManager.js";
import type { ColumnModel } from "../models/ColumnModel.js";
import type { RowModel } from "../models/RowModel.js";

export interface GridContext 
{
    rowModel:RowModel;
    colModel:ColumnModel;
    selection:SelectionManager;
    summaryCalculator:SummaryCalculator;
    cmdManager:CommandManager;
    renderCallback:()=>void;
    updateScrollbarCallback:()=>void;
    scrollToCell:(row:number, col:number)=>void;
    changeState:(newState: PointerHandler)=>void;
    getScrollPosition:()=> {scrollX: number, scrollY: number};
    setCursor:(cursor: string)=>void;
}
export interface CellEventData 
{
    row:number;
    col:number;
    pointerX:number;
    pointerY:number;
}

export abstract class PointerHandler
{
    constructor(protected ctx: GridContext) {}
 
    // State pattern entry point
    abstract onPointerDown(e: PointerEvent, data: CellEventData, cursor: string): boolean;
    abstract onPointerMove(e: PointerEvent, data: CellEventData): boolean;
    abstract onPointerUp(e: PointerEvent): boolean;
}
