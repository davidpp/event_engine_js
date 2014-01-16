//#########################################################
// TRIGGER
//#########################################################

function Trigger(code, message_tracker) {

	this.__code = code;
	this.__message_tracker = message_tracker;

	this.__conditions = "";
	this.__current_values = new Array();
	this.__condition_variables = new Array();
	this.__conditions_met = false;
	this.__conditions_met_once = false;
	this.__exp_eval = null;
	this.__listeners = new Array();
}

Trigger.prototype.addListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index != -1)
		return;

	this.__listeners.push(listener);
	this.__callListener(listener);
}

Trigger.prototype.removeListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__listeners.splice(index, 1);
}

Trigger.prototype.__callListener = function(listener) {

	if (this.__conditions_met) {
		if (null != listener.onTriggerFired)
			listener.onTriggerFired(this.__code);
	}
	else if (this.__conditions_met_once && null != listener.onTriggerReleased)
		listener.onTriggerReleased(this.__code);
}

Trigger.prototype.__callListeners = function() {

	for (var key in this.__listeners)
		this.__callListener(this.__listeners[key]);
}

Trigger.prototype.onNeedValue = function(name)
{
	return this.__current_values[name];	
}

Trigger.prototype.onValueChanged = function(code, value) {

	this.__current_values[code] = value;

	var conditions_met = this.__exp_eval.evaluate();

	if (conditions_met != this.__conditions_met )
	{
		this.__conditions_met = conditions_met;

		if (this.__conditions_met)
			this.__conditions_met_once = true;

		this.__callListeners();
	}	
}

Trigger.prototype.setOptions = function(options)
{
	if( this.__conditions != options.conditions )
	{
		this.__conditions = options.conditions;
		this.__conditions_met = false;
		this.__conditions_met_once = false;
		this.__current_values = new Array();

		this.__exp_eval = new ExpEval(this.__conditions, this);

		for (var key in this.__condition_variables)
			this.__message_tracker.removeListener("onValueChanged", this, {code:this.__condition_variables[key]});

		this.__condition_variables = this.__exp_eval.getVariableList();

		for (var key in this.__condition_variables)
			this.__message_tracker.addListener("onValueChanged", this, {code:this.__condition_variables[key]});
	}
}

//#########################################################
// TRIGGER TRACKER
//#########################################################

function TriggerTracker(message_tracker) {
	
	this.__triggers = new Array();
	this.__message_tracker = message_tracker;

	this.__message_tracker.setEmitter("onTriggerFired", this);
	this.__message_tracker.setEmitter("onTriggerReleased", this);
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

TriggerTracker.prototype.addListener = function(listener, options) {
	
	var trigger = this.__getTrigger(options.code);

	trigger.addListener(listener);
}

TriggerTracker.prototype.removeListener = function(listener, options) {

	if (this.__triggers[options.code] == null)
		return;

	this.__triggers[options.code].removeListener(listener);
}