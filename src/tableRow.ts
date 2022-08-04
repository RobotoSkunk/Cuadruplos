export class TableRow {
	public operator: string;
	public left: string | number;
	public right: string | number;
	public varName: string;

	constructor(operator: string, left: string | number, right: string | number, varName: string) {
		this.operator = operator;
		this.left = left;
		this.right = right;
		this.varName = varName;
	}
}
