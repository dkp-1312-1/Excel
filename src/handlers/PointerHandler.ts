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
 
    // Returns true if this handler should take over the drag operation
    abstract onPointerDown(e: PointerEvent, data: CellEventData, cursor: string): boolean;
    abstract onPointerMove(e: PointerEvent, data: CellEventData): void;
    abstract onPointerUp(e: PointerEvent): void;
}
