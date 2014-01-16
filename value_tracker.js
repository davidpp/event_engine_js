//#########################################################
// VALUE
//#########################################################

function Value(code) {
	
	this.__code = code;
	this.__value = null;
	this.__value_set = false;
	this.__listeners = new Array();
}

Value.prototype.addListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index != -1)
		return;

	this.__listeners.push(listener);

	if (this.__value_set)
		listener.onValueChanged(this.__code, this.__value);
}

Value.prototype.removeListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__listeners.splice(index, 1);
}

Value.prototype.setValue = function(value) {

	if (true == this.__value_set && value == this.__value)
		return;

	this.__value_set = true;
	this.__value = value;

	for(var key in this.__listeners)
		this.__listeners[key].onValueChanged(this.__code, this.__value);
}

//#########################################################
// VALUE TRACKER
//#########################################################

function ValueTracker(message_tracker) {

	this.__values = new Array();

	message_tracker.setEmitter("onValueChanged", this);
}

ValueTracker.prototype.__getValue = function(code)
{
	if (this.__values[code] == null)
		this.__values[code] = new Value(code);

	return this.__values[code];
}
	
ValueTracker.prototype.newValue = function(code, value)
{
	var val = this.__getValue(code);

	val.setValue(value);
}

ValueTracker.prototype.addListener = function(listener, options) {
	
	var val = this.__getValue(options.code);

	val.addListener(listener);
}

ValueTracker.prototype.removeListener = function(listener, options) {

	if (this.__values[options.code] == null)
		return;

	this.__values[options.code].removeListener(listener);
}