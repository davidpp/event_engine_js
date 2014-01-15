//#########################################################
// TRIGGER
//#########################################################

function Trigger(code, message_tracker) {

	this.__code = code;
	this.__message_tracker = message_tracker;

	this.__current_values = new Array();
	this.__condition_variables = new Array();
	this.__conditions_met = false;
	this.__exp_eval = null;

	this.__message_tracker.addListener("on_value_changed", this);
}

Trigger.prototype.onNeedValue = function(name)
{
	return this.__current_values[name];	
}

Trigger.prototype.onMessage = function(code, data)
{
	if (this.__condition_variables.indexOf(data.code) == -1)
		return;

	this.__current_values[data.code] = data.value;

	var conditions_met = this.__exp_eval.evaluate();

	if (conditions_met != this.__conditions_met )
	{
		this.__conditions_met = conditions_met;

		if (conditions_met)
			this.__message_tracker.sendMessage("on_trigger_fired", this.__code);

		else
			this.__message_tracker.sendMessage("on_trigger_released", this.__code);
	}	
}

Trigger.prototype.setOptions = function(options)
{
	this.__exp_eval = new ExpEval(options.conditions, this);

	this.__current_values = new Array();
	this.__condition_variables = this.__exp_eval.getVariableList();
}

//#########################################################
// TRIGGER TRACKER
//#########################################################

function TriggerTracker(message_tracker) {
	
	this.__message_tracker = message_tracker;
	this.__triggers = new Array();
}

TriggerTracker.prototype.__getTrigger = function(code) {

	if (this.__triggers[code] == null)
		this.__triggers[code] = new Trigger(code, this.__message_tracker);

	return this.__triggers[code];
}

TriggerTracker.prototype.addTrigger = function(code, options) {

	var trigger = this.__getTrigger(code);

	trigger.setOptions(options);
}