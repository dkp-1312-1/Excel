import { PointerHandler } from "./PointerHandler.js";
import { CONFIG } from "../config/Config.js";
import type { CellEventData } from "./PointerHandler.js";
export class RowSelectionHandler extends PointerHandler {
    onPointerDown(e: PointerEvent, data: CellEventData, cursor: string): boolean {
        if (!(data.pointerX <= CONFIG.headerWidth && data.pointerY > CONFIG.headerHeight)) return false;
        this.ctx.selection.selectWholeRow(data.row);
        this.ctx.renderCallback();
        this.ctx.summaryCalculator.updateStats();
        return true;
    }
 
    onPointerMove(e: PointerEvent, data: CellEventData): boolean {
        const safeRow = Math.max(1, Math.min(CONFIG.totalRows, data.row));
        this.ctx.selection.setEnd(safeRow, CONFIG.totalCols); // Keep full row width
        this.ctx.scrollToCell(safeRow, data.col);
        this.ctx.renderCallback();
        this.ctx.summaryCalculator.updateStats();
        return true;
    }
 
    onPointerUp(e: PointerEvent): boolean {
        return true;
    }
}