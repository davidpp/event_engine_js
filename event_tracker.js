//#########################################################
// EVENT
//#########################################################

function Event(code, message_tracker) {

	this.__code = code;
	this.__message_tracker = message_tracker;

	this.__options = new Object();
	this.__raised = false;
	this.__raise_timeout = null;
	this.__reset_timeout = null;
	this.__repeat_interval = null;
	this.__listeners = new Array();
}

Event.prototype.addListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index != -1)
		return;

	this.__listeners.push(listener);

	if (this.__raised)
		try {listener.onEventRaised(this.__code);} catch(e){}
	else
		try {listener.onEventReseted(this.__code);} catch(e){}
}

Event.prototype.removeListener = function(listener) {

	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__listeners.splice(index, 1);
}

Event.prototype.setOptions = function(options)
{
	this.__options.raise_delay = options.raise_delay;
	this.__options.reset_delay = options.reset_delay;
	this.__options.repeat_interval = options.repeat_interval;

	if ( this.__options.raise_trigger != options.raise_trigger )
	{
		if (this.__raise_timeout != null)
			window.clearTimeout(this.__raise_timeout);

		if (this.__repeat_interval != null)
			window.clearInterval(this.__repeat_interval);

		this.__raise_timeout = null;
		this.__repeat_interval = null;		

		this.__message_tracker.removeListener("onTriggerFired", this, {code:this.__options.raise_trigger});
		this.__message_tracker.removeListener("onTriggerReleased", this, {code:this.__options.raise_trigger});

		this.__options.raise_trigger = options.raise_trigger;
		this.__raised_once = false;
		this.__raised = false;
		
		this.__message_tracker.addListener("onTriggerFired", this, {code:this.__options.raise_trigger});
		this.__message_tracker.addListener("onTriggerReleased", this, {code:this.__options.raise_trigger});
	}

	if (this.__options.reset_trigger != options.reset_trigger)
	{
		if (this.__reset_timeout != null)
			window.clearTimeout(this.__reset_timeout);

		this.__reset_timeout = null;

		this.__message_tracker.removeListener("onTriggerFired", this, {code:this.__options.reset_trigger});
		this.__message_tracker.removeListener("onTriggerReleased", this, {code:this.__options.reset_trigger});

		this.__options.reset_trigger = options.reset_trigger;

		this.__message_tracker.addListener("onTriggerFired", this, {code:this.__options.reset_trigger});
		this.__message_tracker.addListener("onTriggerReleased", this, {code:this.__options.reset_trigger});
	}
}

function __onEventRepeatTriggerFire(event) {

	for(var key in event.__listeners)
		try {event.__listeners[key].onEventRepeated(event.__code);} catch(e) {}
}

function __onEventRaiseTriggerFire(event) {

	event.__raised = true;
	event.__raised_once = true;

	for(var key in event.__listeners)
		try {event.__listeners[key].onEventRaised(event.__code);} catch(e) {}

	if ( event.__options.repeat_interval > 0 ) {

		if ( event.__repeat_interval != null)
			window.clearInterval(this.__repeat_interval);
		
		event.__repeat_interval = window.setInterval(__onEventRepeatTriggerFire, event.__options.repeat_interval, event);
	}

	event.__raise_timeout = null
}

function __onEventResetTriggerFire(event) {

	event.__raised = false;

	for(var key in event.__listeners)
			try {event.__listeners[key].onEventReseted(event.__code);} catch(e) {}

	if ( event.__repeat_interval != null )
	{
		window.clearInterval(event.__repeat_interval);
		event.__repeat_interval == null
	}

	event.__reset_timeout = null;
}

Event.prototype.onTriggerFired = function(code)
{
	if (code == this.__options.raise_trigger && this.__raised == false) {		

		if (this.__raise_timeout != null)
			window.clearTimeout(this.__raise_timeout);

		this.__raise_timeout = window.setTimeout(__onEventRaiseTriggerFire, this.__options.raise_delay, this);
	}

	if (code == this.__options.reset_trigger && this.__raised == true) {

		if (this.__reset_timeout != null)
			window.clearTimeout(this.__reset_timeout);

		this.__reset_timeout = window.setTimeout(__onEventResetTriggerFire, this.__options.reset_delay, this);
	}
}

Event.prototype.onTriggerReleased = function(code)
{
	if (code == this.__options.raise_trigger)
		if (this.__raise_timeout != null)
		{
			window.clearTimeout(this.__raise_timeout);
			this.__raise_timeout = null;
		}

	if (code == this.__options.reset_trigger)
		if (this.__reset_timeout != null)
		{
			window.clearTimeout(this.__reset_timeout);
			this.__reset_timeout = null;
		}
}

//#########################################################
// EVENT TRACKER
//#########################################################

function EventTracker(message_tracker) {

	this.__message_tracker = message_tracker;

	this.__events = new Array();

	this.__message_tracker.setEmitter("onEventReseted", this);
	this.__message_tracker.setEmitter("onEventRaised", this);
	this.__message_tracker.setEmitter("onEventRepeated", this);
}

EventTracker.prototype.__getEvent = function(code)
{
	if (this.__events[code] == null)
		this.__events[code] = new Event(code, this.__message_tracker);

	return this.__events[code];
}

EventTracker.prototype.addEvent = function (code, options)
{
	var evnt = this.__getEvent(code);

	evnt.setOptions(options);
}

EventTracker.prototype.addListener = function(listener, options) {
	
	var evnt = this.__getEvent(options.code);

	evnt.addListener(listener);
}

EventTracker.prototype.removeListener = function(listener, options) {

	if (this.__events[options.code] == null)
		return;

	this.__events[options.code].removeListener(listener);
}