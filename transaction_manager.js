//#########################################################
// TRANSACTION INSTANCE
//#########################################################

function TransactionInstance(code, message_tracker, listeners)
{
	this.code = code;
	this.__message_tracker = message_tracker;
	this.__listeners = listeners;

	this.__values = new Object();
}

TransactionInstance.prototype.submitValues = function(values)
{
	for(var key in values)
		this.__values[key] = values[key];
}

TransactionInstance.prototype.finalize = function()
{
	for(var key in this.__listeners)
		if(this.__listeners[key].onTransactionFinalized)
			this.__listeners[key].onTransactionFinalized(this.code, this.__values);
}

//#########################################################
// TRANSACTION
//#########################################################

var event_transaction_constants = {
	RAISE : "RAISE",
	REPEAT : "REPEAT",
	RESET : "RESET"
};

function EventTransaction(code, message_tracker) {

	this.__code = code;
	this.__message_tracker = message_tracker;

	this.__enabled = false;	
	this.__current_values = new Array();
	this.__listeners = new Array();
	
	this.__options = new Object();
	this.__options.automatic = true;
	this.__options.listen_to = new Object();
	this.__options.capture = new Object();
}

EventTransaction.prototype.addListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index != -1)
		return;

	this.__listeners.push(listener);

	if (this.__options.automatic == false && this.__enabled) {

			if(listener.onTransactionEnabled)
				listener.onTransactionEnabled(this.__code);
	}
	else if (listener.onTransactionDisabled)
			listener.onTransactionDisabled(this.__code);
}

EventTransaction.prototype.removeListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__listeners.splice(index, 1);
}

EventTransaction.prototype.setOptions = function (options) {

	this.__current_values = new Array();

	// we're reseting the options, disable the transaction
	this.__enabled = false;
	for(var key in this.__listeners)
		if (this.__listeners[key].onTransactionDisabled)
			this.__listeners[key].onTransactionDisabled(this.__code);	

	// it the automatic property is missing then set it to false
	if (null != options.automatic)
		this.__options.automatic = options.automatic;

	if (options.listen_to != null) {

		this.__options.listen_to.stage = options.listen_to.stage;

		if (this.__options.listen_to.event != options.listen_to.event) {
		
			this.__message_tracker.removeListener("onEventRaised", this, {code:this.__options.listen_to.event});
			this.__message_tracker.removeListener("onEventReseted", this, {code:this.__options.listen_to.event});
			this.__message_tracker.removeListener("onEventRepeated", this, {code:this.__options.listen_to.event});
		
			this.__options.listen_to.event = options.listen_to.event;

			this.__message_tracker.addListener("onEventRaised", this, {code:this.__options.listen_to.event});
			this.__message_tracker.addListener("onEventReseted", this, {code:this.__options.listen_to.event});
			this.__message_tracker.addListener("onEventRepeated", this, {code:this.__options.listen_to.event});
		}
	}
	else { // turn this into a manual transact if the event is not set in the options

		this.__enabled = true;
		this.__options.automatic = false;

		for(var key in this.__listeners)
			if (this.__listeners[key].onTransactionEnabled)
				this.__listeners[key].onTransactionEnabled(this.__code);
	}

	// unregister from the old values
	for (var key in this.__options.capture.system)
		this.__message_tracker.removeListener("onValueChanged", this, {code:this.__options.capture.system[key]});

	if (options.capture) {

		this.__options.capture.system = options.capture.system;
		this.__options.capture.user = options.capture.user;

		// unregister for the new values
		if (options.capture.system)
			for (var key in this.__options.capture.system)
				this.__message_tracker.addListener("onValueChanged", this, {code:this.__options.capture.system[key]});
	}
}

EventTransaction.prototype.invoke = function() {

	if(this.__enabled)
		this.__initiate();
}

EventTransaction.prototype.__initiate = function() {

	var ti = new TransactionInstance(this.__code, this.__message_tracker, this.__listeners);

	ti.submitValues(this.__current_values);

	if (null != this.__options.capture.user) {

		for (var key in this.__listeners)
			if (this.__listeners[key].onInputRequired)
				this.__listeners[key].onInputRequired(ti, this.__options.capture.user);
	}
	else
		ti.finalize();
}

EventTransaction.prototype.onEventRaised = function(code) {

	if (this.__options.automatic) {

		if (this.__options.listen_to.stage == event_transaction_constants.RAISE)
			this.__initiate();
	}
	else {

		this.__enabled = true;
	
		for(var key in this.__listeners)
			if (this.__listeners[key].onTransactionEnabled)
				this.__listeners[key].onTransactionEnabled(this.__code);
	}			
}

EventTransaction.prototype.onEventRepeated = function(code) {

	if (this.__options.automatic && this.__options.listen_to.stage == event_transaction_constants.REPEAT)
		this.__initiate();
}

EventTransaction.prototype.onEventReseted = function(code) {

	if (this.__options.automatic) {

		if (this.__options.listen_to.stage == event_transaction_constants.RESET)
			this.__initiate();
	}
	else {

		this.__enabled = false;
	
		for(var key in this.__listeners)
			if (this.__listeners[key].onTransactionDisabled)
				this.__listeners[key].onTransactionDisabled(this.__code);
	}			
}

EventTransaction.prototype.onValueChanged = function(code, value)
{
	this.__current_values[code] = value;
}

EventTransaction.prototype.isEnabled = function()
{
	return this.__enabled;
}

//#########################################################
// TRANSACTION MANAGER
//#########################################################

function TransactionManager(message_tracker) {

	this.__message_tracker = message_tracker;

	this.__transactions = new Array();

	this.__message_tracker.setEmitter("onTransactionFinalized", this);
	this.__message_tracker.setEmitter("onTransactionEnabled", this);
	this.__message_tracker.setEmitter("onTransactionDisabled", this);
	this.__message_tracker.setEmitter("onInputRequired", this);
}

TransactionManager.prototype.__getTransaction = function(code, type) {

	if (null == this.__transactions[code])
		this.__transactions[code] = new EventTransaction(code, this.__message_tracker);

	return this.__transactions[code];
}

TransactionManager.prototype.addTransaction = function(code, options) {

	var transaction = this.__getTransaction(code);

	transaction.setOptions(options);
}

TransactionManager.prototype.invoke = function(code) {

	if (null == this.__transactions[code])
		return;

	this.__transactions[code].invoke();
}

TransactionManager.prototype.addListener = function(listener, options) {
	
	var transaction = this.__getTransaction(options.code);

	transaction.addListener(listener);
}

TransactionManager.prototype.removeListener = function(listener, options) {

	if (this.__transactions[options.code] == null)
		return;

	this.__transactions[options.code].removeListener(listener);
}