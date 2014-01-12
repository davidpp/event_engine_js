function Event(code, trigger_tracker) {

	this.__code = code;
	this.__trigger_tracker = trigger_tracker;

	this.__listeners = new Array();
	this.__options = new Object();

	this.__raised = false;
	this.__can_raise = false;
	this.__can_reset = false;

	this.__reset_counter = 0;
	this.__raise_counter = 0;
}

Event.prototype.setOptions = function(options)
{
	this.__trigger_tracker.removeListener(this.__options.raise_trigger, this);
	this.__trigger_tracker.removeListener(this.__options.reset_trigger, this);

	this.__options.raise_delay = options.raise_delay;
	this.__options.reset_delay = options.reset_delay;

	this.__options.repeat_interval = options.repeat_interval;

	this.__options.raise_trigger = options.raise_trigger;
	this.__options.reset_trigger = options.reset_trigger;

	this.__trigger_tracker.addListener(this.__options.raise_trigger, this);	
	this.__trigger_tracker.addListener(this.__options.reset_trigger, this);
};

Event.prototype.onTriggerFired = function(code)
{
	if (code == this.__options.raise_trigger)
	{
		this.__can_raise = true;
		this.__raise_counter = 0;
	}

	if (code == this.__options.reset_trigger)
	{
		this.__can_reset = true;
		this.__reset_counter = 0;
	}
};

Event.prototype.onTriggerReleased = function(code)
{
	if (code == this.__options.raise_trigger)
	{
		this.__can_raise = false;
		this.__raise_counter = 0;
	}

	if (code == this.__options.reset_trigger)
	{
		this.__can_reset = false;
		this.__reset_counter = 0;
	}				
}

Event.prototype.tick = function(time)
{
	// First Raise
	if ( this.__can_raise && ! this.__raised )
	{
		this.__raise_counter ++;

		if ( this.__raise_counter >= this.__options.raise_delay )
		{
			this.__raised = true;
			this.__reset_counter = 0;

			for(var key in this.__listeners)
				this.__listeners[key].onRaised(this.__code);
		}
	}

	// Repeating raises if repeat_interval is set (>0)
	if (this.__raised && this.__options.repeat_interval > 0)
	{
		this.__raise_counter ++;

		if ( this.__raise_counter % this.__options.repeat_interval == 0 )
			for(var key in this.__listeners)
				this.__listeners[key].onRepeated(this.__code);
	}

	// Reset
	if ( this.__can_reset && this.__raised )
	{
		this.__reset_counter ++;

		if (this.__reset_counter >= this.__options.reset_delay )
		{
			this.__raised = false
			this.__raise_counter = 0;

			for (var key in this.__listeners)
				this.__listeners[key].onReseted(this.__code);
		}
	}
};

Event.prototype.addListener = function(listener)
{
	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		this.__listeners.push(listener);
};

Event.prototype.removeListener = function(listener)
{
	var index = this.__listeners.indexOf(listener);

	if (index == -1)
		return;

	this.__listeners.splice(index, 1);
}

function EventTracker(trigger_tracker) {

	this.__trigger_tracker = trigger_tracker;

	this.__events = new Array();
	this.__time = 0;
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

EventTracker.prototype.tick = function() {

	this.__time ++;

	for(var key in this.__events)
		this.__events[key].tick(this.__time);
}