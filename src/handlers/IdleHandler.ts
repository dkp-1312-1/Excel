import { PointerHandler } from "./PointerHandler.js";
import type { CellEventData } from "./PointerHandler.js";
import { ResizingHandler } from "./ResizingHandler.js";
import { ColumnSelectionHandler } from "./ColumnSelectionHandler.js";
import { RowSelectionHandler } from "./RowSelectionHandler.js";
import { CellSelectionHandler } from "./CellSelectionHandler.js";
import { CONFIG } from "../config/Config.js";

export class IdleHandler extends PointerHandler {
    onPointerDown(e: PointerEvent, data: CellEventData, cursor: string): void {
        let newState: PointerHandler;

        if (cursor === 'col-resize' || cursor === 'row-resize') {
            newState = new ResizingHandler(this.ctx);
        } else if (data.pointerY <= CONFIG.headerHeight && data.pointerX > CONFIG.headerWidth) {
            newState = new ColumnSelectionHandler(this.ctx);
        } else if (data.pointerX <= CONFIG.headerWidth && data.pointerY > CONFIG.headerHeight) {
            newState = new RowSelectionHandler(this.ctx);
        } else {
            newState = new CellSelectionHandler(this.ctx);
        }

        this.ctx.changeState(newState);
        newState.onPointerDown(e, data, cursor);
    }

    onPointerMove(e: PointerEvent, data: CellEventData): void {
        let cursor: string = 'cell';
        const { scrollX, scrollY } = this.ctx.getScrollPosition();

        const rightEdge = CONFIG.headerWidth + this.ctx.colModel.getColX(data.col) + this.ctx.colModel.getColWidth(data.col) - scrollX;
        const bottomEdge = CONFIG.headerHeight + this.ctx.rowModel.getRowY(data.row) + this.ctx.rowModel.getRowHeight(data.row) - scrollY;

        if (data.pointerY <= CONFIG.headerHeight && Math.abs(data.pointerX - rightEdge) < CONFIG.resizeHoverMargin) {
            cursor = 'col-resize';
        } else if (data.pointerX <= CONFIG.headerWidth && Math.abs(data.pointerY - bottomEdge) < CONFIG.resizeHoverMargin) {
            cursor = 'row-resize';
        }
        this.ctx.setCursor(cursor);
    }

    onPointerUp(e: PointerEvent): void {
        // Do nothing in idle state
    }
}
