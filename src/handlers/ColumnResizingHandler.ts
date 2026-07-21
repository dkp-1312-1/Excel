import { PointerHandler } from "./PointerHandler.js";
import type { CellEventData } from "./PointerHandler.js";
import { ResizeColumnCommand } from "../commands/ResizeColumnCommand.js";

export class ColumnResizingHandler extends PointerHandler {
    private resizingCol: number = -1;
    private startSize: number = 0;
    private startPointerPos: number = 0;

    onPointerDown(e: PointerEvent, data: CellEventData, cursor: string): boolean {
        if (cursor !== 'col-resize') return false;
        this.resizingCol = data.col;
        this.startSize = this.ctx.colModel.getColWidth(data.col);
        this.startPointerPos = e.clientX;
        return true;
    }

    onPointerMove(e: PointerEvent, data: CellEventData): boolean {
        if (this.resizingCol !== -1) {
            const diff = e.clientX - this.startPointerPos;
            this.ctx.colModel.setColWidth(this.resizingCol, this.startSize + diff);
            this.ctx.renderCallback();
        }
        return true;
    }

    onPointerUp(e: PointerEvent): boolean {
        if (this.resizingCol !== -1) {
            const finalWidth = this.ctx.colModel.getColWidth(this.resizingCol);
            if (finalWidth !== this.startSize) {
                this.ctx.cmdManager.executeCommand(new ResizeColumnCommand(this.ctx.colModel, this.resizingCol, this.startSize, finalWidth));
            }
            this.ctx.updateScrollbarCallback();
        }
        this.resizingCol = -1;
        return true;
    }
}
