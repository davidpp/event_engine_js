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

	this.__message_tracker.addListener("on_event_raised", this);
	this.__message_tracker.addListener("on_event_reseted", this);
	this.__message_tracker.addListener("on_event_repeated", this);
	this.__message_tracker.addListener("on_value_changed", this);
}

Transaction.prototype.onMessage = function(code, data)
{
	switch(code)
	{
		case "on_event_raised": this.__onEventRaised(data); break;
		case "on_event_reseted": this.__onEventReseted(data); break;
		case "on_event_repeated": this.__onEventRepeated(data); break;
		case "on_value_changed": this.__onValueChanged(data.code, data.value); break;
	}
}

Transaction.prototype.setOptions = function (options) {

	this.__current_values = new Array();

	this.__options.listen_to = options.listen_to;

	this.__options.capture = options.capture;
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
	if (null != this.__input_provider && null != this.__options.capture.user)
		this.__input_provider.onInputRequired(this, this.__options.capture.user);
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

	this.__message_tracker.sendMessage("on_transaction_finalized", {code : this.__code, data:record});
}

Transaction.prototype.__onEventRaised = function(code) {

	if (this.__options.listen_to.event == code && this.__options.listen_to.stage == transaction_constants.RAISE)
		this.initiate();
}

Transaction.prototype.__onEventRepeated = function(code) {

	if (this.__options.listen_to.event == code && this.__options.listen_to.stage == transaction_constants.REPEAT)
		this.initiate();
}

Transaction.prototype.__onEventReseted = function(code) {

	if (this.__options.listen_to.event == code && this.__options.listen_to.stage == transaction_constants.RESET)
		this.initiate();
}

Transaction.prototype.__onValueChanged = function(code, value)
{
	if (this.__options.capture.system.indexOf(code) != -1)
		this.__current_values[code] = value;
}

//#########################################################
// TRANSACTION MANAGER
//#########################################################

function TransactionManager(message_tracker, input_provider) {

	this.__message_tracker = message_tracker;
	this.__input_provider = input_provider;

	this.__transactions = new Array();
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