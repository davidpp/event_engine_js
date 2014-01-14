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
	}
};

http.createServer(function(req, res) {

	var parts = req.url.split("/");
	var data_name = parts[1];

	if (data[data_name] == null)
	{
		res.statusCode = 404;
		res.end();
		return;
	}

	res.writeHead(200, {"Content-Type" : "application/json"});
	res.write(JSON.stringify(data[data_name]));
	res.end();

}).listen(8080, "127.0.0.1");