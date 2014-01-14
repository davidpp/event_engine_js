//#########################################################
// EVENT
//#########################################################

function Event(code, trigger_tracker) {

	this.__code = code;
	this.__trigger_tracker = trigger_tracker;

	this.__listeners = new Array();
	this.__options = new Object();

	this.__raised = false;
	this.__raise_timeout = null;
	this.__reset_timeout = null;
	this.__repeat_interval = null;
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

	this.__trigger_tracker.removeListener(this.__options.raise_trigger, this);
	this.__trigger_tracker.removeListener(this.__options.reset_trigger, this);

	this.__options.raise_delay = options.raise_delay;
	this.__options.reset_delay = options.reset_delay;

	this.__options.repeat_interval = options.repeat_interval;

	this.__options.raise_trigger = options.raise_trigger;
	this.__options.reset_trigger = options.reset_trigger;

	this.__trigger_tracker.addListener(this.__options.raise_trigger, this);	
	this.__trigger_tracker.addListener(this.__options.reset_trigger, this);
}

function __onEventRepeatTriggerFire(event) {

	for(var key in event.__listeners)
		event.__listeners[key].onRepeated(event.__code);
}

function __onEventRaiseTriggerFire(event) {

	event.__raised = true;

	for(var key in event.__listeners)
		event.__listeners[key].onRaised(event.__code);

	if ( event.__options.repeat_interval > 0 && event.__repeat_interval == null )
		event.__repeat_interval = window.setInterval(__onEventRepeatTriggerFire, event.__options.repeat_interval, event);

	event.__raise_timeout = null
}

function __onEventResetTriggerFire(event) {

	event.__raised = false;

	for (var key in event.__listeners)
		event.__listeners[key].onReseted(event.__code);

	if ( event.__repeat_interval != null )
	{
		window.clearInterval(event.__repeat_interval);
		event.__repeat_interval == null
	}

	this.__reset_timeout = null;
}

Event.prototype.onTriggerFired = function(code)
{
	if (code == this.__options.raise_trigger && this.__raised == false)
		if (this.__raise_timeout == null)
			this.__raise_timeout = window.setTimeout(__onEventRaiseTriggerFire, this.__options.raise_delay, this);

	if (code == this.__options.reset_trigger && this.__raised == true)
		if (this.__reset_timeout == null)
			this.__reset_timeout = window.setTimeout(__onEventResetTriggerFire, this.__options.reset_delay, this);
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

Event.prototype.addListener = function(listener)
{
	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		this.__listeners.push(listener);
}

Event.prototype.removeListener = function(listener)
{
	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__listeners.splice(index, 1);
}

//#########################################################
// EVENT TRACKER
//#########################################################

function EventTracker(trigger_tracker) {

	this.__trigger_tracker = trigger_tracker;

	this.__events = new Array();
}

EventTracker.prototype.__getEvent = function(code)
{
	if (this.__events[code] == null)
		this.__events[code] = new Event(code, this.__trigger_tracker);

	return this.__events[code];
}

EventTracker.prototype.addEvent = function (code, options)
{
	var evnt = this.__getEvent(code);

	evnt.setOptions(options);
}

EventTracker.prototype.addListener = function(code, listener)
{
	var evnt = this.__getEvent(code);

	evnt.addListener(listener);
}

EventTracker.prototype.removeListener = function(code, listener)
{
	if (this.__events[code] == null)
		return null;

	this.__events[code].removeListener(listener);
}