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

	this.__message_tracker.addListener("on_trigger_fired", this);
	this.__message_tracker.addListener("on_trigger_released", this);
}

Event.prototype.onMessage = function(code, data)
{
	switch(code)
	{
		case "on_trigger_fired" : this.__onTriggerFired(data); break;
		case "on_trigger_released" : this.__onTriggerReleased(data); break;
	}
}

Event.prototype.setOptions = function(options)
{
	if (this.__raise_timeout != null)
		window.clearTimeout(this.__raise_timeout);

	if (this.__reset_timeout != null)
		window.clearTimeout(this.__reset_timeout);

	if (this.__repeat_interval != null)
		window.clearInterval(this.__repeat_interval);

	this.__raised = false;
	this.__raise_timeout = null;
	this.__reset_timeout = null;
	this.__repeat_interval = null;

	this.__options.raise_delay = options.raise_delay;
	this.__options.reset_delay = options.reset_delay;

	this.__options.repeat_interval = options.repeat_interval;

	this.__options.raise_trigger = options.raise_trigger;
	this.__options.reset_trigger = options.reset_trigger;
}

function __onEventRepeatTriggerFire(event) {

	event.__message_tracker.sendMessage("on_event_repeated", event.__code);
}

function __onEventRaiseTriggerFire(event) {

	event.__raised = true;

	event.__message_tracker.sendMessage("on_event_raised", event.__code);

	if ( event.__options.repeat_interval > 0 && event.__repeat_interval == null )
		event.__repeat_interval = window.setInterval(__onEventRepeatTriggerFire, event.__options.repeat_interval, event);

	event.__raise_timeout = null
}

function __onEventResetTriggerFire(event) {

	event.__raised = false;

	event.__message_tracker.sendMessage("on_event_reseted", event.__code);

	if ( event.__repeat_interval != null )
	{
		window.clearInterval(event.__repeat_interval);
		event.__repeat_interval == null
	}

	this.__reset_timeout = null;
}

Event.prototype.__onTriggerFired = function(code)
{
	if (code == this.__options.raise_trigger && this.__raised == false)
		if (this.__raise_timeout == null)
			this.__raise_timeout = window.setTimeout(__onEventRaiseTriggerFire, this.__options.raise_delay, this);

	if (code == this.__options.reset_trigger && this.__raised == true)
		if (this.__reset_timeout == null)
			this.__reset_timeout = window.setTimeout(__onEventResetTriggerFire, this.__options.reset_delay, this);
}

Event.prototype.__onTriggerReleased = function(code)
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