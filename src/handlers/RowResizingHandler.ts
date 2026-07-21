import { PointerHandler } from "./PointerHandler.js";
import type { CellEventData } from "./PointerHandler.js";
import { ResizeRowCommand } from "../commands/ResizeRowCommand.js";

export class RowResizingHandler extends PointerHandler {
    private resizingRow: number = -1;
    private startSize: number = 0;
    private startPointerPos: number = 0;

    onPointerDown(e: PointerEvent, data: CellEventData, cursor: string): boolean {
        if (cursor !== 'row-resize') return false;
        this.resizingRow = data.row;
        this.startSize = this.ctx.rowModel.getRowHeight(data.row);
        this.startPointerPos = e.clientY;
        return true;
    }

    onPointerMove(e: PointerEvent, data: CellEventData): boolean {
        if (this.resizingRow !== -1) {
            const diff = e.clientY - this.startPointerPos;
            this.ctx.rowModel.setRowHeight(this.resizingRow, this.startSize + diff);
            this.ctx.renderCallback();
        }
        return true;
    }

    onPointerUp(e: PointerEvent): boolean {
        if (this.resizingRow !== -1) {
            const finalHeight = this.ctx.rowModel.getRowHeight(this.resizingRow);
            if (finalHeight !== this.startSize) {
                this.ctx.cmdManager.executeCommand(new ResizeRowCommand(this.ctx.rowModel, this.resizingRow, this.startSize, finalHeight));
            }
            this.ctx.updateScrollbarCallback();
        }
        this.resizingRow = -1;
        return true;
    }
}
