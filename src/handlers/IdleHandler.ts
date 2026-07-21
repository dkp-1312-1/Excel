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
        // Do nothing in idle state
       return true;
    }

    onPointerUp(e: PointerEvent): boolean {
        // Do nothing in idle state
        return true;
    }
}
