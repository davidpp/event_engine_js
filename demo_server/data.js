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
		},

		"SPEED_OVER_SPEED_LIMIT" : {
			"options" : {
				"conditions":"_speed>110"
			}
		},

		"SPEED_BELOW_SPEED_LIMIT" : {
			"options" : {
				"conditions":"_speed<110"
			}
		},

		"INSIDE_KAMLOOPS" : {
			"options" : {
				"conditions" : "((_lat - 50.6761)^2 + (_lon + 120.3408)^2)^0.5*100000<=500"
			}
		},

		"OUTSIDE_KAMLOOPS" : {
			"options" : {
				"conditions" : "((_lat - 50.6761)^2 + (_lon + 120.3408)^2)^0.5*100000>500"
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
		},

		"SPEEDING" : {
			"options" : {
				"raise_trigger" : "SPEED_OVER_SPEED_LIMIT",
				"raise_delay" : 10000,

				"reset_trigger" : "SPEED_BELOW_SPEED_LIMIT",
				"reset_delay" : 10000,

				"repeat_interval" : 0
			}
		},

		"KAMLOOPS" : {
			"options" : {
				"raise_trigger" : "INSIDE_KAMLOOPS",
				"raise_delay" : 10000,

				"reset_trigger" : "OUTSIDE_KAMLOOPS",
				"reset_delay" : 10000,

				"repeat_interval" : 0
			}
		}
	},

	"transactions" : {

		"DRIVE_START" : {
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
			"options" : {
				"automatic" : false,
				"listen_to" : {
					"event" : "DRIVE",
					"stage" : "RESET"
				},				
				"capture" : {
					"system" : ["time"]
				}
			}	
		},

		"LOAD_END" : {
			"options" : {
				"automatic" : false,
				"listen_to" : {
					"event" : "DRIVE",
					"stage" : "RESET"
				},				
				"capture" : {
					"system" : ["time"],
					"user" : ["waybill"]
				}
			}	
		},

		"SPEEDING_START" : {
			"options" : {
				"listen_to" : {
					"event" : "SPEEDING",
					"stage" : "RAISE"
				},

				"capture" : {
					"system" : ["time", "speed"]
				}
			}	
		},

		"SPEEDING_STOP" : {
			"options" : {
				"listen_to" : {
					"event" : "SPEEDING",
					"stage" : "RESET"
				},

				"capture" : {
					"system" : ["time", "speed"]
				}
			}	
		},

		"ENTER_KAMLOOPS" : {
			"options" : {
				"listen_to" : {
					"event" : "KAMLOOPS",
					"stage" : "RAISE"
				},

				"capture" : {
					"system" : ["time", "lat", "lon", "speed"]
				}
			}	
		},

		"LEAVE_KAMLOOPS" : {
			"options" : {
				"listen_to" : {
					"event" : "KAMLOOPS",
					"stage" : "RESET"
				},

				"capture" : {
					"system" : ["time", "lat", "lon", "speed"]
				}
			}	
		}
	},

	"activities" : {

		"DRIVING" : {
			"options" : {
				"start_transact" : "DRIVE_START",
				"end_transact" : "DRIVE_STOP"
			}
		},

		"LOADING" : {
			"options" : {
				"start_transact" : "LOAD_START",
				"end_transact" : "LOAD_END",
				"unique" : true
			}
		}
	}
}