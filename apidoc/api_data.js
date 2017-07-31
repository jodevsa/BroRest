define({ "api": [
  {
    "type": "get",
    "url": "/bro/capture/:interface/:start",
    "title": "Start Capturing network interface traffic",
    "name": "CaptureInterface",
    "group": "Capture",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Network",
            "description": "<p>Interface</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Capture session ID</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "running",
            "description": "<p>status of session</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "stderr",
            "description": "<p>capturing session stderr</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/capture.js",
    "groupTitle": "Capture"
  },
  {
    "type": "get",
    "url": "/bro/session/:id/:status",
    "title": "Check session status",
    "name": "CheckStatus",
    "group": "Session",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Session",
            "description": "<p>ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Capture session ID</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "running",
            "description": "<p>status of session</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "stderr",
            "description": "<p>capturing session stderr</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "logPath",
            "description": "<p>actual session log's directory</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "sessionNotFound",
            "description": "<p>session does not exists</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/session.js",
    "groupTitle": "Session"
  },
  {
    "type": "get",
    "url": "/bro/session/:id/:log/:offset/",
    "title": "Consume specified log depending on offset",
    "name": "ConsumeLogs",
    "group": "Session",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Session",
            "description": "<p>ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "log",
            "description": "<p>logType</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "offset",
            "description": "<p>logOfset</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "data",
            "description": "<p>consumed logs</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "sessionNotFound",
            "description": "<p>session does not exists</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/session.js",
    "groupTitle": "Session"
  },
  {
    "type": "get",
    "url": "/bro/session/active",
    "title": "Lists all active sessions",
    "name": "activeSessions",
    "group": "Session",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Session",
            "description": "<p>ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "sessions",
            "description": "<p>a list containing all sessions information.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "Count",
            "description": "<p>count of retrived active sessions</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/session.js",
    "groupTitle": "Session"
  },
  {
    "type": "get",
    "url": "/bro/session/:id/:stop",
    "title": "Stop's a running session",
    "name": "stopSession",
    "group": "Session",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Session",
            "description": "<p>ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "notice",
            "description": "<p>Results of session stop.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "optional": false,
            "field": "sessionNotFound",
            "description": "<p>session does not exists</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/session.js",
    "groupTitle": "Session"
  }
] });
