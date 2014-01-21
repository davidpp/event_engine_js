//#########################################################
// ACTIVITY INSTANCE
//#########################################################

function ActivityInstance(activity) {

	this.__activity = activity;

	this.guid = uuid.v4();
	this.ended = false;
	this.started = false;
}

ActivityInstance.prototype.start = function(data) {

	if (this.started)
		return;

	this.started = true;

	this.start_data = data;
	this.onStart(this.__activity);
}

ActivityInstance.prototype.end = function(data) {

	if (this.ended)
		return;

	this.ended = true;

	this.end_data = data;
	this.onEnd(this.__activity);
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
		try {listener.onActivityStarted(this.__code, this.__end_transact, this.__activity_instances[key]);} catch(e) {}
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

	if (code == this.__start_transact) {

		var activity_instance = new ActivityInstance(this);

		activity_instance.onStart = function(activity) {

			var index = activity.__activity_instances.indexOf(this);
			if (index == -1)
				activity.__activity_instances.push(this);

			for(var key in activity.__listeners)
				try {activity.__listeners[key].onActivityStarted(activity.__code, activity.__end_transact, this);} catch(e) {}
		}

		activity_instance.onEnd = function(activity) {

			var index = activity.__activity_instances.indexOf(this);
			if (index != -1)
				activity.__activity_instances.splice(index, 1);

			for(var key in activity.__listeners)
				try {activity.__listeners[key].onActivityEnded(activity.__code, this);} catch(e) {}
		}

		activity_instance.start(data);
	}
	else if (code == this.__end_transact) {

		if ( this.__activity_instances.length == 0 )
			return;

		if ( this.__activity_instances.length == 1) {

			this.__activity_instances[0].end(data);
		}
		else {

			var activity_instances = this.__activity_instances.slice();
			for(var key in this.__listeners)
				for(var key2 in activity_instances) {

					var activity_instance =  activity_instances[key2];
					if (activity_instance.ended)
						continue;
					
					try {

						var complete = this.__listeners[key].onActivityPick(this.__code, activity_instance, data);
						if (complete)
							activity_instance.end(data);
					}
					catch(e) {}
				}
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

ActivityTracker.prototype.addActivityInstance = function(code, ActivityInstance)
{
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