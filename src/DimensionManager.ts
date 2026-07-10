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
        let totalWidthRequired:number=(col-1)*CONFIG.colWidth;
        for(const [column,width] of this.customWidths.entries())
        {
            if(column<col)
            {
                totalWidthRequired+=(width-CONFIG.colWidth);
            }  
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
        let totalHeightRequired:number=(row-1)*CONFIG.rowHeight;
        for(const [tempRow,height] of this.customHeights.entries())
        {
            if(tempRow<row)
            {
                totalHeightRequired+=(height-CONFIG.rowHeight);
            }
        }
        return totalHeightRequired;
    }
    
}