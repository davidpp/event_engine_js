//#########################################################
// TRANSACTION INSTANCE
//#########################################################

function TransactionInstance(code, message_tracker, listeners)
{
	this.__code = code;
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
		this.__listeners[key].onTransactionFinalized(this.__code, this.__values);
}

//#########################################################
// TRANSACTION
//#########################################################

var transaction_constants = {
	RAISE : "RAISE",
	REPEAT : "REPEAT",
	RESET : "RESET"
}

function Transaction(code, message_tracker, input_provider) {

	this.__code = code;
	this.__message_tracker = message_tracker;
	this.__input_provider = input_provider;

	this.__options = new Object();
	this.__current_values = new Array();
	this.__listeners = new Array();
}

Transaction.prototype.addListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index != -1)
		return;

	this.__listeners.push(listener);
}

Transaction.prototype.removeListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__listeners.splice(index, 1);
}

Transaction.prototype.setOptions = function (options) {

	this.__current_values = new Array();
	
	if (null != this.__options.listen_to) {

		this.__message_tracker.removeListener("onEventRaised", this, {code:this.__options.listen_to.event});
		this.__message_tracker.removeListener("onEventReseted", this, {code:this.__options.listen_to.event});
		this.__message_tracker.removeListener("onEventRepeated", this, {code:this.__options.listen_to.event});
	}

	this.__options.listen_to = options.listen_to;

	if (null != this.__options.listen_to) {

		this.__message_tracker.addListener("onEventRaised", this, {code:this.__options.listen_to.event});
		this.__message_tracker.addListener("onEventReseted", this, {code:this.__options.listen_to.event});
		this.__message_tracker.addListener("onEventRepeated", this, {code:this.__options.listen_to.event});
	}

	if (null != this.__options.capture && null != this.__options.capture.system ) {

		for (var key in this.__options.capture.system)
			this.__message_tracker.removeListener("onValueChanged", this, {code:this.__options.capture.system[key]});
	}

	this.__options.capture = options.capture;

	if (null != this.__options.capture && null != this.__options.capture.system ) {
		
		for (var key in this.__options.capture.system)
			this.__message_tracker.addListener("onValueChanged", this, {code:this.__options.capture.system[key]});
	}
}

Transaction.prototype.initiate = function() {

	var ti = new TransactionInstance(this.__code, this.__message_tracker, this.__listeners);

	ti.submitValues(this.__current_values);

	if (null != this.__input_provider && null != this.__options.capture && null != this.__options.capture.user)
		this.__input_provider.onInputRequired(ti, this.__options.capture.user);
	else
		ti.finalize();
}

Transaction.prototype.onEventRaised = function(code) {

	if (this.__options.listen_to.stage == transaction_constants.RAISE)
		this.initiate();
}

Transaction.prototype.onEventRepeated = function(code) {

	if (this.__options.listen_to.stage == transaction_constants.REPEAT)
		this.initiate();
}

Transaction.prototype.onEventReseted = function(code) {

	if (this.__options.listen_to.stage == transaction_constants.RESET)
		this.initiate();
}

Transaction.prototype.onValueChanged = function(code, value)
{
	this.__current_values[code] = value;
}

//#########################################################
// TRANSACTION MANAGER
//#########################################################

function TransactionManager(message_tracker, input_provider) {

	this.__message_tracker = message_tracker;
	this.__input_provider = input_provider;

	this.__transactions = new Array();

	this.__message_tracker.setEmitter("onTransactionFinalized", this);
}

TransactionManager.prototype.__getTransaction = function(code) {

	if (null == this.__transactions[code])
		this.__transactions[code] = new Transaction(code, this.__message_tracker, this.__input_provider);

	return this.__transactions[code];
}

TransactionManager.prototype.addTransaction = function(code, options) {

	var transaction = this.__getTransaction(code);

	transaction.setOptions(options);
}

TransactionManager.prototype.invoke = function(code) {

	if (null == this.__transactions[code])
		return;

	this.__transactions[code].initiate();
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