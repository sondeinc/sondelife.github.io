window.__SCRIBE_VISUALIZATIONS__ = [
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Table summary of OSCAL profile intake and catalog provenance counts.",
      "icuArgs": {},
      "msgid": "scribe.report.oscalProfileIntake.visualization.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Table summary of OSCAL profile intake and catalog provenance counts."
        }
      }
    },
    "anchorId": "diagram-oscal-profile-intake",
    "findingId": "finding-oscal-profile-intake",
    "formats": [
      "table"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "OSCAL intake summary",
      "icuArgs": {},
      "msgid": "scribe.report.oscalProfileIntake.visualization.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "OSCAL intake summary"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The visualization is a source-data table showing the count of normalized profiles, catalogs, resolved imports, dangling imports, issues, and unsupported artifacts.",
      "icuArgs": {},
      "msgid": "scribe.report.oscalProfileIntake.visualization.longDescription",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The visualization is a source-data table showing the count of normalized profiles, catalogs, resolved imports, dangling imports, issues, and unsupported artifacts."
        }
      }
    },
    "pagePath": "findings/finding-oscal-profile-intake/index.html",
    "paths": {
      "sourceData": "data/visualization-source-data.oscal-profile-intake.json"
    },
    "projection": "matrix",
    "projectionLabel": "OSCAL profile intake summary",
    "renderer": "table",
    "source": {
      "id": "finding-oscal-profile-intake",
      "kind": "finding",
      "name": "OSCAL profile intake"
    },
    "sourceDataRows": [
      {
        "label": "Profiles",
        "unit": "artifacts",
        "value": "22"
      },
      {
        "label": "Catalogs",
        "unit": "artifacts",
        "value": "23"
      },
      {
        "label": "Resolved imports",
        "unit": "links",
        "value": "22"
      },
      {
        "label": "Dangling imports",
        "unit": "links",
        "value": "0"
      },
      {
        "label": "Validation issues",
        "unit": "issues",
        "value": "0"
      },
      {
        "label": "Unsupported artifacts",
        "unit": "fail-closed",
        "value": "12"
      }
    ],
    "visualizationId": "visualization-oscal-profile-intake"
  }
]
;
