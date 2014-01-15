var sys = require('sys');
var http = require('http');

var data = {

	triggers : {
		SPEED_OVER_DRIVE_LIMIT : {
			options : {
				conditions:"_speed>30"
			}
		},

		SPEED_BELOW_STOP_LIMIT : {
			options : {
				conditions:"_speed<5"
			}
		},		
	},

	events : {
		DRIVE : {
			options : {
				raise_trigger : "SPEED_OVER_DRIVE_LIMIT",
				raise_delay : 5000,

				reset_trigger : "SPEED_BELOW_STOP_LIMIT",
				reset_delay : 10000,

				repeat_interval : 5000
			}
		},
	},

	transactions : {
		DRIVE_START : {
			options : {
				listen_to : {
					event : "DRIVE",
					stage : "RAISE"
				},

				capture : {
					system : ["speed", "odometer"]
				}
			}	
		},

		DRIVE_STOP : {
			options : {
				listen_to : {
					event : "DRIVE",
					stage : "RESET"
				},

				capture : {
					system : ["speed", "odometer" ],
					user : [
						{
							variable : "user_name",
							label : "Tell me your name"
						},
						{
							variable : "password",
							label : "Give me your password also please"
						}
					]
				}
			}
		},

		DRIVE : {
			options : {
				listen_to : {
					event : "DRIVE",
					stage : "REPEAT"
				},

				capture : {
					system : ["speed"]
				}
			}	
		}
	}
};

http.createServer(function(req, res) {

    var body = '';
    
    req.on('data', function(data) {
        body += data;
    });

    req.on('end', function() {
		switch(req.method)
		{
			case "GET":
				res.setHeader("Content-Type" , "application/json");
				res.setHeader("Access-Control-Allow-Origin", "*");
				res.end(JSON.stringify(data));
				break;

			case "POST":
				console.log(body);
				res.end();
				break;
		}
    });	

}).listen(8080, "127.0.0.1");