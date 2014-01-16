//#########################################################
// MESSAGE
//#########################################################

function Message(code) {

	this.__code = code;

	this.__listeners = new Array();
	this.__emitter = null;
}

Message.prototype.setEmitter = function(emitter)
{
	this.__emitter = emitter;

	for (var key in this.__listeners)
	{
		var listener = this.__listeners[key].listener;
		var options = this.__listeners[key].options;

		this.__emitter.addListener(listener, options);
	}

	this.__listeners = new Array();
}

Message.prototype.addListener = function(listener, options) {

	if (this.__emitter == null)
		this.__listeners.push({ "listener":listener, "options":options });
	else
		this.__emitter.addListener(listener, options);
}

Message.prototype.removeListener = function(listener, options) {

	if (this.__emitter == null) {
		// find the listener in the list and delete it;
	}	
	else
		this.__emitter.removeListener(listener, options);
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

MessageTracker.prototype.addListener = function(code, listener, options) {

	var message = this.__getMessage(code);

	message.addListener(listener, options);
}

MessageTracker.prototype.removeListener = function(code, listener, options) {

	if ( this.__messages[code] == null )
		return;

	this.__messages[code].removeListener(listener, options);
}

MessageTracker.prototype.setEmitter = function(code, emitter) {

	var message = this.__getMessage(code);

	message.setEmitter(emitter);
}