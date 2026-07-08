export class DataStore
{
    private data:Map<string,string|number>=new Map();
    public generateInitialData(count:number):void
    {
        this.setValue(0, 1, 'ID');
        this.setValue(0, 2, 'First Name');
        this.setValue(0, 3, 'Last Name');
        this.setValue(0, 4, 'Age');
        this.setValue(0, 5, 'Salary');
 
        for (let r = 1; r <= count; r++) {
            this.setValue(r, 1, r);
            this.setValue(r, 2, `Raj${r}`);
            this.setValue(r, 3, `Solanki${r}`);
            this.setValue(r, 4, Math.floor(Math.random() * 40) + 20);
            this.setValue(r, 5, Math.floor(Math.random() * 900000) + 100000);
        }
    }
    public getValue(row:number,col:number):string|number
    {
        return this.data.get(`${row},${col}`)??'';
    }
    public setValue(row:number,col:number,value:string|number):void
    {
        this.data.set(`${row},${col}`,value);
    }
}