//#########################################################
// TRANSACTION
//#########################################################

var transaction_constants = {
	RAISE : "RAISE",
	REPEAT : "REPEAT",
	RESET : "RESET"
}

function Transaction(code, event_tracker, value_tracker, input_provider) {

	this.__code = code;
	this.__event_tracker = event_tracker;
	this.__value_tracker = value_tracker;
	this.__input_provider = input_provider;

	this.__options = new Object();
	this.__current_values = new Array();
	this.__listeners = new Array();
}

Transaction.prototype.setOptions = function (options) {

	// Event Options
	if (null != this.__options.listen_to)
	{
		this.__event_tracker.removeListener(this.__options.listen_to.event, this);
		this.__options.listen_to = null;
	}

	if (null != options.listen_to ) {
		this.__options.listen_to = options.listen_to;
		this.__event_tracker.addListener(this.__options.listen_to.event, this);
	}

	
	// Capture Options
	if (null != this.__options.capture)
	{
		for (var key in this.__options.capture.system)
			this.__value_tracker.removeListener(this.__options.capture.system[key], this);

		this.__options.capture = null;
		this.__current_values = new Array();
	}

	if (null != options.capture)
	{
		this.__options.capture = options.capture;

		for (var key in this.__options.capture.system)
			this.__value_tracker.addListener(this.__options.capture.system[key], this);
	}
}

Transaction.prototype.__createRecord = function()
{
	var record = new Object();

	for(var key in this.__current_values)
		record[key] = this.__current_values[key];

	return record;
}

Transaction.prototype.initiate = function()
{
	if (null != this.__options.capture.user)
		input_provider.onInputRequired(this, this.__options.capture.user);
	else
		this.__finalize();
}

Transaction.prototype.submitInputs = function(inputs)
{
	for (var key in inputs)
		this.__current_values[key] = inputs[key];

	this.__finalize();
}

Transaction.prototype.__finalize = function()
{
	var record = this.__createRecord();

	for(var key in this.__listeners)
		this.__listeners[key].onTransactRecord(this.__code, record);
}

Transaction.prototype.onRaised = function(code) {

	if (this.__options.listen_to.stage == transaction_constants.RAISE)
		this.initiate();
}

Transaction.prototype.onRepeated = function(code) {

	if (this.__options.listen_to.stage == transaction_constants.REPEAT)
		this.initiate();
}

Transaction.prototype.onReseted = function(code) {

	if (this.__options.listen_to.stage == transaction_constants.RESET)
		this.initiate();
}

Transaction.prototype.onValueChanged = function(code, value)
{
	this.__current_values[code] = value;
}

Transaction.prototype.addListener = function(listener)
{
	var index = this.__listeners.indexOf(listener);

	if (index != -1)
		return;

	this.__listeners.push(listener);
}

Transaction.prototype.removeListener = function(listener)
{
	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__listeners.splice(index, 1);
}

//#########################################################
// TRANSACTION MANAGER
//#########################################################

function TransactionManager(event_tracker, value_tracker, input_provider) {

	this.__event_tracker = event_tracker;
	this.__value_tracker = value_tracker;
	this.__input_provider = input_provider;

	this.__transactions = new Array();
}

TransactionManager.prototype.__getTransaction = function(code) {

	if (null == this.__transactions[code])
		this.__transactions[code] = new Transaction(code, this.__event_tracker, this.__value_tracker, this.__input_provider);

	return this.__transactions[code];
}

TransactionManager.prototype.addTransaction = function(code, options) {

	var transaction = this.__getTransaction(code);

	transaction.setOptions(options);
}

TransactionManager.prototype.addListener = function(code, listener)
{
	var transaction = this.__getTransaction(code);
	
	transaction.addListener(listener);
}

TransactionManager.prototype.removeListener = function(code, listener)
{
	if (this.__transactions[code] == null)
		return;

	this.__transactions[code].removeListener(listener);
}