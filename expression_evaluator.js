var exp_eval_constants = {
	OPERATOR : "operator",
	OPERAND : "operand",
	INVALID_SYMBOL : "invalid_symbol",
	SEGMENT_START : "segment_start",
	SEGMENT_END : "segment_end",
	VARIABLE : "variable",
	CONSTANT : "constant",
}

function ExpEvalOptions() {
	
	this.SYMBOL_PATTERN = "";

	this.SEGMENT_START_CHAR = "(";
	this.SEGMENT_START_CHAR_REGEX = "\\(";

	this.SEGMENT_END_CHAR = ")";
	this.SEGMENT_END_CHAR_REGEX = "\\)";

	this.VARIABLE_PREFIX = "_";
	this.VARIABLE_REGEX = "_\\w+";

	this.CONSTANT_REGEX = "-?\\d+";

	this.OPERATORS = {

		"||" : {
			precedence : 1,
			regex_symbol : '\\|\\|',
			perform : function(o1,o2) {
				return o1 || o2 ? true : false;
			}
		},

		"&&" : {
			precedence : 2,
			regex_symbol : '&&',
			perform : function(o1,o2) {
				return o1 && o2 ? true : false;
			}
		},

		"==" : {
			precedence : 3,
			regex_symbol : '==',
			perform : function(o1,o2) {
				return o1 == o2 ? true : false;
			}
		},

		"!=" : {
			precedence : 3,
			regex_symbol : '!=',
			perform : function(o1,o2) {
				return o1 != o2 ? true : false;
			}
		},

		"<=" : {
			precedence : 4,
			regex_symbol : '<=',
			perform : function(o1,o2) {
				return o1 <= o2 ? true : false;
			}
		},

		"<" : {
			precedence : 4,
			regex_symbol : '<',
			perform : function(o1,o2) {
				return o1 < o2 ? true : false;
			}
		},

		">=" : {
			precedence : 4,
			regex_symbol : '>=',
			perform : function(o1,o2) {
				return o1 >= o2 ? true : false;
			}
		},

		">" : {
			precedence : 4,
			regex_symbol : '>',
			perform : function(o1,o2) {
				return o1 > o2 ? true : false;
			}
		},

		"+" : {
			precedence : 5,
			regex_symbol : '\\+',
			perform : function(o1,o2) {
				return parseFloat(o1) + parseFloat(o2);
			}
		},

		"-" : {
			precedence : 5,
			regex_symbol : '-',
			perform : function(o1,o2) {
				return parseFloat(o1) - parseFloat(o2);
			}
		},

		"*" : {
			precedence : 6,
			regex_symbol : '\\*',
			perform : function(o1,o2) {
				return parseFloat(o1) * parseFloat(o2);
			}
		},

		"/" : {
			precedence : 6,
			regex_symbol : '/',
			perform : function(o1,o2) {
				return parseFloat(o1) / parseFloat(o2);
			}
		},

		"%" : {
			precedence : 6,
			regex_symbol : '%',
			perform : function(o1,o2) {
				return parseFloat(o1) % parseFloat(o2);
			}
		},

		"^" : {
			precedence : 7,
			regex_symbol : '\\^',
			perform : function(o1,o2) {
				return Math.pow(parseFloat(o1) , parseFloat(o2));
			}
		}
	};

	this.__buildSymbolPattern();
}

ExpEvalOptions.prototype.__buildSymbolPattern = function()
{
	this.SYMBOL_PATTERN = "(";

	for(var key in this.OPERATORS)
	{
		var operator = this.OPERATORS[key];

		this.SYMBOL_PATTERN += operator.regex_symbol + "|";
	}

	this.SYMBOL_PATTERN += this.SEGMENT_START_CHAR_REGEX + "|";
	this.SYMBOL_PATTERN += this.SEGMENT_END_CHAR_REGEX + "|";
	this.SYMBOL_PATTERN += this.VARIABLE_REGEX + "|";
	this.SYMBOL_PATTERN += this.CONSTANT_REGEX;

	this.SYMBOL_PATTERN += ")";
}

var default_exp_eval_options = new ExpEvalOptions();

function ExpEval(expression, data_source, exp_eval_options) {

	if (exp_eval_options == null)
		this.__options = default_exp_eval_options;
	else
		this.__options = exp_eval_options;

	this.__data_source = data_source;
	this.__symbol_list = new Array();
	this.__variable_list = new Array();

	this.__fillSymbolList(expression);
	this.__fillVariableList();
}

ExpEval.prototype.__fillSymbolList = function(expression)
{
	var symbol_list = expression.split(new RegExp(this.__options.SYMBOL_PATTERN));
	for (var key in symbol_list)
	{
		var symbol = symbol_list[key].trim();
		if (this.__getSymbolType(symbol) != exp_eval_constants.INVALID_SYMBOL)
			this.__symbol_list.push(symbol);
	}
}

ExpEval.prototype.__getSymbolType = function(symbol)
{
	if (symbol.length == 0)
		return exp_eval_constants.INVALID_SYMBOL;

	if ( null != this.__options.OPERATORS[symbol] )
		return exp_eval_constants.OPERATOR;

	if (symbol == this.__options.SEGMENT_START_CHAR)
		return exp_eval_constants.SEGMENT_START;

	if (symbol == this.__options.SEGMENT_END_CHAR)
		return exp_eval_constants.SEGMENT_END;

	return exp_eval_constants.OPERAND;
}

ExpEval.prototype.__getOperandType = function(operand)
{
	if (typeof operand !== 'string')
		return exp_eval_constants.CONSTANT;

	if (operand.search(this.__options.VARIABLE_PREFIX) == 0)
		return exp_eval_constants.VARIABLE;

	return exp_eval_constants.CONSTANT;
}

ExpEval.prototype.__getVariableName = function(operand)
{
	return operand.slice(this.__options.VARIABLE_PREFIX.length);
}

ExpEval.prototype.__fillVariableList = function()
{
	for(var key in this.__symbol_list)
	{
		var symbol = this.__symbol_list[key];
		
		var symbol_type = this.__getSymbolType(symbol);
		if (symbol_type == exp_eval_constants.OPERAND)
		{
			var operand_type = this.__getOperandType(symbol);
			if (operand_type == exp_eval_constants.VARIABLE)
				this.__variable_list.push(this.__getVariableName(symbol));
		}
	}
}

ExpEval.prototype.__getOperatorPresendence = function(operator)
{
	return this.__options.OPERATORS[operator].precedence;
}

ExpEval.prototype.__getVariableValue = function(operand)
{
	var res;

	if ( this.__getOperandType(operand) == exp_eval_constants.VARIABLE )
	{
		var variable_name = this.__getVariableName(operand);
		res = this.__data_source.onNeedValue(variable_name);
	}
	else
		res = operand;

	return res;
}

ExpEval.prototype.__operateOn = function (operand1, operand2, operator)
{
	var o1 = this.__getVariableValue(operand1);
	var o2 = this.__getVariableValue(operand2);
	var op = this.__options.OPERATORS[operator];

	return op.perform(o1, o2);
}

ExpEval.prototype.evaluate = function ()
{
	var operatorList = new Array();
	var operandList = new Array();

	for(var key in this.__symbol_list)
	{
		var symbol = this.__symbol_list[key];

		var type = this.__getSymbolType(symbol);

		switch(type)
		{
			case exp_eval_constants.OPERATOR:
				if (operatorList.length > 0)
				{
					var top_operator = operatorList[operatorList.length-1];

					if (top_operator != this.__options.SEGMENT_START_CHAR)
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

			case exp_eval_constants.SEGMENT_END:
				var top_operator;
				do
				{
					top_operator = operatorList.pop();

					if (top_operator != this.__options.SEGMENT_START_CHAR)
					{
						var operand2 = operandList.pop();
						var operand1 = operandList.pop();

						var result = this.__operateOn(operand1, operand2, top_operator);
						operandList.push(result);
					}							
				} while (top_operator != this.__options.SEGMENT_START_CHAR && operatorList.length > 0)
				break;

			case exp_eval_constants.SEGMENT_START:
				operatorList.push(symbol)
				break;

			case exp_eval_constants.OPERAND:
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
	return this.__variable_list;
}