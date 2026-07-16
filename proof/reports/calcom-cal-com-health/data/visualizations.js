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
        "sourceFileCount": 6306
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
        "configKeyCount": 0,
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
        "messageChannelCount": 0,
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
    "renderer": "table",
    "source": {
      "id": "finding-repository-health",
      "kind": "finding",
      "name": "Repository health evidence"
    },
    "sourceDataRows": [
      {
        "label": "Source",
        "value": "Files: 6306 · LOC: 244805 · Classes: 1178 · Types: 2418 · Interfaces: 767"
      },
      {
        "label": "Languages",
        "value": "7 · apex, css, javascript, php, prisma, sql, typescript"
      },
      {
        "label": "Frameworks",
        "value": "9 · NestJS, Next.js, React, Prisma ORM, tRPC API, ASP.NET WebAPI/MVC Endpoints, Express/Fastify/Hono API Endpoints, process.env (Node.js), TypeORM"
      },
      {
        "label": "Packages and build",
        "value": "Package manifests: 120 · Build configs: 210"
      },
      {
        "label": "CI/CD",
        "value": "50 · GitHub Actions"
      },
      {
        "label": "Resource detections",
        "value": "7 · ASP.NET WebAPI/MVC Endpoints, Express/Fastify/Hono API Endpoints, Next.js API Routes, Prisma ORM, process.env (Node.js), tRPC API Procedures, TypeORM"
      },
      {
        "label": "Database model",
        "value": "Schema artifacts: 604 · Entities: 101 · Fields: 843 · Relationships: 263"
      },
      {
        "label": "API endpoints",
        "value": "255 · tRPC (199), REST/HTTP (56)"
      },
      {
        "label": "Other runtime surfaces",
        "value": "Message channels: 0 · Config keys: 0"
      },
      {
        "label": "Sonde Performance",
        "value": "Analysis: 6306 files · Payload: 50.6 MB"
      }
    ],
    "visualizationId": "visualization-repository-health"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 2578,
        "sourcePath": "packages/features/bookings/lib/service/RegularBookingService.ts",
        "startLine": 484,
        "subject": "handler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-handler-71962a93c2",
    "findingId": "finding-repository-health-complexity-handler-71962a93c2",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "handler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 2578,
        "sourcePath": "packages/features/bookings/lib/service/RegularBookingService.ts",
        "startLine": 484
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "handler"
      },
      {
        "label": "Source range",
        "value": "packages/features/bookings/lib/service/RegularBookingService.ts L484-L2578"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "269"
      },
      {
        "label": "Cognitive complexity",
        "value": "504"
      },
      {
        "label": "Maintainability",
        "value": "0"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-handler-71962a93c2"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 605,
        "sourcePath": "packages/features/eventtypes/lib/getPublicEvent.ts",
        "startLine": 282,
        "subject": "getPublicEvent"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-getpublicevent-9e25ddc38c",
    "findingId": "finding-repository-health-complexity-getpublicevent-9e25ddc38c",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "getPublicEvent"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 605,
        "sourcePath": "packages/features/eventtypes/lib/getPublicEvent.ts",
        "startLine": 282
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "getPublicEvent"
      },
      {
        "label": "Source range",
        "value": "packages/features/eventtypes/lib/getPublicEvent.ts L282-L605"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "46"
      },
      {
        "label": "Cognitive complexity",
        "value": "54"
      },
      {
        "label": "Maintainability",
        "value": "12.6"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-getpublicevent-9e25ddc38c"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 152,
        "sourcePath": "apps/api/v2/src/modules/auth/strategies/api-auth/api-auth.strategy.ts",
        "startLine": 53,
        "subject": "authenticate"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-authenticate-5818168e65",
    "findingId": "finding-repository-health-complexity-authenticate-5818168e65",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "authenticate"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 152,
        "sourcePath": "apps/api/v2/src/modules/auth/strategies/api-auth/api-auth.strategy.ts",
        "startLine": 53
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "authenticate"
      },
      {
        "label": "Source range",
        "value": "apps/api/v2/src/modules/auth/strategies/api-auth/api-auth.strategy.ts L53-L152"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "42"
      },
      {
        "label": "Cognitive complexity",
        "value": "60"
      },
      {
        "label": "Maintainability",
        "value": "27.12"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-authenticate-5818168e65"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 263,
        "sourcePath": "scripts/seed-app-store.ts",
        "startLine": 92,
        "subject": "main"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-main-442cd69960",
    "findingId": "finding-repository-health-complexity-main-442cd69960",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "main"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 263,
        "sourcePath": "scripts/seed-app-store.ts",
        "startLine": 92
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "main"
      },
      {
        "label": "Source range",
        "value": "scripts/seed-app-store.ts L92-L263"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "42"
      },
      {
        "label": "Cognitive complexity",
        "value": "43"
      },
      {
        "label": "Maintainability",
        "value": "19.88"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-main-442cd69960"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 209,
        "sourcePath": "apps/web/app/api/auth/signup/handlers/selfHostedHandler.ts",
        "startLine": 22,
        "subject": "handler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-handler-ade03c41a4",
    "findingId": "finding-repository-health-complexity-handler-ade03c41a4",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "handler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 209,
        "sourcePath": "apps/web/app/api/auth/signup/handlers/selfHostedHandler.ts",
        "startLine": 22
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "handler"
      },
      {
        "label": "Source range",
        "value": "apps/web/app/api/auth/signup/handlers/selfHostedHandler.ts L22-L209"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "29"
      },
      {
        "label": "Cognitive complexity",
        "value": "64"
      },
      {
        "label": "Maintainability",
        "value": "21.66"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-handler-ade03c41a4"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 255,
        "sourcePath": "apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/api-to-internal/booking-fields.ts",
        "startLine": 51,
        "subject": "getBaseProperties"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-getbaseproperties-7b639d0787",
    "findingId": "finding-repository-health-complexity-getbaseproperties-7b639d0787",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "getBaseProperties"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 255,
        "sourcePath": "apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/api-to-internal/booking-fields.ts",
        "startLine": 51
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "getBaseProperties"
      },
      {
        "label": "Source range",
        "value": "apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/api-to-internal/booking-fields.ts L51-L255"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "28"
      },
      {
        "label": "Cognitive complexity",
        "value": "37"
      },
      {
        "label": "Maintainability",
        "value": "20.9"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-getbaseproperties-7b639d0787"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 233,
        "sourcePath": "packages/trpc/server/routers/viewer/eventTypes/heavy/duplicate.handler.ts",
        "startLine": 18,
        "subject": "duplicateHandler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-duplicatehandler-72a950591f",
    "findingId": "finding-repository-health-complexity-duplicatehandler-72a950591f",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "duplicateHandler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 233,
        "sourcePath": "packages/trpc/server/routers/viewer/eventTypes/heavy/duplicate.handler.ts",
        "startLine": 18
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "duplicateHandler"
      },
      {
        "label": "Source range",
        "value": "packages/trpc/server/routers/viewer/eventTypes/heavy/duplicate.handler.ts L18-L233"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "25"
      },
      {
        "label": "Cognitive complexity",
        "value": "31"
      },
      {
        "label": "Maintainability",
        "value": "21.52"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-duplicatehandler-72a950591f"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 775,
        "sourcePath": "packages/features/bookings/lib/EventManager.ts",
        "startLine": 613,
        "subject": "reschedule"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-reschedule-52ce096021",
    "findingId": "finding-repository-health-complexity-reschedule-52ce096021",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "reschedule"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 775,
        "sourcePath": "packages/features/bookings/lib/EventManager.ts",
        "startLine": 613
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "reschedule"
      },
      {
        "label": "Source range",
        "value": "packages/features/bookings/lib/EventManager.ts L613-L775"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "24"
      },
      {
        "label": "Cognitive complexity",
        "value": "50"
      },
      {
        "label": "Maintainability",
        "value": "24.45"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-reschedule-52ce096021"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 1375,
        "sourcePath": "scripts/seed.ts",
        "startLine": 632,
        "subject": "main"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-main-93206e005a",
    "findingId": "finding-repository-health-complexity-main-93206e005a",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "main"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 1375,
        "sourcePath": "scripts/seed.ts",
        "startLine": 632
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "main"
      },
      {
        "label": "Source range",
        "value": "scripts/seed.ts L632-L1375"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "23"
      },
      {
        "label": "Cognitive complexity",
        "value": "23"
      },
      {
        "label": "Maintainability",
        "value": "5.64"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-main-93206e005a"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 234,
        "sourcePath": "packages/features/tasker/tasks/crm/createCRMEvent.ts",
        "startLine": 39,
        "subject": "createCRMEvent"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-createcrmevent-b2b25ec7db",
    "findingId": "finding-repository-health-complexity-createcrmevent-b2b25ec7db",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "createCRMEvent"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 234,
        "sourcePath": "packages/features/tasker/tasks/crm/createCRMEvent.ts",
        "startLine": 39
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "createCRMEvent"
      },
      {
        "label": "Source range",
        "value": "packages/features/tasker/tasks/crm/createCRMEvent.ts L39-L234"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "22"
      },
      {
        "label": "Cognitive complexity",
        "value": "28"
      },
      {
        "label": "Maintainability",
        "value": "22.33"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-createcrmevent-b2b25ec7db"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 288,
        "sourcePath": "packages/features/auth/lib/next-auth-options.ts",
        "startLine": 149,
        "subject": "authorizeCredentials"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-authorizecredentials-79061825b8",
    "findingId": "finding-repository-health-complexity-authorizecredentials-79061825b8",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "authorizeCredentials"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 288,
        "sourcePath": "packages/features/auth/lib/next-auth-options.ts",
        "startLine": 149
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "authorizeCredentials"
      },
      {
        "label": "Source range",
        "value": "packages/features/auth/lib/next-auth-options.ts L149-L288"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "21"
      },
      {
        "label": "Cognitive complexity",
        "value": "40"
      },
      {
        "label": "Maintainability",
        "value": "26.69"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-authorizecredentials-79061825b8"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 123,
        "sourcePath": "apps/web/app/api/auth/two-factor/totp/disable/route.ts",
        "startLine": 16,
        "subject": "handler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-handler-074ca77b34",
    "findingId": "finding-repository-health-complexity-handler-074ca77b34",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "handler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 123,
        "sourcePath": "apps/web/app/api/auth/two-factor/totp/disable/route.ts",
        "startLine": 16
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "handler"
      },
      {
        "label": "Source range",
        "value": "apps/web/app/api/auth/two-factor/totp/disable/route.ts L16-L123"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "21"
      },
      {
        "label": "Cognitive complexity",
        "value": "36"
      },
      {
        "label": "Maintainability",
        "value": "29.17"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-handler-074ca77b34"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 995,
        "sourcePath": "packages/platform/types/event-types/event-types_2024_06_14/inputs/booking-fields.input.ts",
        "startLine": 934,
        "subject": "validate"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-validate-33e64b8b32",
    "findingId": "finding-repository-health-complexity-validate-33e64b8b32",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "validate"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 995,
        "sourcePath": "packages/platform/types/event-types/event-types_2024_06_14/inputs/booking-fields.input.ts",
        "startLine": 934
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "validate"
      },
      {
        "label": "Source range",
        "value": "packages/platform/types/event-types/event-types_2024_06_14/inputs/booking-fields.input.ts L934-L995"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "21"
      },
      {
        "label": "Cognitive complexity",
        "value": "29"
      },
      {
        "label": "Maintainability",
        "value": "37.39"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-validate-33e64b8b32"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 187,
        "sourcePath": "packages/features/bookings/lib/handleSeats/cancel/cancelAttendeeSeat.ts",
        "startLine": 21,
        "subject": "cancelAttendeeSeat"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-cancelattendeeseat-88f20bf126",
    "findingId": "finding-repository-health-complexity-cancelattendeeseat-88f20bf126",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "cancelAttendeeSeat"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 187,
        "sourcePath": "packages/features/bookings/lib/handleSeats/cancel/cancelAttendeeSeat.ts",
        "startLine": 21
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "cancelAttendeeSeat"
      },
      {
        "label": "Source range",
        "value": "packages/features/bookings/lib/handleSeats/cancel/cancelAttendeeSeat.ts L21-L187"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "20"
      },
      {
        "label": "Cognitive complexity",
        "value": "43"
      },
      {
        "label": "Maintainability",
        "value": "25.27"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-cancelattendeeseat-88f20bf126"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 208,
        "sourcePath": "apps/web/lib/reschedule/[uid]/getServerSideProps.ts",
        "startLine": 22,
        "subject": "getServerSideProps"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-getserversideprops-788303db32",
    "findingId": "finding-repository-health-complexity-getserversideprops-788303db32",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "getServerSideProps"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 208,
        "sourcePath": "apps/web/lib/reschedule/[uid]/getServerSideProps.ts",
        "startLine": 22
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "getServerSideProps"
      },
      {
        "label": "Source range",
        "value": "apps/web/lib/reschedule/[uid]/getServerSideProps.ts L22-L208"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "20"
      },
      {
        "label": "Cognitive complexity",
        "value": "21"
      },
      {
        "label": "Maintainability",
        "value": "24.05"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-getserversideprops-788303db32"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 170,
        "sourcePath": "packages/app-store/dailyvideo/lib/scripts/deleteRecordings.ts",
        "startLine": 27,
        "subject": "getAllRecordingsOlderThan6Months"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-getallrecordingsolderthan6months-1f76292bbf",
    "findingId": "finding-repository-health-complexity-getallrecordingsolderthan6months-1f76292bbf",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "getAllRecordingsOlderThan6Months"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 170,
        "sourcePath": "packages/app-store/dailyvideo/lib/scripts/deleteRecordings.ts",
        "startLine": 27
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "getAllRecordingsOlderThan6Months"
      },
      {
        "label": "Source range",
        "value": "packages/app-store/dailyvideo/lib/scripts/deleteRecordings.ts L27-L170"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "19"
      },
      {
        "label": "Cognitive complexity",
        "value": "40"
      },
      {
        "label": "Maintainability",
        "value": "25.87"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-getallrecordingsolderthan6months-1f76292bbf"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 231,
        "sourcePath": "packages/features/data-table/lib/server.ts",
        "startLine": 181,
        "subject": "makeSqlCondition"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-makesqlcondition-dd6bea900f",
    "findingId": "finding-repository-health-complexity-makesqlcondition-dd6bea900f",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "makeSqlCondition"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 231,
        "sourcePath": "packages/features/data-table/lib/server.ts",
        "startLine": 181
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "makeSqlCondition"
      },
      {
        "label": "Source range",
        "value": "packages/features/data-table/lib/server.ts L181-L231"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "19"
      },
      {
        "label": "Cognitive complexity",
        "value": "22"
      },
      {
        "label": "Maintainability",
        "value": "39.72"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-makesqlcondition-dd6bea900f"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 237,
        "sourcePath": "apps/web/app/api/recorded-daily-video/route.ts",
        "startLine": 52,
        "subject": "postHandler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-posthandler-a46c710db0",
    "findingId": "finding-repository-health-complexity-posthandler-a46c710db0",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "postHandler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 237,
        "sourcePath": "apps/web/app/api/recorded-daily-video/route.ts",
        "startLine": 52
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "postHandler"
      },
      {
        "label": "Source range",
        "value": "apps/web/app/api/recorded-daily-video/route.ts L52-L237"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "18"
      },
      {
        "label": "Cognitive complexity",
        "value": "38"
      },
      {
        "label": "Maintainability",
        "value": "23.02"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-posthandler-a46c710db0"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 280,
        "sourcePath": "packages/features/webhooks/lib/scheduleTrigger.ts",
        "startLine": 180,
        "subject": "listBookings"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-listbookings-cc5211fc34",
    "findingId": "finding-repository-health-complexity-listbookings-cc5211fc34",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "listBookings"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 280,
        "sourcePath": "packages/features/webhooks/lib/scheduleTrigger.ts",
        "startLine": 180
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "listBookings"
      },
      {
        "label": "Source range",
        "value": "packages/features/webhooks/lib/scheduleTrigger.ts L180-L280"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "17"
      },
      {
        "label": "Cognitive complexity",
        "value": "26"
      },
      {
        "label": "Maintainability",
        "value": "32.23"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-listbookings-cc5211fc34"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 108,
        "sourcePath": "packages/app-store/btcpayserver/api/webhook.ts",
        "startLine": 42,
        "subject": "handler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-handler-8a6b2cd78f",
    "findingId": "finding-repository-health-complexity-handler-8a6b2cd78f",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "handler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 108,
        "sourcePath": "packages/app-store/btcpayserver/api/webhook.ts",
        "startLine": 42
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "handler"
      },
      {
        "label": "Source range",
        "value": "packages/app-store/btcpayserver/api/webhook.ts L42-L108"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "17"
      },
      {
        "label": "Cognitive complexity",
        "value": "17"
      },
      {
        "label": "Maintainability",
        "value": "34.67"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-handler-8a6b2cd78f"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 185,
        "sourcePath": "packages/app-store/googlecalendar/api/callback.ts",
        "startLine": 24,
        "subject": "getHandler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-gethandler-0a4d35f32d",
    "findingId": "finding-repository-health-complexity-gethandler-0a4d35f32d",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "getHandler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 185,
        "sourcePath": "packages/app-store/googlecalendar/api/callback.ts",
        "startLine": 24
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "getHandler"
      },
      {
        "label": "Source range",
        "value": "packages/app-store/googlecalendar/api/callback.ts L24-L185"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "16"
      },
      {
        "label": "Cognitive complexity",
        "value": "27"
      },
      {
        "label": "Maintainability",
        "value": "25.59"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-gethandler-0a4d35f32d"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 1231,
        "sourcePath": "packages/features/bookings/lib/EventManager.ts",
        "startLine": 1098,
        "subject": "updateAllCalendarEvents"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-updateallcalendarevents-ff090ad106",
    "findingId": "finding-repository-health-complexity-updateallcalendarevents-ff090ad106",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "updateAllCalendarEvents"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 1231,
        "sourcePath": "packages/features/bookings/lib/EventManager.ts",
        "startLine": 1098
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "updateAllCalendarEvents"
      },
      {
        "label": "Source range",
        "value": "packages/features/bookings/lib/EventManager.ts L1098-L1231"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "15"
      },
      {
        "label": "Cognitive complexity",
        "value": "26"
      },
      {
        "label": "Maintainability",
        "value": "28.49"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-updateallcalendarevents-ff090ad106"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 91,
        "sourcePath": "packages/app-store/stripepayment/api/subscription.ts",
        "startLine": 10,
        "subject": "handler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-handler-5e21cda35d",
    "findingId": "finding-repository-health-complexity-handler-5e21cda35d",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "handler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 91,
        "sourcePath": "packages/app-store/stripepayment/api/subscription.ts",
        "startLine": 10
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "handler"
      },
      {
        "label": "Source range",
        "value": "packages/app-store/stripepayment/api/subscription.ts L10-L91"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "14"
      },
      {
        "label": "Cognitive complexity",
        "value": "21"
      },
      {
        "label": "Maintainability",
        "value": "34"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-handler-5e21cda35d"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 145,
        "sourcePath": "apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/internal-to-api/locations.ts",
        "startLine": 47,
        "subject": "transformLocationsInternalToApi"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-transformlocationsinternaltoapi-51d63af3ff",
    "findingId": "finding-repository-health-complexity-transformlocationsinternaltoapi-51d63af3ff",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "transformLocationsInternalToApi"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 145,
        "sourcePath": "apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/internal-to-api/locations.ts",
        "startLine": 47
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "transformLocationsInternalToApi"
      },
      {
        "label": "Source range",
        "value": "apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/internal-to-api/locations.ts L47-L145"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "14"
      },
      {
        "label": "Cognitive complexity",
        "value": "16"
      },
      {
        "label": "Maintainability",
        "value": "33.33"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-transformlocationsinternaltoapi-51d63af3ff"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 375,
        "sourcePath": "apps/api/v2/src/platform/bookings/2024-08-13/services/input.service.ts",
        "startLine": 280,
        "subject": "transformLocation"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-transformlocation-4f350d0d5a",
    "findingId": "finding-repository-health-complexity-transformlocation-4f350d0d5a",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "transformLocation"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 375,
        "sourcePath": "apps/api/v2/src/platform/bookings/2024-08-13/services/input.service.ts",
        "startLine": 280
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "transformLocation"
      },
      {
        "label": "Source range",
        "value": "apps/api/v2/src/platform/bookings/2024-08-13/services/input.service.ts L280-L375"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "14"
      },
      {
        "label": "Cognitive complexity",
        "value": "16"
      },
      {
        "label": "Maintainability",
        "value": "34.73"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-transformlocation-4f350d0d5a"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 434,
        "sourcePath": "apps/api/v2/src/modules/atoms/services/event-types-atom.service.ts",
        "startLine": 361,
        "subject": "getPublicEventTypeForAtoms"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-getpubliceventtypeforatoms-151cb2589d",
    "findingId": "finding-repository-health-complexity-getpubliceventtypeforatoms-151cb2589d",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "getPublicEventTypeForAtoms"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 434,
        "sourcePath": "apps/api/v2/src/modules/atoms/services/event-types-atom.service.ts",
        "startLine": 361
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "getPublicEventTypeForAtoms"
      },
      {
        "label": "Source range",
        "value": "apps/api/v2/src/modules/atoms/services/event-types-atom.service.ts L361-L434"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "13"
      },
      {
        "label": "Cognitive complexity",
        "value": "19"
      },
      {
        "label": "Maintainability",
        "value": "37.15"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-getpubliceventtypeforatoms-151cb2589d"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 162,
        "sourcePath": "apps/web/lib/pages/auth/verify-email.ts",
        "startLine": 26,
        "subject": "handler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-handler-ca648e6081",
    "findingId": "finding-repository-health-complexity-handler-ca648e6081",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "handler"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 162,
        "sourcePath": "apps/web/lib/pages/auth/verify-email.ts",
        "startLine": 26
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "handler"
      },
      {
        "label": "Source range",
        "value": "apps/web/lib/pages/auth/verify-email.ts L26-L162"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "13"
      },
      {
        "label": "Cognitive complexity",
        "value": "16"
      },
      {
        "label": "Maintainability",
        "value": "28.62"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-handler-ca648e6081"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 84,
        "sourcePath": "packages/features/bookings/lib/payment/processPaymentRefund.ts",
        "startLine": 7,
        "subject": "processPaymentRefund"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-processpaymentrefund-06206cf991",
    "findingId": "finding-repository-health-complexity-processpaymentrefund-06206cf991",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "processPaymentRefund"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 84,
        "sourcePath": "packages/features/bookings/lib/payment/processPaymentRefund.ts",
        "startLine": 7
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "processPaymentRefund"
      },
      {
        "label": "Source range",
        "value": "packages/features/bookings/lib/payment/processPaymentRefund.ts L7-L84"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "13"
      },
      {
        "label": "Cognitive complexity",
        "value": "16"
      },
      {
        "label": "Maintainability",
        "value": "36.19"
      },
      {
        "label": "Decision points in cited range",
        "value": "7"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-processpaymentrefund-06206cf991"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 133,
        "sourcePath": "scripts/prepare-local-for-delegation-credentials-testing.js",
        "startLine": 7,
        "subject": "main"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-main-88b488f1c0",
    "findingId": "finding-repository-health-complexity-main-88b488f1c0",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "main"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 133,
        "sourcePath": "scripts/prepare-local-for-delegation-credentials-testing.js",
        "startLine": 7
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "main"
      },
      {
        "label": "Source range",
        "value": "scripts/prepare-local-for-delegation-credentials-testing.js L7-L133"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "12"
      },
      {
        "label": "Cognitive complexity",
        "value": "22"
      },
      {
        "label": "Maintainability",
        "value": "29.32"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-main-88b488f1c0"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 330,
        "sourcePath": "packages/app-store/stripepayment/lib/PaymentService.ts",
        "startLine": 225,
        "subject": "chargeCard"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-chargecard-ab0958bd39",
    "findingId": "finding-repository-health-complexity-chargecard-ab0958bd39",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "chargeCard"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 330,
        "sourcePath": "packages/app-store/stripepayment/lib/PaymentService.ts",
        "startLine": 225
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "chargeCard"
      },
      {
        "label": "Source range",
        "value": "packages/app-store/stripepayment/lib/PaymentService.ts L225-L330"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "12"
      },
      {
        "label": "Cognitive complexity",
        "value": "17"
      },
      {
        "label": "Maintainability",
        "value": "31.09"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-chargecard-ab0958bd39"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 438,
        "sourcePath": "packages/features/calendars/lib/getConnectedDestinationCalendars.ts",
        "startLine": 273,
        "subject": "getConnectedDestinationCalendarsAndEnsureDefaultsInDb"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-getconnecteddestinationcalendarsandensuredefaultsindb-64fa06b5af",
    "findingId": "finding-repository-health-complexity-getconnecteddestinationcalendarsandensuredefaultsindb-64fa06b5af",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "getConnectedDestinationCalendarsAndEnsureDefaultsInDb"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 438,
        "sourcePath": "packages/features/calendars/lib/getConnectedDestinationCalendars.ts",
        "startLine": 273
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "getConnectedDestinationCalendarsAndEnsureDefaultsInDb"
      },
      {
        "label": "Source range",
        "value": "packages/features/calendars/lib/getConnectedDestinationCalendars.ts L273-L438"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "10"
      },
      {
        "label": "Cognitive complexity",
        "value": "23"
      },
      {
        "label": "Maintainability",
        "value": "27.97"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-getconnecteddestinationcalendarsandensuredefaultsindb-64fa06b5af"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 85,
        "sourcePath": "apps/api/v2/src/lib/services/qualified-hosts.service.ts",
        "startLine": 21,
        "subject": "findQualifiedHostsWithDelegationCredentials"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-findqualifiedhostswithdelegationcredentials-5cee6a9688",
    "findingId": "finding-repository-health-complexity-findqualifiedhostswithdelegationcredentials-5cee6a9688",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "findQualifiedHostsWithDelegationCredentials"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 85,
        "sourcePath": "apps/api/v2/src/lib/services/qualified-hosts.service.ts",
        "startLine": 21
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "findQualifiedHostsWithDelegationCredentials"
      },
      {
        "label": "Source range",
        "value": "apps/api/v2/src/lib/services/qualified-hosts.service.ts L21-L85"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "10"
      },
      {
        "label": "Cognitive complexity",
        "value": "22"
      },
      {
        "label": "Maintainability",
        "value": "38.08"
      },
      {
        "label": "Decision points in cited range",
        "value": "7"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-findqualifiedhostswithdelegationcredentials-5cee6a9688"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 416,
        "sourcePath": "packages/features/schedules/lib/date-ranges.ts",
        "startLine": 352,
        "subject": "intersect"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-intersect-47fdb8081c",
    "findingId": "finding-repository-health-complexity-intersect-47fdb8081c",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "intersect"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 416,
        "sourcePath": "packages/features/schedules/lib/date-ranges.ts",
        "startLine": 352
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "intersect"
      },
      {
        "label": "Source range",
        "value": "packages/features/schedules/lib/date-ranges.ts L352-L416"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "10"
      },
      {
        "label": "Cognitive complexity",
        "value": "22"
      },
      {
        "label": "Maintainability",
        "value": "38.48"
      },
      {
        "label": "Decision points in cited range",
        "value": "8"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-intersect-47fdb8081c"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 378,
        "sourcePath": "packages/testing/src/lib/bookingScenario/bookingScenario.ts",
        "startLine": 314,
        "subject": "addHostsToDb"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-addhoststodb-aa1609363a",
    "findingId": "finding-repository-health-complexity-addhoststodb-aa1609363a",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "addHostsToDb"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 378,
        "sourcePath": "packages/testing/src/lib/bookingScenario/bookingScenario.ts",
        "startLine": 314
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "addHostsToDb"
      },
      {
        "label": "Source range",
        "value": "packages/testing/src/lib/bookingScenario/bookingScenario.ts L314-L378"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "8"
      },
      {
        "label": "Cognitive complexity",
        "value": "16"
      },
      {
        "label": "Maintainability",
        "value": "39.28"
      },
      {
        "label": "Decision points in cited range",
        "value": "5"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-addhoststodb-aa1609363a"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 477,
        "sourcePath": "packages/features/webhooks/lib/scheduleTrigger.ts",
        "startLine": 382,
        "subject": "fetchBookingsFromWebhook"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-fetchbookingsfromwebhook-c6b66e7bb1",
    "findingId": "finding-repository-health-complexity-fetchbookingsfromwebhook-c6b66e7bb1",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "fetchBookingsFromWebhook"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 477,
        "sourcePath": "packages/features/webhooks/lib/scheduleTrigger.ts",
        "startLine": 382
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "fetchBookingsFromWebhook"
      },
      {
        "label": "Source range",
        "value": "packages/features/webhooks/lib/scheduleTrigger.ts L382-L477"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "6"
      },
      {
        "label": "Cognitive complexity",
        "value": "16"
      },
      {
        "label": "Maintainability",
        "value": "34.7"
      },
      {
        "label": "Decision points in cited range",
        "value": "4"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-fetchbookingsfromwebhook-c6b66e7bb1"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 47,
        "sourcePath": "packages/features/data-table/lib/utils.ts",
        "startLine": 16,
        "subject": "textFilter"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-textfilter-b18a3184a6",
    "findingId": "finding-repository-health-complexity-textfilter-b18a3184a6",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "textFilter"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 47,
        "sourcePath": "packages/features/data-table/lib/utils.ts",
        "startLine": 16
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "textFilter"
      },
      {
        "label": "Source range",
        "value": "packages/features/data-table/lib/utils.ts L16-L47"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "18"
      },
      {
        "label": "Cognitive complexity",
        "value": "10"
      },
      {
        "label": "Maintainability",
        "value": "45.56"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-textfilter-b18a3184a6"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 180,
        "sourcePath": "packages/features/webhooks/lib/scheduleTrigger.ts",
        "startLine": 130,
        "subject": "deleteSubscription"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-deletesubscription-d2b3e5f646",
    "findingId": "finding-repository-health-complexity-deletesubscription-d2b3e5f646",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "deleteSubscription"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 180,
        "sourcePath": "packages/features/webhooks/lib/scheduleTrigger.ts",
        "startLine": 130
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "deleteSubscription"
      },
      {
        "label": "Source range",
        "value": "packages/features/webhooks/lib/scheduleTrigger.ts L130-L180"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "17"
      },
      {
        "label": "Cognitive complexity",
        "value": "26"
      },
      {
        "label": "Maintainability",
        "value": "40.87"
      },
      {
        "label": "Decision points in cited range",
        "value": "7"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-deletesubscription-d2b3e5f646"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 354,
        "sourcePath": "packages/features/calendar-subscription/lib/CalendarSubscriptionService.ts",
        "startLine": 226,
        "subject": "processEvents"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-processevents-a2173ba1fe",
    "findingId": "finding-repository-health-complexity-processevents-a2173ba1fe",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "processEvents"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 354,
        "sourcePath": "packages/features/calendar-subscription/lib/CalendarSubscriptionService.ts",
        "startLine": 226
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "processEvents"
      },
      {
        "label": "Source range",
        "value": "packages/features/calendar-subscription/lib/CalendarSubscriptionService.ts L226-L354"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "16"
      },
      {
        "label": "Cognitive complexity",
        "value": "15"
      },
      {
        "label": "Maintainability",
        "value": "27.91"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-processevents-a2173ba1fe"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 92,
        "sourcePath": "packages/lib/server/imageUtils.ts",
        "startLine": 44,
        "subject": "detectContentType"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-detectcontenttype-83acfa1fbf",
    "findingId": "finding-repository-health-complexity-detectcontenttype-83acfa1fbf",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "detectContentType"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 92,
        "sourcePath": "packages/lib/server/imageUtils.ts",
        "startLine": 44
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "detectContentType"
      },
      {
        "label": "Source range",
        "value": "packages/lib/server/imageUtils.ts L44-L92"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "16"
      },
      {
        "label": "Cognitive complexity",
        "value": "9"
      },
      {
        "label": "Maintainability",
        "value": "41.22"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-detectcontenttype-83acfa1fbf"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 822,
        "sourcePath": "apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts",
        "startLine": 741,
        "subject": "rescheduleBooking"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-reschedulebooking-c07f7f1811",
    "findingId": "finding-repository-health-complexity-reschedulebooking-c07f7f1811",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "rescheduleBooking"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 822,
        "sourcePath": "apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts",
        "startLine": 741
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "rescheduleBooking"
      },
      {
        "label": "Source range",
        "value": "apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts L741-L822"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "15"
      },
      {
        "label": "Cognitive complexity",
        "value": "14"
      },
      {
        "label": "Maintainability",
        "value": "33.91"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-reschedulebooking-c07f7f1811"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 254,
        "sourcePath": "packages/features/bookings/lib/BookingEmailSmsHandler.ts",
        "startLine": 133,
        "subject": "_handleRoundRobinRescheduled"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-handleroundrobinrescheduled-22798f212e",
    "findingId": "finding-repository-health-complexity-handleroundrobinrescheduled-22798f212e",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "_handleRoundRobinRescheduled"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 254,
        "sourcePath": "packages/features/bookings/lib/BookingEmailSmsHandler.ts",
        "startLine": 133
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "_handleRoundRobinRescheduled"
      },
      {
        "label": "Source range",
        "value": "packages/features/bookings/lib/BookingEmailSmsHandler.ts L133-L254"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "14"
      },
      {
        "label": "Cognitive complexity",
        "value": "14"
      },
      {
        "label": "Maintainability",
        "value": "29.58"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-handleroundrobinrescheduled-22798f212e"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 240,
        "sourcePath": "apps/web/modules/form-builder/components/FormBuilderField.tsx",
        "startLine": 192,
        "subject": "getAndUpdateNormalizedValues"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-getandupdatenormalizedvalues-fac5c01648",
    "findingId": "finding-repository-health-complexity-getandupdatenormalizedvalues-fac5c01648",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "getAndUpdateNormalizedValues"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 240,
        "sourcePath": "apps/web/modules/form-builder/components/FormBuilderField.tsx",
        "startLine": 192
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "getAndUpdateNormalizedValues"
      },
      {
        "label": "Source range",
        "value": "apps/web/modules/form-builder/components/FormBuilderField.tsx L192-L240"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "13"
      },
      {
        "label": "Cognitive complexity",
        "value": "18"
      },
      {
        "label": "Maintainability",
        "value": "41.71"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-getandupdatenormalizedvalues-fac5c01648"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 95,
        "sourcePath": "packages/features/booking-audit/lib/repository/PrismaAuditActorRepository.ts",
        "startLine": 24,
        "subject": "createIfNotExistsGuestActor"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-createifnotexistsguestactor-8329450e79",
    "findingId": "finding-repository-health-complexity-createifnotexistsguestactor-8329450e79",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "createIfNotExistsGuestActor"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 95,
        "sourcePath": "packages/features/booking-audit/lib/repository/PrismaAuditActorRepository.ts",
        "startLine": 24
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "createIfNotExistsGuestActor"
      },
      {
        "label": "Source range",
        "value": "packages/features/booking-audit/lib/repository/PrismaAuditActorRepository.ts L24-L95"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "13"
      },
      {
        "label": "Cognitive complexity",
        "value": "14"
      },
      {
        "label": "Maintainability",
        "value": "37.26"
      },
      {
        "label": "Decision points in cited range",
        "value": "8"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-createifnotexistsguestactor-8329450e79"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 148,
        "sourcePath": "apps/api/v2/src/modules/stripe/controllers/stripe.controller.ts",
        "startLine": 89,
        "subject": "save"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-save-8f4b6f6e52",
    "findingId": "finding-repository-health-complexity-save-8f4b6f6e52",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "save"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 148,
        "sourcePath": "apps/api/v2/src/modules/stripe/controllers/stripe.controller.ts",
        "startLine": 89
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "save"
      },
      {
        "label": "Source range",
        "value": "apps/api/v2/src/modules/stripe/controllers/stripe.controller.ts L89-L148"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "13"
      },
      {
        "label": "Cognitive complexity",
        "value": "14"
      },
      {
        "label": "Maintainability",
        "value": "38.59"
      },
      {
        "label": "Decision points in cited range",
        "value": "8"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-save-8f4b6f6e52"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 234,
        "sourcePath": "packages/features/bookings/lib/payment/getBooking.ts",
        "startLine": 32,
        "subject": "getBooking"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-getbooking-fd763cf2c0",
    "findingId": "finding-repository-health-complexity-getbooking-fd763cf2c0",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "getBooking"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 234,
        "sourcePath": "packages/features/bookings/lib/payment/getBooking.ts",
        "startLine": 32
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "getBooking"
      },
      {
        "label": "Source range",
        "value": "packages/features/bookings/lib/payment/getBooking.ts L32-L234"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "13"
      },
      {
        "label": "Cognitive complexity",
        "value": "13"
      },
      {
        "label": "Maintainability",
        "value": "23.03"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-getbooking-fd763cf2c0"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 121,
        "sourcePath": "packages/app-store/_utils/getCalendar.ts",
        "startLine": 15,
        "subject": "getCalendar"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-getcalendar-38f85f1def",
    "findingId": "finding-repository-health-complexity-getcalendar-38f85f1def",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "getCalendar"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 121,
        "sourcePath": "packages/app-store/_utils/getCalendar.ts",
        "startLine": 15
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "getCalendar"
      },
      {
        "label": "Source range",
        "value": "packages/app-store/_utils/getCalendar.ts L15-L121"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "13"
      },
      {
        "label": "Cognitive complexity",
        "value": "13"
      },
      {
        "label": "Maintainability",
        "value": "31.88"
      },
      {
        "label": "Decision points in cited range",
        "value": "10"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-getcalendar-38f85f1def"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 484,
        "sourcePath": "packages/features/bookings/lib/service/RegularBookingService.ts",
        "startLine": 433,
        "subject": "validateRescheduleRestrictions"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-validatereschedulerestrictions-4c1fc46837",
    "findingId": "finding-repository-health-complexity-validatereschedulerestrictions-4c1fc46837",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "validateRescheduleRestrictions"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 484,
        "sourcePath": "packages/features/bookings/lib/service/RegularBookingService.ts",
        "startLine": 433
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "validateRescheduleRestrictions"
      },
      {
        "label": "Source range",
        "value": "packages/features/bookings/lib/service/RegularBookingService.ts L433-L484"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "13"
      },
      {
        "label": "Cognitive complexity",
        "value": "13"
      },
      {
        "label": "Maintainability",
        "value": "42.44"
      },
      {
        "label": "Decision points in cited range",
        "value": "8"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-validatereschedulerestrictions-4c1fc46837"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 158,
        "sourcePath": "apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts",
        "startLine": 110,
        "subject": "createBooking"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-createbooking-29c643e1fa",
    "findingId": "finding-repository-health-complexity-createbooking-29c643e1fa",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "createBooking"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 158,
        "sourcePath": "apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts",
        "startLine": 110
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "createBooking"
      },
      {
        "label": "Source range",
        "value": "apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts L110-L158"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "13"
      },
      {
        "label": "Cognitive complexity",
        "value": "12"
      },
      {
        "label": "Maintainability",
        "value": "40.92"
      },
      {
        "label": "Decision points in cited range",
        "value": "7"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-createbooking-29c643e1fa"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 32,
        "sourcePath": "apps/api/v2/src/platform/bookings/2024-08-13/services/errors.service.ts",
        "startLine": 8,
        "subject": "handleEventTypeToBeBookedNotFound"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-handleeventtypetobebookednotfound-cc55780172",
    "findingId": "finding-repository-health-complexity-handleeventtypetobebookednotfound-cc55780172",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "handleEventTypeToBeBookedNotFound"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 32,
        "sourcePath": "apps/api/v2/src/platform/bookings/2024-08-13/services/errors.service.ts",
        "startLine": 8
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "handleEventTypeToBeBookedNotFound"
      },
      {
        "label": "Source range",
        "value": "apps/api/v2/src/platform/bookings/2024-08-13/services/errors.service.ts L8-L32"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "13"
      },
      {
        "label": "Cognitive complexity",
        "value": "12"
      },
      {
        "label": "Maintainability",
        "value": "49.75"
      },
      {
        "label": "Decision points in cited range",
        "value": "4"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-handleeventtypetobebookednotfound-cc55780172"
  },
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}.",
      "icuArgs": {
        "endLine": 68,
        "sourcePath": "packages/lib/intervalLimits/limitManager.ts",
        "startLine": 43,
        "subject": "isAlreadyBusy"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject} in {sourcePath} lines {startLine} through {endLine}."
        }
      }
    },
    "anchorId": "diagram-repository-health-complexity-isalreadybusy-86d18ada30",
    "findingId": "finding-repository-health-complexity-isalreadybusy-86d18ada30",
    "formats": [
      "mermaid",
      "svg"
    ],
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Control-flow graph for {subject}",
      "icuArgs": {
        "subject": "isAlreadyBusy"
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.controlFlow.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Control-flow graph for {subject}"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding.",
      "icuArgs": {
        "endLine": 68,
        "sourcePath": "packages/lib/intervalLimits/limitManager.ts",
        "startLine": 43
      },
      "msgid": "scribe.report.repositoryHealth.visualization.finding.description",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The diagram is generated from {sourcePath} lines {startLine} through {endLine} and highlights source-backed control-flow or schema evidence for the finding."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {},
    "projection": "control-flow-graph",
    "projectionLabel": "Control flow graph",
    "renderer": "mermaid",
    "source": {
      "id": "sonde/control-flow",
      "kind": "probe",
      "name": "Control Flow Analysis"
    },
    "sourceDataRows": [
      {
        "label": "Function",
        "value": "isAlreadyBusy"
      },
      {
        "label": "Source range",
        "value": "packages/lib/intervalLimits/limitManager.ts L43-L68"
      },
      {
        "label": "Cyclomatic complexity",
        "value": "12"
      },
      {
        "label": "Cognitive complexity",
        "value": "17"
      },
      {
        "label": "Maintainability",
        "value": "49.07"
      },
      {
        "label": "Decision points in cited range",
        "value": "2"
      },
      {
        "label": "Projection source",
        "value": "sonde/control-flow manifest"
      }
    ],
    "visualizationId": "visualization-finding-repository-health-complexity-isalreadybusy-86d18ada30"
  }
]
;
