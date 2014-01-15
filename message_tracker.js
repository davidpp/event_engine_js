//#########################################################
// MESSAGE
//#########################################################

function Message(code) {

	this.__code = code;
	this.__listeners = new Array();

	this.__data = null;
	this.__data_set = false;
}

Message.prototype.addListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index != -1)
		return;

	this.__listeners.push(listener);

	if (this.__data_set == true)
		listener.onMessage(this.__code, this.__data);
}

Message.prototype.removeListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__listeners.splice(index, 1);
}

Message.prototype.sendMessage = function(data)
{
	this.__data = data;
	this.__data_set = true;

	for(var key in this.__listeners)
		this.__listeners[key].onMessage(this.__code, data );
}

//#########################################################
// MESSAGE TRACKER
//#########################################################

function MessageTracker() {

	this.__messages = new Array();
	this.__master_listeners = new Array();
}

MessageTracker.prototype.__getMessage = function(code) {

	if ( this.__messages[code] == null )
	{
		this.__messages[code] = new Message(code);
		this.__messages[code].addListener(this);
	}

	return this.__messages[code];
}

MessageTracker.prototype.addListener = function(code, listener) {

	var message = this.__getMessage(code);

	message.addListener(listener);
}

MessageTracker.prototype.removeListener = function(code, listener) {

	if ( this.__messages[code] == null )
		return;

	this.__messages[code].removeListener(listener);
}

MessageTracker.prototype.sendMessage = function(code, data) {
	if ( this.__messages[code] == null )
		return;

	this.__messages[code].sendMessage(data);
}

MessageTracker.prototype.addMasterListener = function(listener) {

	if (this.__master_listeners.indexOf(listener) != -1)
		return;

	this.__master_listeners.push(listener);
}

MessageTracker.prototype.removeMasterListener = function(listener) {

	var index = this.__master_listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__master_listeners.splice(index, 1);
}

MessageTracker.prototype.onMessage = function(code, data) {

	for(var key in this.__master_listeners)
		this.__master_listeners[key].onMessage(code, data);
}