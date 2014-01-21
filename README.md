<h1>event_engine_js</h1>

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

<h2>EventTracker</h2>
Events are entities that turn on and off based on the triggers they are listening to and the time constraints that they are setup with. An event switches on when it's raise_trigger switches on and stays that way for raise_delay milliseconds. It switches off when it's reset_trigger switches on and stays that way for resey_delay milliseconds. Event will emit an "onEventRaised" message when it switches on, it will emit an "onEventReset" when it switches off. If the "repeat_interval" is greater than 0 then based on its value, an additional "onEventRepeat" message will be emitted periodically. 

<h3>Emits</h3>
<b>onEventReseted: </b> ```onEventReseted(code)```<br>
<b>onEventRaised: </b> ```onEventRaised(code)```<br>
<b>onEventRepeated: </b> ```onEventRepeated(code)```<br>

<b>Example Event Definition</b>
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
<b>DRIVE: </b>Name of the event. This will be used to refer to this event.<br>
<b>options: </b>Contains the configuration options<br>
<b>raise_trigger: </b> trigger that will shitch this event on<br>
<b>raise_delay: </b> raise_trigger has to stay on for this many milliseconds before this event switches on<br>
<b>reset_trigger: </b> trigger that will shitch this event off<br>
<b>reset_delay: </b> reset_trigger has to stay on for this many milliseconds before this event switches off<br>
<b>repeat_interval: </b> An additional message will be emited every repeat_interval milliseconds if this is greater than 0<br>

<h2>TransactionManager</h2>

Transactions capture information and emmit an onTransactionFinalized message when they are invoked.<br>
A transaction can be invoked automatically buy binding it to an event or it can be invoked manually by calling the invoke method of the TransactionManager.<br>
If the transaction is set to manual but still is bound to an event than the event is used to enable or disable the transaction

<h3>Emits</h3>
<b>onTransactionFinalized: </b> ```onTransactionFinalized(code, captured_data)```<br>
Emitted when the transaction is invoked and all the data it needs to capture is captured.<br>
<b>onTransactionEnabled: </b> ```onTransactionEnabled(code)```<br>
Emitted when the bound event condition is satisfied if the transaction is manual.<br>
<b>onTransactionDisabled: </b> ```onTransactionDisabled(code)```<br>
Emitted when the bound event condition is not satisfied if the transaction is manual.<br>
<b>onTransactionInputRequired: </b> ```onTransactionInputRequired(transaction_instance, list_of_required_values)```<br>
Emitted when the transaction needs to capture additional data that can't be obtained from the ValueTracker (i.e. user inputs)<br>

<b>Example Transact Definition</b>
```
"DRIVE_START" : {
    "options" : {
        "automatic" : true,
        
        "listen_to" : {
            "event" : "DRIVE",
            "stage" : "RAISE"
        },
        
        "capture" : {
            "system" : ["speed", "odometer"],
            "user" : ["user_name", "password"]
        }
    }
}
```

<b>DRIVE_START: </b>Name of the transaction<br>
<b>options: </b>Contains the configuration options for the transaction<br>
<b>automatic: </b>Declares the transaction as eigther automatic or manual<br>
<b>listen_to: </b>The event binding options<br>
<b>event: </b>Name of the event to invoke this transaction (or enable it if the transaction is manual)<br>
<b>stage: </b>Stage (raise, reset, repeat) of the event to invoke this transaction (or enable it if the transaction is manual. only raise and reset are relevant for manual events)<br>
<b>capture: </b>Data capture configuration<br>
<b>system: </b>Data to be captured from the system (a.k.a. ValueTracker)<br>
<b>user: </b>Data to be captured from the user<br>

<h2>ActivityTracker</h2>
Activities are stateful entities that have start and end operations that are triggered automatically by binding them to transactions. There can be multiple activities going on at the same time. these can be different activities or multiple instances of the same activity.

<h3>Emits</h3>
<b>onActivityStarted: </b> ```onActivityStarted(code, end_transact, activity_instance)```<br>
When an activity starts<br>
 <b>code</b> the activity name<br>
 <b>end_transaction</b> the name of the transaction that will end this activity<br>
 <b>activity_instance</b>the activity instance that has a guid and holds the data that was captured<br>
<b>onActivityEnded: </b> ```onActivityEnded(code, activity_instance)```<br>
When activity ends<br>
 <b>code</b> the activity name<br>
 <b>activity_instance</b>the activity instance that has a guid and holds the data that was captured<br>
<b>onActivityPick: </b> ```onActivityPick(code, activity_instance, data)```<br>
When there is multiple instances of an activity available when the end transaction is invoked. The listener of this message has to tell the system which activity is the one that needs to be ended. The listener does this by returning true when the activity_instance is the one it wants to end<br>
<b>code</b> the activity name<br>
<b>activity_instance</b>the activity instance that has a guid and holds the data that was captured<br>
<b>data</b>the data that was captured by the end transaction<br>

<b>Example Activity Definition</b>
```
"LOADING" : {
    "options" : {
        "start_transact" : "LOAD_START",
        "end_transact" : "LOAD_END"
    }
}
```
<b>LOADING: </b>Name of this activity<br>
<b>options: </b>Contains the configuration options<br>
<b>start_transact: </b>The transaction that'll cause this activity to start<br>
<b>end_transact: </b>The transaction that'll cause this activity to end<br>
