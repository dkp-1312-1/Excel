import { RowModel } from './RowModel.js';
import type { ICommand } from './ICommand.js';

export class ResizeRowCommand implements ICommand {
    constructor(
        private rowModel: RowModel,
        private row: number,
        private oldHeight: number,
        private newHeight: number
    ) {}

    execute(): void { this.rowModel.setRowHeight(this.row, this.newHeight); }
    undo(): void { this.rowModel.setRowHeight(this.row, this.oldHeight); }
}
