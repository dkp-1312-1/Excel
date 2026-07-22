import { CONFIG } from '../config/Config.js';
export interface rangeData
{
    rMin:number;
    rMax:number;
    cMin:number;
    cMax:number;

}
export class SelectionManager
{
    public startRow:number=-1;
    public startCol:number=-1;
    public endRow:number=-1;
    public endCol:number=-1;

    public setStart(row:number,col:number):void
    {
        this.startRow=row;
        this.startCol=col;
        this.endRow=row;
        this.endCol=col;
    }
    public setEnd(row:number,col:number):void
    {
        this.endRow=row;
        this.endCol=col;
    }
    public getRange() : rangeData
    {
        return {
            rMin:Math.min(this.startRow,this.endRow),
            rMax:Math.max(this.startRow,this.endRow),
            cMin:Math.min(this.startCol,this.endCol),
            cMax:Math.max(this.startCol,this.endCol)
        };
    }
    public hasSelection():boolean
    {
        return this.startRow!==-1;
    }
    public isSingleCell():boolean
    {
        return this.startRow===this.endRow && this.startCol===this.endCol;
    }
    public selectWholeColumn(col:number):void
    {
        this.setStart(1,col);
        this.setEnd(CONFIG.totalRows,col);
    }
    public selectWholeRow(row:number):void
    {
        this.setStart(row,1);
        this.setEnd(row,CONFIG.totalCols);
    }
}