{
	"triggers" : {
		"SPEED_OVER_DRIVE_LIMIT" : {
			"options" : {
				"conditions":"_speed>30"
			}
		},

		"SPEED_BELOW_STOP_LIMIT" : {
			"options" : {
				"conditions":"_speed<5"
			}
		}
	},

	"events" : {
		"DRIVE" : {
			"options" : {
				"raise_trigger" : "SPEED_OVER_DRIVE_LIMIT",
				"raise_delay" : 5000,

				"reset_trigger" : "SPEED_BELOW_STOP_LIMIT",
				"reset_delay" : 10000,

				"repeat_interval" : 5000
			}
		}
	},

	"transactions" : {
		"DRIVE_START" : {
			"label" : "Start driving",
			"options" : {
				"listen_to" : {
					"event" : "DRIVE",
					"stage" : "RAISE"
				},

				"capture" : {
					"system" : ["speed", "odometer"]
				}
			}	
		},

		"DRIVE_STOP" : {
			"label" : "Stop driving",
			"options" : {
				"listen_to" : {
					"event" : "DRIVE",
					"stage" : "RESET"
				},

				"capture" : {
					"system" : ["speed", "odometer" ],
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
		},

		"DRIVE" : {
			"label" : "Still driving",
			"options" : {
				"listen_to" : {
					"event" : "DRIVE",
					"stage" : "REPEAT"
				},

				"capture" : {
					"system" : ["speed"]
				}
			}	
		},

		"EXAMPLE_NO_EVENT" : {
			"label" : "This won't be invoked automatically",
			"options" : {
				"capture" : {
					"system" : ["odometer"]
				}
			}	
		},

		"EXAMPLE_NO_DATA" : {
			"label" : "This won't capture any data",
			"options" : {
					"listen_to" : {
						"event" : "DRIVE",
						"stage" : "REPEAT"
				}
			}
		}
	}
}