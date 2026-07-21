import { PointerHandler } from "./PointerHandler.js";
import { CONFIG } from "../config/Config.js";
import type { CellEventData } from "./PointerHandler.js";
export class ColumnSelectionHandler extends PointerHandler {
    onPointerDown(e: PointerEvent, data: CellEventData, cursor: string): boolean {
        if (!(data.pointerY <= CONFIG.headerHeight && data.pointerX > CONFIG.headerWidth)) return false;
        this.ctx.selection.selectWholeColumn(data.col);
        this.ctx.renderCallback();
        this.ctx.summaryCalculator.updateStats();
        return true;
    }
 
    onPointerMove(e: PointerEvent, data: CellEventData): boolean {
        if (!(data.pointerY <= CONFIG.headerHeight && data.pointerX > CONFIG.headerWidth)) return false;
        const safeCol = Math.max(1, Math.min(CONFIG.totalCols, data.col));
        this.ctx.selection.setEnd(CONFIG.totalRows, safeCol); // Keep full column height
        this.ctx.scrollToCell(data.row, safeCol);
        this.ctx.renderCallback();
        this.ctx.summaryCalculator.updateStats();
        return true;
    }
 
    onPointerUp(e: PointerEvent): boolean {
        return true;
    }
}
 