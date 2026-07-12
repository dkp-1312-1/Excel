import { CellModel } from './CellModel.js';

export class GridDataStore
{
    private data: Map<string, CellModel> = new Map();
    public getValue(row: number, col: number): CellModel | null
    {
        return this.data.get(`${row},${col}`) ?? null;
    }
    public setValue(row: number, col: number, value: string | number): void
    {
        this.data.set(`${row},${col}`, new CellModel(row, col, value));
    }
}