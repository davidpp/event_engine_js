//#########################################################
// MESSAGE
//#########################################################

function Message(code) {

	this.__code = code;
	this.__listeners = new Array();
}

Message.prototype.addListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index != -1)
		return;

	this.__listeners.push(listener);
}

Message.prototype.removeListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__listeners.splice(index, 1);
}

Message.prototype.sendMessage = function(data)
{
	for(var key in this.__listeners)
		this.__listeners[key].onMessage(this.__code, data );
}

//#########################################################
// MESSAGE TRACKER
//#########################################################

function MessageTracker() {

	this.__messages = new Array();
}

MessageTracker.prototype.__getMessage = function(code) {

	if ( this.__messages[code] == null )
		this.__messages[code] = new Message(code);

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

MessageTracker.prototype.sendMessage = function(code, data)
{
	if ( this.__messages[code] == null )
		return;

	this.__messages[code].sendMessage(data);
}