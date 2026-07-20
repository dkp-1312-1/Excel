import { PointerHandler } from "./PointerHandler.js";
import type { CellEventData } from "./PointerHandler.js";
import { ResizeColumnCommand } from "../commands/ResizeColumnCommand.js";
import { ResizeRowCommand } from "../commands/ResizeRowCommand.js";
export class ResizingHandler extends PointerHandler {
    private resizingCol: number = -1;
    private resizingRow: number = -1;
    private startSize: number = 0;
    private startPointerPos: number = 0;

    onPointerDown(e: PointerEvent, data: CellEventData, cursor: string): void {
        if (cursor === 'col-resize') {
            this.resizingCol = data.col;
            this.startSize = this.ctx.colModel.getColWidth(data.col);
            this.startPointerPos = e.clientX;
        } else if (cursor === 'row-resize') {
            this.resizingRow = data.row;
            this.startSize = this.ctx.rowModel.getRowHeight(data.row);
            this.startPointerPos = e.clientY;
        }
    }
    onPointerMove(e: PointerEvent, data: CellEventData): void {
        if (this.resizingCol !== -1) {
            const diff = e.clientX - this.startPointerPos;
            this.ctx.colModel.setColWidth(this.resizingCol, this.startSize + diff);
            this.ctx.renderCallback();
        } else if (this.resizingRow !== -1) {
            const diff = e.clientY - this.startPointerPos;
            this.ctx.rowModel.setRowHeight(this.resizingRow, this.startSize + diff);
            this.ctx.renderCallback();
        }
    }
    onPointerUp(e: PointerEvent): void {
        if (this.resizingCol !== -1) {
            const finalWidth = this.ctx.colModel.getColWidth(this.resizingCol);
            if (finalWidth !== this.startSize) {
                this.ctx.cmdManager.executeCommand(new ResizeColumnCommand(this.ctx.colModel, this.resizingCol, this.startSize, finalWidth));
            }
            this.ctx.updateScrollbarCallback();
        }

        if (this.resizingRow !== -1) {
            const finalHeight = this.ctx.rowModel.getRowHeight(this.resizingRow);
            if (finalHeight !== this.startSize) {
                this.ctx.cmdManager.executeCommand(new ResizeRowCommand(this.ctx.rowModel, this.resizingRow, this.startSize, finalHeight));
            }
            this.ctx.updateScrollbarCallback();
        }

        this.resizingCol = -1;
        this.resizingRow = -1;
    }
}