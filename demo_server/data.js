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
					"system" : ["time", "speed", "odometer"]
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
					"system" : ["time", "speed", "odometer"]
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
					"system" : ["time", "speed"]
				}
			}	
		},

		"LOAD_START" : {
			"label" : "Start loading",
			"options" : {
				"capture" : {
					"system" : ["time"]
				}
			}	
		},

		"LOAD_END" : {
			"label" : "Finished loading",
			"options" : {
				"capture" : {
					"system" : ["time"],
					"user" : ["waybill"]
				}
			}	
		}
	},

	"activities" : {
		"DRIVING" : {
			"label" : "Driving Activity",
			"options" : {
				"start_transact" : "DRIVE_START",
				"end_transact" : "DRIVE_STOP"
			}
		},

		"LOADING" : {
			"label" : "Loading Activity",
			"options" : {
				"start_transact" : "LOAD_START",
				"end_transact" : "LOAD_END"
			}
		}
	}
}