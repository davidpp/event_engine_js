//#########################################################
// ACTIVITY INSTANCE
//#########################################################

function ActivityInstance(code, data, listeners) {

	this.code = code;
	this.__listeners = listeners;

	this.start_data = new Object();
	this.end_data = new Object();

	for(var key in data)
		this.start_data[key] = data[key];

	for(var key in this.__listeners)
		if (this.__listeners[key].onActivityStarted)
			this.__listeners[key].onActivityStarted(this);
}

ActivityInstance.prototype.end = function(data) {

	for(var key in data)
		this.end_data[key] = data[key];

	for(var key in this.__listeners)
		if (this.__listeners[key].onActivityEnded)
			this.__listeners[key].onActivityEnded(this);
}

//#########################################################
// ACTIVITY
//#########################################################

function Activity(code, message_tracker) {

	this.__code = code;
	this.__message_tracker = message_tracker;

	this.__listeners = new Array();

	this.__start_transact = null;
	this.__end_transact = null;

	this.__activity_instances = new Array();
}

Activity.prototype.addListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index != -1)
		return;

	this.__listeners.push(listener);

	for (var key in this.__activity_instances)
		listener.onActivityStarted(this.__activity_instances[key]);
}

Activity.prototype.removeListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__listeners.splice(index, 1);
}

Activity.prototype.setOptions = function(options)
{
	if (this.__start_transact != options.start_transact)
	{
		this.__message_tracker.removeListener("onTransactionFinalized", this, {code:this.__start_transact});
		this.__start_transact = options.start_transact;
		this.__message_tracker.addListener("onTransactionFinalized", this, {code:this.__start_transact});
	}

	if (this.__end_transact != options.end_transact)
	{
		this.__message_tracker.removeListener("onTransactionFinalized", this, {code:this.__end_transact});
		this.__end_transact = options.end_transact;
		this.__message_tracker.addListener("onTransactionFinalized", this, {code:this.__end_transact});
	}
}

Activity.prototype.onTransactionFinalized = function(code, data) {

	if (code == this.__start_transact)
	{
		var activity_instance = new ActivityInstance(this.__code, data, this.__listeners);
		this.__activity_instances.push(activity_instance);		
	}
	else if (code == this.__end_transact)
	{
		if (this.__activity_instances.length == 1) {

			var activity_instance = this.__activity_instances[0];
			this.__activity_instances = new Array();
			activity_instance.end(data);
		}
		else {

			// we have to handle this somehow
		}
	}
}

//#########################################################
// ACTIVITY TRACKER
//#########################################################

function ActivityTracker(message_tracker) {

	this.__message_tracker = message_tracker;

	this.__activities = new Array();

	this.__message_tracker.setEmitter("onActivityStarted", this);
	this.__message_tracker.setEmitter("onActivityEnded", this);
}

ActivityTracker.prototype.__getActivity = function(code) {

	if(null == this.__activities[code])
		this.__activities[code] = new Activity(code, this.__message_tracker);

	return this.__activities[code];
}

ActivityTracker.prototype.addActivity = function(code, options) {

	var activity = this.__getActivity(code);

	activity.setOptions(options);
}
/*
ActivityTracker.prototype.start = function(code) {

	if (null == this.__activities[code])
		return;

	this.__activities[code].start();
}

ActivityTracker.prototype.end = function(code) {

	if (null == this.__activities[code])
		return;

	this.__activities[code].end();
}
*/
ActivityTracker.prototype.addListener = function(listener, options) {

	var activity = this.__getActivity(options.code);

	activity.addListener(listener);
}

ActivityTracker.prototype.removeListener = function(listener, options) {

	if (this.__activities[options.code] == null)
		return;

	this.__activities[options.code].removeListener(listener);
}