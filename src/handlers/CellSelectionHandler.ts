import { PointerHandler } from "./PointerHandler.js";
import { CONFIG } from "../config/Config.js";
import type { CellEventData } from "./PointerHandler.js";
export class CellSelectionHandler extends PointerHandler {
    onPointerDown(e: PointerEvent, data: CellEventData, cursor: string): boolean {
        this.ctx.selection.setStart(data.row, data.col);
        this.ctx.renderCallback();
        this.ctx.summaryCalculator.updateStats();
        return true;
    }
 
    onPointerMove(e: PointerEvent, data: CellEventData): boolean {
        const safeRow = Math.max(1, Math.min(CONFIG.totalRows, data.row));
        const safeCol = Math.max(1, Math.min(CONFIG.totalCols, data.col));
        this.ctx.selection.setEnd(safeRow, safeCol);
        this.ctx.scrollToCell(safeRow, safeCol);
        this.ctx.renderCallback();
        this.ctx.summaryCalculator.updateStats();
        return true;
    }
    onPointerUp(e: PointerEvent): boolean {
        return true;
    }
}
 