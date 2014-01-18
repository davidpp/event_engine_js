//#########################################################
// ACTIVITY INSTANCE
//#########################################################

function ActivityInstance(code, data, listeners, instances, end_transact) {

	this.guid = uuid.v4();
	this.code = code;
	this.end_transact = end_transact;
	this.__listeners = listeners;
	this.__instances = instances;

	this.__instances.push(this);

	this.start_data = new Object();
	this.end_data = new Object();

	for(var key in data)
		this.start_data[key] = data[key];

	for(var key in this.__listeners)
		try {this.__listeners[key].onActivityStarted(this);} catch(e) {}
}

ActivityInstance.prototype.end = function(data) {

	for(var key in data)
		this.end_data[key] = data[key];

	for(var key in this.__listeners)
		try {this.__listeners[key].onActivityEnded(this);} catch(e) {}

	var index = this.__instances.indexOf(this);
	if (index != -1)
		this.__instances.splice(index, 1);
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

Activity.prototype.__getActivityInstaceList = function(code) {

	if (this.__activity_instances[code] == null)
		this.__activity_instances[code] = new Array();

	return this.__activity_instances[code];
}

Activity.prototype.onTransactionFinalized = function(code, data) {

	if (code == this.__start_transact) {

		var instanceList = this.__getActivityInstaceList(this.__code);

		var activity_instance = new ActivityInstance(this.__code, data, this.__listeners, instanceList, this.__end_transact);
	}
	else if (code == this.__end_transact) {

		var instanceList = this.__activity_instances[this.__code];
		if (null == instanceList)
			return;
		
		if ( instanceList.length == 1) {

			var activity_instance = instanceList[0];
			activity_instance.end(data);
		}
		else {

			for(var key in this.__listeners)
				try {this.__listeners[key].onActivityPick(instanceList, data);} catch(e) {}
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
	this.__message_tracker.setEmitter("onActivityPick", this);
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

ActivityTracker.prototype.addListener = function(listener, options) {

	var activity = this.__getActivity(options.code);

	activity.addListener(listener);
}

ActivityTracker.prototype.removeListener = function(listener, options) {

	if (this.__activities[options.code] == null)
		return;

	this.__activities[options.code].removeListener(listener);
}