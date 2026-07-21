import { PointerHandler } from "./PointerHandler.js";
import type { CellEventData } from "./PointerHandler.js";
import { ColumnResizingHandler } from "./ColumnResizingHandler.js";
import { RowResizingHandler } from "./RowResizingHandler.js";
import { ColumnSelectionHandler } from "./ColumnSelectionHandler.js";
import { RowSelectionHandler } from "./RowSelectionHandler.js";
import { CellSelectionHandler } from "./CellSelectionHandler.js";
import { CONFIG } from "../config/Config.js";

export class IdleHandler extends PointerHandler {
    onPointerDown(e: PointerEvent, data: CellEventData, cursor: string): boolean {
        const handlers = [
            ColumnResizingHandler,
            RowResizingHandler,
            ColumnSelectionHandler,
            RowSelectionHandler,
            CellSelectionHandler
        ];

        for (const HandlerClass of handlers) {
            const handler = new HandlerClass(this.ctx);
            if (handler.onPointerDown(e, data, cursor)) {
                this.ctx.changeState(handler);
                return true;
            }
        }
        return false;
    }

    onPointerMove(e: PointerEvent, data: CellEventData): boolean {
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
        return true;
    }

    onPointerUp(e: PointerEvent): boolean {
        // Do nothing in idle state
        return true;
    }
}
