event_engine_js
===============
<h2>ExpEval</h2>
A simple expression evaluator.
<ul>
    <li>Supported operations are: || && == != <= < >= > + - * / % ^
    <li>The use of paranthesis are also supported
    <li>Variable names start with an under-score (e.g _thisIsAVariable)
    <li>Everything else is considered a constant
    <li>White spaces are allowed between symbols
</ul>
```
var expression ="_a + 2 == _b && 3 - 2 ==   _c";
var test_eval = new ExpEval(expression, {
    onNeedValue : function(valueName) {
      switch(valueName) {
        case "a" : return 1;
        case "b" : return 3;
        case "c" : return 1;
      }
    }
  });
test_eval.evaluate(); // will return true
```
<h2>MessageTracker</h2>
Emitter / Listener based message bus.

An emiter registers itself to the bus by calling the setEmitter method with a specific code (message identifier) that it emits.

A listener registers for a specific code by calling the addListener method, and it can stop listening for that message by calling the removeListener method.

When a listener registers for a message, the MessageTracker finds the emitter for that message and calls it's addListener method with the arguments the actual listener passed in. So it acts as the middle man for the addListener calls not the actual messages.

Emitters have to implement the following functions:
```
function addListener(listener, options)
function removeListener(listener, options)
```

Listeners have to implement the specific callback functions that are defined by the emitter of the message they subscribe to.

<b>Example</b>
```
//Create a message tracker
var message_tracker = new MessageTracker();

//Set the emitter for the message "my_message"
message_tracker.setEmitter("my_message", {
    
    addListener : function(listener, options) {
        add listener to the local listeners list
    },

    removeListener : function(listener, options) {
        remove listener from the local listeners list
    },
    
    someFunctionToCallTheEvent : function() {
        for(var key in this.__listeners)
            this.__listeners[key].onMyMessage("what's up?");
    }
});

//Add a listener for the "my_message" message
message_tracker.addListener("my_message", {
    onMyMessage : function(some_var) {
        // message received, do something with it...
    }
});
```

<h2>ValueTracker</h2>
Keeps track of the values that are given to it and calls the subscribed listeners when a value changes.

<h3>Emits</h3>
<b>onValueChanged: <b> ```onValueChanged(code, value)```

<h2>TriggerTracker</h2>
Triggers are a entities that turn on and off based on the conditions that are defined for them. When their state changes, they emit messages.

<h3>Emits</h3>
<b>onTriggerFired: </b> ```onTriggerFired(code)```<br>
<b>onTriggerReleased: </b> ```onTriggerReleased(code)```

<b>Example Trigger Definition</b>
```
"SPEED_OVER_DRIVE_LIMIT" : {
    "options" : {
        "conditions" : "_speed>30"
    }
}
```
<b>SPEED_OVER_DRIVE_LIMIT: </b>This is the name of the trigger. Other entities that'll use this trigger will reference it by this name.<br>
<b>options: </b>Contains the configuration options for this trigger.<br>
<b>conditions: </b>This expression defines the condition that turns this trigger "ON". When these conditions are not met the trigger will be "OFF". When the trigger switches from "ON->OFF" it sends an "onTriggerRelease" event. When the trigger switches from "OFF->ON" it sends an "onTriggerFire" event.<br>

##EventTracker
###Event Definition
```
"DRIVE" : {
  "options" : {
    "raise_trigger" : "SPEED_OVER_DRIVE_LIMIT",
    "raise_delay" : 5000,

    "reset_trigger" : "SPEED_BELOW_STOP_LIMIT",
    "reset_delay" : 10000,

    "repeat_interval" : 5000
  }
}
```
##TransactionManager
###Transact Definition
```
"DRIVE_START" : {
  "label" : "Start driving",
  "options" : {
    "automatic" : true,
    "listen_to" : {
    "event" : "DRIVE",
    "stage" : "RAISE"
  },
  "capture" : {
    "system" : ["speed", "odometer"]
    "user" : [
      {
        "variable" : "user_name",
        "label" : "Tell me your name"
      },
      {
        "variable" : "password",
        "label" : "Give me your password also please"
      }
    ]    
  }
}	
}
```
