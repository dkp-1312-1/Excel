import type { ICommand } from './ICommand.js';

export class CommandManager {
    private undoStack: ICommand[] = [];
    private redoStack: ICommand[] = [];

    public executeCommand(command: ICommand): void {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = []; // Clear redo stack whenever a new action is performed
    }

    public undo(): boolean {
        if (this.undoStack.length === 0) return false;
        const cmd = this.undoStack.pop()!;
        cmd.undo();
        this.redoStack.push(cmd);
        return true;
    }

    public redo(): boolean {
        if (this.redoStack.length === 0) return false;
        const cmd = this.redoStack.pop()!;
        cmd.execute();
        this.undoStack.push(cmd);
        return true;
    }
}