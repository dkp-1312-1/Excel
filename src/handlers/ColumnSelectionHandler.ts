import { PointerHandler } from "./PointerHandler.js";
import { CONFIG } from "../config/Config.js";
import type { CellEventData } from "./PointerHandler.js";
export class ColumnSelectionHandler extends PointerHandler {
    onPointerDown(e: PointerEvent, data: CellEventData, cursor: string): boolean {
        if (data.pointerY <= CONFIG.headerHeight && data.pointerX > CONFIG.headerWidth) {
            this.ctx.selection.selectWholeColumn(data.col);
            this.ctx.renderCallback();
            this.ctx.summaryCalculator.updateStats();
            return true;
        }
        return false;
    }
 
    onPointerMove(e: PointerEvent, data: CellEventData): void {
        const safeCol = Math.max(1, Math.min(CONFIG.totalCols, data.col));
        this.ctx.selection.setEnd(CONFIG.totalRows, safeCol); // Keep full column height
        this.ctx.scrollToCell(data.row, safeCol);
        this.ctx.renderCallback();
        this.ctx.summaryCalculator.updateStats();
    }
 
    onPointerUp(e: PointerEvent): void {}
}
 