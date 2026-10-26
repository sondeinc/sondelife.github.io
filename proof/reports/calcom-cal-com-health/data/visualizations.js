window.__SCRIBE_VISUALIZATIONS__ = [
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Repository health source data showing {sourceFileCount, number} source files, {languageCount, number} languages, {packageManifestCount, number} package manifests, {buildConfigCount, number} build configs, {frameworkDetectionCount, number} resource detections, and {databaseSchemaCount, number} database schema artifacts.",
      "icuArgs": {
        "buildConfigCount": 210,
        "databaseSchemaCount": 604,
        "frameworkDetectionCount": 7,
        "languageCount": 7,
        "packageManifestCount": 120,
        "sourceFileCount": 6335
      },
      "msgid": "scribe.report.repositoryHealth.visualization.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Repository health source data showing {sourceFileCount, number} source files, {languageCount, number} languages, {packageManifestCount, number} package manifests, {buildConfigCount, number} build configs, {frameworkDetectionCount, number} resource detections, and {databaseSchemaCount, number} database schema artifacts."
        }
      }
    },
    "anchorId": "diagram-repository-health",
    "findingId": "finding-repository-health",
    "formats": [
      "table"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Source data",
      "icuArgs": {},
      "msgid": "scribe.report.repositoryHealth.visualization.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Source data"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The source data summarizes repository health inputs collected from {repositoryLabel}: {languages, list}, {frameworkText}, {dataEntityCount, number} data entities, {apiEndpointCount, number} API endpoints ({endpointTypeText}), {messageChannelCount, number} message channels, {configKeyCount, number} config keys, and {cicdText}.",
      "icuArgs": {
        "apiEndpointCount": 255,
        "cicdText": "50 CI/CD config files for GitHub Actions",
        "configKeyCount": 822,
        "dataEntityCount": 101,
        "endpointTypeText": "tRPC (199), REST/HTTP (56)",
        "frameworkText": "NestJS, Next.js, React, Prisma ORM, tRPC API",
        "languages": [
          "apex",
          "css",
          "javascript",
          "php",
          "prisma",
          "sql",
          "typescript"
        ],
        "messageChannelCount": 28,
        "repositoryLabel": "calcom/cal.com"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.longDescription",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The source data summarizes repository health inputs collected from {repositoryLabel}: {languages, list}, {frameworkText}, {dataEntityCount, number} data entities, {apiEndpointCount, number} API endpoints ({endpointTypeText}), {messageChannelCount, number} message channels, {configKeyCount, number} config keys, and {cicdText}."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {
      "sourceData": "data/visualization-source-data.repository-health.json"
    },
    "projection": "treemap",
    "projectionLabel": "Source data",
    "projectionLabelText": {
      "defaultLocale": "en-US",
      "defaultText": "Source data",
      "icuArgs": {},
      "msgid": "scribe.report.visualization.visualization-repository-health.projection",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Source data"
        }
      }
    },
    "renderer": "table",
    "source": {
      "id": "finding-repository-health",
      "kind": "finding",
      "name": "Repository health evidence"
    },
    "sourceDataRows": [
      {
        "label": "Source",
        "labelText": {
          "defaultLocale": "en-US",
          "defaultText": "Source",
          "icuArgs": {},
          "msgid": "scribe.report.repositoryHealth.sourceRow.source",
          "provenance": "template",
          "reviewState": "reviewed",
          "values": {
            "en-US": {
              "fallback": false,
              "reviewed": true,
              "text": "Source"
            }
          }
        },
        "value": "Files: 6335 · LOC: 260522 · Classes: 1255 · Types: 2436 · Interfaces: 768"
      },
      {
        "label": "Languages",
        "labelText": {
          "defaultLocale": "en-US",
          "defaultText": "Languages",
          "icuArgs": {},
          "msgid": "scribe.report.repositoryHealth.sourceRow.languages",
          "provenance": "template",
          "reviewState": "reviewed",
          "values": {
            "en-US": {
              "fallback": false,
              "reviewed": true,
              "text": "Languages"
            }
          }
        },
        "value": "7 · apex, css, javascript, php, prisma, sql, typescript"
      },
      {
        "label": "Frameworks",
        "labelText": {
          "defaultLocale": "en-US",
          "defaultText": "Frameworks",
          "icuArgs": {},
          "msgid": "scribe.report.repositoryHealth.sourceRow.frameworks",
          "provenance": "template",
          "reviewState": "reviewed",
          "values": {
            "en-US": {
              "fallback": false,
              "reviewed": true,
              "text": "Frameworks"
            }
          }
        },
        "value": "9 · NestJS, Next.js, React, Prisma ORM, tRPC API, EventEmitter (Node.js), Express/Fastify/Hono API Endpoints, process.env (Node.js), TypeORM"
      },
      {
        "label": "Packages and build",
        "labelText": {
          "defaultLocale": "en-US",
          "defaultText": "Packages and build",
          "icuArgs": {},
          "msgid": "scribe.report.repositoryHealth.sourceRow.packagesAndBuild",
          "provenance": "template",
          "reviewState": "reviewed",
          "values": {
            "en-US": {
              "fallback": false,
              "reviewed": true,
              "text": "Packages and build"
            }
          }
        },
        "value": "Package manifests: 120 · Build configs: 210"
      },
      {
        "label": "CI/CD",
        "labelText": {
          "defaultLocale": "en-US",
          "defaultText": "CI/CD",
          "icuArgs": {},
          "msgid": "scribe.report.repositoryHealth.sourceRow.cicd",
          "provenance": "template",
          "reviewState": "reviewed",
          "values": {
            "en-US": {
              "fallback": false,
              "reviewed": true,
              "text": "CI/CD"
            }
          }
        },
        "value": "50 · GitHub Actions"
      },
      {
        "label": "Resource detections",
        "labelText": {
          "defaultLocale": "en-US",
          "defaultText": "Resource detections",
          "icuArgs": {},
          "msgid": "scribe.report.repositoryHealth.sourceRow.resourceDetections",
          "provenance": "template",
          "reviewState": "reviewed",
          "values": {
            "en-US": {
              "fallback": false,
              "reviewed": true,
              "text": "Resource detections"
            }
          }
        },
        "value": "7 · EventEmitter (Node.js), Express/Fastify/Hono API Endpoints, Next.js API Routes, Prisma ORM, process.env (Node.js), tRPC API Procedures, TypeORM"
      },
      {
        "label": "Database model",
        "labelText": {
          "defaultLocale": "en-US",
          "defaultText": "Database model",
          "icuArgs": {},
          "msgid": "scribe.report.repositoryHealth.sourceRow.databaseModel",
          "provenance": "template",
          "reviewState": "reviewed",
          "values": {
            "en-US": {
              "fallback": false,
              "reviewed": true,
              "text": "Database model"
            }
          }
        },
        "value": "Schema artifacts: 604 · Entities: 101 · Fields: 1042 · Relationships: 409"
      },
      {
        "label": "API endpoints",
        "labelText": {
          "defaultLocale": "en-US",
          "defaultText": "API endpoints",
          "icuArgs": {},
          "msgid": "scribe.report.repositoryHealth.sourceRow.apiEndpoints",
          "provenance": "template",
          "reviewState": "reviewed",
          "values": {
            "en-US": {
              "fallback": false,
              "reviewed": true,
              "text": "API endpoints"
            }
          }
        },
        "value": "255 · tRPC (199), REST/HTTP (56)"
      },
      {
        "label": "Other runtime surfaces",
        "labelText": {
          "defaultLocale": "en-US",
          "defaultText": "Other runtime surfaces",
          "icuArgs": {},
          "msgid": "scribe.report.repositoryHealth.sourceRow.otherRuntimeSurfaces",
          "provenance": "template",
          "reviewState": "reviewed",
          "values": {
            "en-US": {
              "fallback": false,
              "reviewed": true,
              "text": "Other runtime surfaces"
            }
          }
        },
        "value": "Message channels: 28 · Config keys: 822"
      },
      {
        "label": "Sonde Performance",
        "labelText": {
          "defaultLocale": "en-US",
          "defaultText": "Sonde Performance",
          "icuArgs": {},
          "msgid": "scribe.report.repositoryHealth.sourceRow.sondePerformance",
          "provenance": "template",
          "reviewState": "reviewed",
          "values": {
            "en-US": {
              "fallback": false,
              "reviewed": true,
              "text": "Sonde Performance"
            }
          }
        },
        "value": "Analysis: 6335 files · Payload: 89.8 MB"
      }
    ],
    "visualizationId": "visualization-repository-health"
  }
]
;
