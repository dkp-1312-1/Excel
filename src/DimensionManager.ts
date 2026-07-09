import { CONFIG } from "./Config.js";

export class DimensionManager
{
    private customWidths:Map<number,number>=new Map();
    private customHeights:Map<number,number>=new Map();
    
    public getColWidth(col:number):number
    {
        return this.customWidths.get(col)??CONFIG.colWidth;
    }

    public setColWidth(col:number,width:number):void
    {
        this.customWidths.set(col,Math.max(width,20));
    }

    public getColX(col:number):number
    {
        let totalWidthRequired:number=0;
        for(let c=1;c<col;c++)
        {
            totalWidthRequired+=this.getColWidth(c);
        }
        return totalWidthRequired;
    }
    public getRowHeight(row:number):number
    {
        return this.customHeights.get(row)??CONFIG.rowHeight;
    }
    public setRowHeight(row:number,height:number):void
    {
        this.customHeights.set(row,Math.max(height,20));
    }
    public getRowY(row:number):number
    {
        let totalHeightRequired:number=0;
        for(let r=1;r<row;r++)
        {
            totalHeightRequired+=this.getRowHeight(r);
        }
        return totalHeightRequired;
    }
}