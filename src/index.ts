import { TableRow } from './tableRow';
import * as readline from 'readline';
import * as util from 'util';

const input = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
const question = util.promisify(input.question).bind(input) as (question: string) => Promise<string>;

function opOrder(op: string): number {
	switch (op) {
		case '^':
			return 3;
		case '*':
		case '/':
			return 2;
		case '+':
		case '-':
			return 1;
		default:
			return -1;
	}
}


const opStack: string[] = [];
const mainStack: string[] = [];
const rows: TableRow[] = [];


(async () => {
	// #region Read the user input
	const answer = await question('Ingresa una ecuación (sólo números): ');
	input.close();


	if (!answer.match(/^[\d()+\-*/\^ ]*$/)) {
		console.log('La ecuación ingresada no es válida. Sólo se admiten números y operadores aritméticos.');
		return;
	}
	// #endregion

	// #region Separate the input value into tokens
	const equation: string[] = [];
	var _tn: string = '';

	for (const c of answer.split('')) {
		if (c === ' ') continue;

		if (Number.isNaN(Number(c))) {
			if (_tn !== '') {
				equation.push(_tn);
				_tn = '';
			}

			equation.push(c);
			continue;
		}

		_tn += c;
	}
	if (_tn !== '') equation.push(_tn);
	// #endregion
	

	// #region Evaluate the equation with stacks
	for (const c of equation) {
		if (c.match(/\d/)) { mainStack.push(c); continue; }
		if (c === '(') { opStack.push(c); continue; }


		if (c === ')') {
			while (opStack[opStack.length - 1] !== '(' && opStack.length) {
				mainStack.push(opStack.pop());
			}
	
			opStack.pop();
			continue;
		}


		while (opStack.length && opOrder(c) <= opOrder(opStack[opStack.length - 1])) {
			if (c === '^' && opStack[opStack.length - 1] === '^') break;
			mainStack.push(opStack.pop());
		}

		opStack.push(c);
	}

	while (opStack.length)
		mainStack.push(opStack.pop());
	// #endregion


	// #region Insert all the rows and generate the code
	const queue: string[] = [];
	var varName = 'A', lastVarName = 'A', tmpCode = '';

	for (const c of mainStack) {
		if (c.match(/\d/) || c.match(/\w/)) {
			queue.push(c);
			continue;
		}

		var op2: string | number = queue.pop();
		var op1: string | number = queue.pop();

		if (!Number.isNaN(Number(op1))) op1 = Number(op1);
		if (!Number.isNaN(Number(op2))) op2 = Number(op2);

		rows.push(new TableRow(c, op1, op2, varName));


		if (c === '^') tmpCode += `const ${varName} = Math.pow(${op1}, ${op2});\n`;
		else		   tmpCode += `const ${varName} = ${op1} ${c} ${op2};\n`;


		queue.push(varName);
		lastVarName = varName;
		varName = String.fromCharCode(varName.charCodeAt(0) + 1);
	}
	tmpCode += `\nconsole.log(${lastVarName});`;
	// #endregion


	// Filter if some column is empty
	if (rows.filter(r => r.left === undefined || r.right === undefined).length) {
		console.log('La ecuación ingresada no es válida.');
		return;
	}

	// Display the result
	console.table(rows);
	console.log(`\n[===== Código =====]\n${tmpCode}\n\n[===== Ejecución =====]`);
	eval(tmpCode);
})();


