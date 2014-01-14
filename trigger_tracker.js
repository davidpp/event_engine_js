//#########################################################
// TRIGGER
//#########################################################

function Trigger(code, value_tracker) {

	this.__code = code;
	this.__value_tracker = value_tracker;

	this.__current_values = new Array();
	this.__listeners = new Array();
	this.__condition_variables = new Array();
	this.__conditions_met = false;
	this.__exp_eval = null;
}

Trigger.prototype.__conditionCheck = function()
{
	return this.__exp_eval.evaluate();
}

Trigger.prototype.onNeedValue = function(name)
{
	return this.__current_values[name];	
}

Trigger.prototype.onValueChanged = function(code, value)
{
	this.__current_values[code] = value;

	var conditions_met = this.__conditionCheck();

	if (conditions_met != this.__conditions_met )
	{
		this.__conditions_met = conditions_met;

		if (conditions_met)
			for(var key in this.__listeners)
				this.__listeners[key].onTriggerFired(this.__code);
		else
			for(var key in this.__listeners)
				this.__listeners[key].onTriggerReleased(this.__code);
	}
}

Trigger.prototype.setOptions = function(options)
{
	for(var key in this.__condition_variables)
		this.__value_tracker.removeListener(this.__condition_variables[key], this);

	this.__exp_eval = new ExpEval(options.conditions, this);

	this.__current_values = new Array();
	this.__condition_variables = this.__exp_eval.getVariableList();

	for(var key in this.__condition_variables)
		this.__value_tracker.addListener(this.__condition_variables[key], this);
}

Trigger.prototype.addListener = function(listener)
{
	var index = this.__listeners.indexOf(listener);

	if (index == -1)
	{
		var conditions_met = this.__conditionCheck();

		if (conditions_met)
			listener.onTriggerFired(this.__code);				

		this.__listeners.push(listener);
	}
}

Trigger.prototype.removeListener = function(listener)
{
	var index = this.__listeners.indexOf(listener);

	if (index != -1)
		this.__listeners.splice(index, 1);
}

function TriggerTracker(value_tracker) {
	
	this.__value_tracker = value_tracker;
	this.__triggers = new Array();
}

//#########################################################
// TRIGGER TRACKER
//#########################################################

TriggerTracker.prototype.__getTrigger = function(code) {

	if (this.__triggers[code] == null)
		this.__triggers[code] = new Trigger(code, this.__value_tracker);

	return this.__triggers[code];
}

TriggerTracker.prototype.addTrigger = function(code, options) {

	var trigger = this.__getTrigger(code);

	trigger.setOptions(options);
}

TriggerTracker.prototype.addListener = function(code, listener) {

	var trigger = this.__getTrigger(code);

	trigger.addListener(listener);
}

TriggerTracker.prototype.removeListener = function(code, listener) {

	if (this.__triggers[code] == null)
		return;

	this.__triggers[code].removeListener(listener);
}