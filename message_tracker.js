//#########################################################
// MESSAGE
//#########################################################

function Message(code) {

	this.__code = code;

	this.__listeners = new Array();
	this.__emitter = null;
}

Message.prototype.setEmitter = function(emitter) {
	
	if (this.__emitter == emitter)
		return;

	for (var key in this.__listeners)
	{
		var listener = this.__listeners[key].listener;
		var options = this.__listeners[key].options;

		if (this.__emitter.removeListener)
			this.__emitter.removeListener(listener, options);

		emitter.addListener(listener, options);
	}

	this.__emitter = emitter;
}

Message.prototype.__listenerIndex = function(listener) {

	var index = -1;

	for (var i = this.__listeners.length -1 ; i > -1 ; i--)
		if ( this.__listeners[i].listener == listener ) {
			index = i;
			break;
		}

	return index;
}

Message.prototype.addListener = function(listener, options) {

	var index = this.__listenerIndex(listener);

	if ( index == -1)
		this.__listeners.push({ "listener":listener, "options":options });

	if (this.__emitter != null)
		this.__emitter.addListener(listener, options);
}

Message.prototype.removeListener = function(listener, options) {

	var index = this.__listenerIndex(listener);

	if ( index != -1)
		this.__listeners.splice(index, 1);

	if (this.__emitter != null)
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