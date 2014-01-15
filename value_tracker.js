//#########################################################
// VALUE
//#########################################################

function Value(code, message_tracker) {
	
	this.__code = code;
	this.__message_tracker = message_tracker;

	this.__value = null;
}

Value.prototype.setValue = function(value) {

	if (value == this.__value)
		return;
	
	this.__value = value;

	this.__message_tracker.sendMessage("on_value_changed", { code : this.__code, value : this.__value });
}

//#########################################################
// VALUE TRACKER
//#########################################################

function ValueTracker(message_tracker) {

	this.__values = new Array();
	this.__message_tracker = message_tracker;
}

ValueTracker.prototype.__getValue = function(code)
{
	if (this.__values[code] == null)
		this.__values[code] = new Value(code, this.__message_tracker);

	return this.__values[code];
}
	
ValueTracker.prototype.newValue = function(code, value)
{
	var val = this.__getValue(code);

	val.setValue(value);
}