event_engine_js
===============
##ExpEval
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
##MessageTracker
##TriggerTracker
###Trigger Definition
```
"SPEED_OVER_DRIVE_LIMIT" : {
  "options" : {
    "conditions":"_speed>30"
  }
}
```
**SPEED_OVER_DRIVE_LIMIT:** This is the name of the trigger. Other entities that'll use this trigger will reference it by this name.
**options:** Contains the configuration options for this trigger.
**conditions:** This expression defines the condition that turns this trigger "ON". When these conditions are not met the trigger will be "OFF". When the trigger switches from "ON->OFF" it sends an "onTriggerRelease" event. When the trigger switches from "OFF->ON" it sends an "onTriggerFire" event.
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
