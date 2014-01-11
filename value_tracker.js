function Value(code) {
	
	this.__code = code;
	this.__value = null;
	this.__listeners = new Array();
}

Value.prototype.setValue = function(value) {

	if (value == this.__value)
		return;
	
	this.__value = value;

	for (var key in this.__listeners)
		this.__listeners[key].onValueChanged(this.__code, this.__value);
}

Value.prototype.addListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index != -1)
		return;

	this.__listeners.push(listener);

	listener.onValueChanged(this.__code, this.__value);
};

Value.prototype.removeListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__listeners.splice(index, 1);
}

function ValueTracker() {

	this.__values = new Array();
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

ValueTracker.prototype.addListener = function(code, listener) 
{
	var val = this.__getValue(code);

	val.addListener(listener);
}

ValueTracker.prototype.removeListener = function(code, listener)
{
	if (this.__values[code] == null)
		return;

	this.__values[code].removeListener(listener);
}