export class CellModel {
    constructor(
        public row: number,
        public col: number,
        public value: string | number
    ) {}

    public toString(): string {
        return this.value.toString();
    }
}
