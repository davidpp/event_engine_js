//#########################################################
// ACTIVITY EVENT INSTANCE
//#########################################################

function ActivityEventInstance(code, message_tracker, listeners)
{
	this.eventTime = new Date();
	this.code = code;
	this.captured_data = new Object();

	this.__message_tracker = message_tracker;
	this.__listeners = listeners;
}

ActivityEventInstance.prototype.submitValues = function(values)
{
	for(var key in values)
		this.captured_data[key] = values[key];
}

ActivityEventInstance.prototype.finalize = function()
{
	for(var key in this.__listeners)
		try {this.__listeners[key].onActivityEventFinalized(this);} catch(e) {console.log(e.message);}
}

//#########################################################
// ACTIVITY EVENT
//#########################################################

var activity_event_constants = {
	RAISE : "RAISE",
	REPEAT : "REPEAT",
	RESET : "RESET"
};

function ActivityEvent(code, message_tracker) {

	this.__code = code;
	this.__message_tracker = message_tracker;

	this.__enabled = false;
	this.__current_values = new Array();
	this.__listeners = new Array();

	this.__options = new Object();
	this.__options.automatic = true;
	this.__options.listen_to = new Object();
	this.__options.capture = new Object();
	this.__options.capture.system = [];
	this.__options.capture.user = [];
}

ActivityEvent.prototype.addListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index != -1)
		return;

	this.__listeners.push(listener);

	if (this.__options.automatic == false && this.__enabled)
		try {listener.onActivityEventEnabled(this.__code);} catch(e) {console.log(e.message);}

	else
		try {listener.onActivityEventDisabled(this.__code);} catch(e) {console.log(e.message);}
}

ActivityEvent.prototype.removeListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__listeners.splice(index, 1);
}

ActivityEvent.prototype.setOptions = function (options) {

	this.__current_values = new Array();

	// we're reseting the options, disable the activity_event
	this.__enabled = false;
	for(var key in this.__listeners)
		try {this.__listeners[key].onActivityEventDisabled(this.__code);} catch(e) {console.log(e.message);}

	// it the automatic property is missing then set it to false
	if (null != options.automatic)
		this.__options.automatic = options.automatic;

	if (options.activityEvent != null) {

		this.__options.listen_to.stage = options.activityEvent.stage;

		if (this.__options.listen_to.event != options.activityEvent.event) {

			this.__message_tracker.removeListener("onEventRaised", this, {code:this.__options.listen_to.event});
			this.__message_tracker.removeListener("onEventReseted", this, {code:this.__options.listen_to.event});
			this.__message_tracker.removeListener("onEventRepeated", this, {code:this.__options.listen_to.event});

			this.__options.listen_to.event = options.activityEvent.event;

			this.__message_tracker.addListener("onEventRaised", this, {code:this.__options.listen_to.event});
			this.__message_tracker.addListener("onEventReseted", this, {code:this.__options.listen_to.event});
			this.__message_tracker.addListener("onEventRepeated", this, {code:this.__options.listen_to.event});
		}
	}
	else { // turn this into a manual transact if the event is not set in the options

		this.__enabled = true;
		this.__options.automatic = false;

		for(var key in this.__listeners)
			try {this.__listeners[key].onActivityEventEnabled(this.__code);} catch(e) {console.log(e.message);}
	}

	// unregister from the old values
	for (var key in this.__options.capture.system)
		this.__message_tracker.removeListener("onValueChanged", this, {code:this.__options.capture.system[key]});

	this.__options.capture.system = [];
	this.__options.capture.user = [];

	if (options.capture) {

		for(var key in options.capture) {

			var capture_config = options.capture[key];

			switch(capture_config.source)
			{
				case "system":
					this.__options.capture.system.push(capture_config.name);
					this.__message_tracker.addListener("onValueChanged", this, {code:capture_config.name});
					break;

				case "user":
					this.__options.capture.user.push(capture_config.name);
					break;
			}
		}
	}
}

ActivityEvent.prototype.invoke = function() {

	if(this.__enabled)
		this.__initiate();
}

ActivityEvent.prototype.__initiate = function() {

	var ti = new ActivityEventInstance(this.__code, this.__message_tracker, this.__listeners);

	ti.submitValues(this.__current_values);

	if (this.__options.capture.user.length > 0) {

		for (var key in this.__listeners)
			try {this.__listeners[key].onActivityEventInputRequired(ti, this.__options.capture.user);} catch(e) {console.log(e.message);}
	}
	else
		ti.finalize();
}

ActivityEvent.prototype.__enable = function() {

	this.__enabled = true;

	for(var key in this.__listeners)
		try {this.__listeners[key].onActivityEventEnabled(this.__code);} catch(e) {console.log(e.message);}
}

ActivityEvent.prototype.__disable = function() {

	this.__enabled = false;

	for(var key in this.__listeners)
		try {this.__listeners[key].onActivityEventDisabled(this.__code);} catch(e) {console.log(e.message);}
}

ActivityEvent.prototype.onEventRaised = function(code) {

	if (this.__options.automatic) {

		if (this.__options.listen_to.stage == activity_event_constants.RAISE)
			this.__initiate();
	}
	else {

		if (this.__options.listen_to.stage == activity_event_constants.RAISE)
			this.__enable();
		else
			this.__disable();
	}
}

ActivityEvent.prototype.onEventRepeated = function(code) {

	if (this.__options.automatic && this.__options.listen_to.stage == activity_event_constants.REPEAT)
		this.__initiate();
}

ActivityEvent.prototype.onEventReseted = function(code) {

	if (this.__options.automatic) {

		if (this.__options.listen_to.stage == activity_event_constants.RESET)
			this.__initiate();
	}
	else {

		if (this.__options.listen_to.stage == activity_event_constants.RESET)
			this.__enable();
		else
			this.__disable();
	}
}

ActivityEvent.prototype.onValueChanged = function(code, value)
{
	this.__current_values[code] = value;
}

ActivityEvent.prototype.isEnabled = function()
{
	return this.__enabled;
}

//#########################################################
// ACTIVITY EVENT TRACKER
//#########################################################

function ActivityEventTracker(message_tracker) {

	this.__message_tracker = message_tracker;

	this.__activity_events = new Array();

	this.__message_tracker.setEmitter("onActivityEventFinalized", this);
	this.__message_tracker.setEmitter("onActivityEventEnabled", this);
	this.__message_tracker.setEmitter("onActivityEventDisabled", this);
	this.__message_tracker.setEmitter("onActivityEventInputRequired", this);
}

ActivityEventTracker.prototype.__getActivityEvent = function(code, type) {

	if (null == this.__activity_events[code])
		this.__activity_events[code] = new ActivityEvent(code, this.__message_tracker);

	return this.__activity_events[code];
}

ActivityEventTracker.prototype.addActivityEvent = function(code, options) {

	var activity_event = this.__getActivityEvent(code);

	activity_event.setOptions(options);
}

ActivityEventTracker.prototype.invoke = function(code) {

	if (null == this.__activity_events[code])
		return;

	this.__activity_events[code].invoke();
}

ActivityEventTracker.prototype.addListener = function(listener, options) {

	var activity_event = this.__getActivityEvent(options.code);

	activity_event.addListener(listener);
}

ActivityEventTracker.prototype.removeListener = function(listener, options) {

	if (this.__activity_events[options.code] == null)
		return;

	this.__activity_events[options.code].removeListener(listener);
}