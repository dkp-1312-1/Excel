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

        for(let r=startRow;r<=endRow;r++)
        {
            for(let c=startCol;c<=endCol;c++)
            {
                const x=CONFIG.headerWidth+((c-1)*CONFIG.colWidth)-scrollX;
                const y=CONFIG.headerHeight+((r-1)*CONFIG.rowHeight)-scrollY;

                this.ctx.strokeStyle=CONFIG.gridColor;
                this.ctx.strokeRect(x,y,CONFIG.colWidth,CONFIG.rowHeight);

                const val=this.dataStore.getValue(r,c);

                if(val!=='')
                {
                    this.ctx.fillStyle=CONFIG.textColor;
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.rect(x,y,CONFIG.colWidth,CONFIG.rowHeight);
                    this.ctx.clip();
                    this.ctx.fillText(val.toString(),x+6,y+(CONFIG.rowHeight/2));
                    this.ctx.restore();
                }
            }
        }
        if(selection.hasSelection())
        {
            const range=selection.getRange();
            const x=CONFIG.headerWidth+((range.cMin-1)*CONFIG.colWidth)-scrollX;
            const y=CONFIG.headerHeight+((range.rMin-1)*CONFIG.rowHeight)-scrollY;
            const w=(range.cMax-range.cMin+1)*CONFIG.colWidth;
            const h=(range.rMax-range.rMin+1)*CONFIG.rowHeight;

            this.ctx.fillStyle=CONFIG.selectionBg;
            this.ctx.fillRect(x,y,w,h);
            this.ctx.strokeStyle=CONFIG.selectionBorder;
            this.ctx.lineWidth=2;
            this.ctx.strokeRect(x,y,w,h);
            this.ctx.lineWidth=1;
        }
        this.ctx.fillStyle=CONFIG.headerBg;
        this.ctx.fillRect(CONFIG.headerWidth,0,width,CONFIG.headerHeight);
        for(let c=startCol;c<=endCol;c++)
        {
            const x=CONFIG.headerWidth+((c-1)*CONFIG.colWidth)-scrollX;
            this.ctx.strokeStyle='#ccc';
            this.ctx.strokeRect(x,0,CONFIG.colWidth,CONFIG.headerHeight);
            this.ctx.fillStyle=CONFIG.textColor;
            this.ctx.textAlign='center';
            this.ctx.fillText(this.getColLetter(c),x+(CONFIG.colWidth/2),CONFIG.headerHeight/2);
            this.ctx.textAlign='left';
        }
    }
}