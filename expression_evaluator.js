var exp_eval_options = {
	OPERATOR : "operator",
	OPERAND : "operand",
	SEGMENT_START : "segment_start",
	SEGMENT_END : "segment_end",

	SEGMENT_START_CHAR : "(",
	SEGMENT_END_CHAR : ")",

	VARIABLE : "variable",
	CONSTANT : "constant",

	VARIABLE_PREFIX : "_",

	SYMBOL_PATTERN : "(\\|\\||&&|==|!=|<=|<|>=|>|\\(|\\)|\\w+|-?\\d+|\\+|-|\\*|/|%)",

	OPERATORS : {
		"||" : 1,

		"&&" : 2,

		"==" : 3,
		"!=" : 3,

		"<"  : 4,
		">"  : 4,
		"<=" : 4,
		">=" : 4,

		"+"  : 5,
		"-"  : 5,

		"*"  : 6,
		"/"  : 6,
		"%"  : 6
	},
};

function ExpEval(expression, dataSource) {

	this.__dataSource = dataSource;
	this.__symbolList = new Array();
	this.__variableList = new Array();

	this.__fillSymbolList(expression);
	this.__fillVariableList();
}

ExpEval.prototype.__fillSymbolList = function(expression)
{
	var symbol_list = expression.split(new RegExp(exp_eval_options.SYMBOL_PATTERN));
	for (var key in symbol_list)
	{
		var symbol = symbol_list[key];
		if (this.__getSymbolType(symbol) != exp_eval_options.INVALID_SYMBOL)
			this.__symbolList.push(symbol);
	}
}

ExpEval.prototype.__getSymbolType = function(symbol)
{
	if (symbol.length == 0)
		return exp_eval_options.INVALID_SYMBOL;

	if ( null != exp_eval_options.OPERATORS[symbol] )
		return exp_eval_options.OPERATOR;

	if (symbol == exp_eval_options.SEGMENT_START_CHAR)
		return exp_eval_options.SEGMENT_START;

	if (symbol == exp_eval_options.SEGMENT_END_CHAR)
		return exp_eval_options.SEGMENT_END;

	return exp_eval_options.OPERAND;
}

ExpEval.prototype.__getOperandType = function(operand)
{
	if (typeof operand !== 'string')
		return exp_eval_options.CONSTANT;

	if (operand.search(exp_eval_options.VARIABLE_PREFIX) == 0)
		return exp_eval_options.VARIABLE;

	return exp_eval_options.CONSTANT;
}

ExpEval.prototype.__getVariableName = function(operand)
{
	return operand.slice(exp_eval_options.VARIABLE_PREFIX.length);
}

ExpEval.prototype.__fillVariableList = function()
{
	for(var key in this.__symbolList)
	{
		var symbol = this.__symbolList[key];
		
		var symbol_type = this.__getSymbolType(symbol);
		if (symbol_type == exp_eval_options.OPERAND)
		{
			var operand_type = this.__getOperandType(symbol);
			if (operand_type == exp_eval_options.VARIABLE)
				this.__variableList.push(this.__getVariableName(symbol));
		}
	}
}

ExpEval.prototype.__getOperatorPresendence = function(operator)
{
	return exp_eval_options.OPERATORS[operator];
}

ExpEval.prototype.__getVariableValue = function(operand)
{
	var res;

	if ( this.__getOperandType(operand) == exp_eval_options.VARIABLE )
	{
		var variable_name = this.__getVariableName(operand);
		res = this.__dataSource.onNeedValue(variable_name);
	}
	else
		res = operand;

	return res;
}

ExpEval.prototype.__operateOn = function (operand1, operand2, operator)
{
	var o1 = this.__getVariableValue(operand1);
	var o2 = this.__getVariableValue(operand2);
	var res = false;

	switch(operator)
	{
		case "||" : res = o1 || o2 ? true : false; break;

		case "&&" : res = o1 && o2 ? true : false; break;

		case "==" : res = o1 == o2 ? true : false; break;
		case "!=" : res = o1 != o2 ? true : false; break;

		case "<"  : res = o1 <  o2 ? true : false; break;
		case ">"  : res = o1 >  o2 ? true : false; break;
		case "<=" : res = o1 <= o2 ? true : false; break;
		case ">=" : res = o1 >= o2 ? true : false; break;

		case "+"  : res = parseFloat(o1) + parseFloat(o2); break;
		case "-"  : res = parseFloat(o1) - parseFloat(o2); break;

		case "*"  : res = parseFloat(o1) * parseFloat(o2); break;
		case "/"  : res = parseFloat(o1) / parseFloat(o2); break;
		case "%"  : res = parseFloat(o1) % parseFloat(o2); break;
	}

	return res;
}

ExpEval.prototype.evaluate = function ()
{
	var operatorList = new Array();
	var operandList = new Array();

	for(var key in this.__symbolList)
	{
		var symbol = this.__symbolList[key];

		var type = this.__getSymbolType(symbol);

		switch(type)
		{
			case exp_eval_options.OPERATOR:
				if (operatorList.length > 0)
				{
					var top_operator = operatorList[operatorList.length-1];

					if ( this.__getOperatorPresendence(symbol) < this.__getOperatorPresendence(top_operator) )
					{
						operatorList.pop();
						var operand2 = operandList.pop();
						var operand1 = operandList.pop();

						var result = this.__operateOn(operand1, operand2, top_operator);
						operandList.push(result);
					}
				}

				operatorList.push(symbol);
			break;

			case exp_eval_options.SEGMENT_END:
				var top_operator;
				do
				{
					top_operator = operatorList.pop();

					if (top_operator != exp_eval_options.SEGMENT_START_CHAR)
					{
						var operand2 = operandList.pop();
						var operand1 = operandList.pop();

						var result = this.__operateOn(operand1, operand2, top_operator);
						operandList.push(result);
					}							
				} while (top_operator != exp_eval_options.SEGMENT_START_CHAR)
				break;

			case exp_eval_options.SEGMENT_START:
				operatorList.push(symbol)
				break;

			case exp_eval_options.OPERAND:
				operandList.push(symbol);
				break;
		}
	}

	while (operatorList.length > 0)
	{
		var top_operator = operatorList.pop();
		var operand2 = operandList.pop();
		var operand1 = operandList.pop();

		var result = this.__operateOn(operand1, operand2, top_operator);
		operandList.push(result);
	}

	return operandList[0];
}

ExpEval.prototype.getVariableList = function()
{
	return this.__variableList;
}