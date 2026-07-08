import { CONFIG } from "./Config.js";
import { DataStore } from "./DataStore.js";
import { SelectionManager } from "./SelectionManager.js";

export class CanvasRendering 
{
    private ctx:CanvasRenderingContext2D;
    constructor(private canvas:HTMLCanvasElement,private dataStore:DataStore)
    {
        this.ctx=canvas.getContext('2d') as CanvasRenderingContext2D;
    }
    private getColLetter(col:number):string
    {
        let letter='';
        while(col>0)
        {
            let reminder=(col-1)%26;
            letter=String.fromCharCode(65+reminder)+letter;
            col=Math.floor(col-1)/26;
        }
        return letter;
    }
    public drawSelection(scrollX:number,scrollY:number,width:number,height:number,selection:SelectionManager):void
    {
        this.ctx.clearRect(0,0,width,height);
        this.ctx.translate(0.5,0.5);
        const startCol=Math.max(1,Math.floor(scrollX/CONFIG.colWidth)+1);
        const endCol=Math.min(CONFIG.totalCols,startCol+Math.ceil(width/CONFIG.colWidth)+1);
        const startRow=Math.max(1,Math.floor(scrollY/CONFIG.rowHeight)+1);
        const endRow=Math.min(CONFIG.totalRows,Math.ceil(height/CONFIG.rowHeight)+1);
        
        this.ctx.font=CONFIG.font;
        this.ctx.textBaseline='middle';
    }
}