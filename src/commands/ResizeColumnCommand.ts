import { ColumnModel } from '../models/ColumnModel.js';
import type { ICommand } from './ICommand.js';

export class ResizeColumnCommand implements ICommand {
    constructor(
        private colModel: ColumnModel,
        private col: number,
        private oldWidth: number,
        private newWidth: number
    ) {}

    execute(): void { this.colModel.setColWidth(this.col, this.newWidth); }
    undo(): void { this.colModel.setColWidth(this.col, this.oldWidth); }
}
