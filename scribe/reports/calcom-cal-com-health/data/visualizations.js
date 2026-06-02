window.__SCRIBE_VISUALIZATIONS__ = [
  {
    "altText": {
      "defaultLocale": "en-US",
      "defaultText": "Repository health source data showing 5300 source files, 7 languages, 120 package manifests, 210 build configs, 9 resource detections, and 604 database schema artifacts.",
      "icuArgs": {},
      "msgid": "scribe.report.repositoryHealth.visualization.alt",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Repository health source data showing 5300 source files, 7 languages, 120 package manifests, 210 build configs, 9 resource detections, and 604 database schema artifacts."
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
      "defaultText": "Repository health source data",
      "icuArgs": {},
      "msgid": "scribe.report.repositoryHealth.visualization.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Repository health source data"
        }
      }
    },
    "longDescription": {
      "defaultLocale": "en-US",
      "defaultText": "The source data summarizes repository health inputs collected from calcom/cal.com: apex, css, javascript, php, prisma, sql, typescript, NestJS, Next.js, React, Prisma ORM, tRPC API, 101 data entities, 245 API endpoints (tRPC (189), REST/HTTP (56)), 0 message channels, 0 config keys, and 50 CI/CD config files for GitHub Actions.",
      "icuArgs": {},
      "msgid": "scribe.report.repositoryHealth.visualization.longDescription",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The source data summarizes repository health inputs collected from calcom/cal.com: apex, css, javascript, php, prisma, sql, typescript, NestJS, Next.js, React, Prisma ORM, tRPC API, 101 data entities, 245 API endpoints (tRPC (189), REST/HTTP (56)), 0 message channels, 0 config keys, and 50 CI/CD config files for GitHub Actions."
        }
      }
    },
    "pagePath": "findings/finding-repository-health/index.html",
    "paths": {
      "sourceData": "data/visualization-source-data.repository-health.json"
    },
    "projection": "treemap",
    "projectionLabel": "Repository health source data",
    "renderer": "table",
    "source": {
      "id": "finding-repository-health",
      "kind": "finding",
      "name": "Repository health evidence"
    },
    "sourceDataRows": [
      {
        "label": "Source",
        "value": "Files: 5300 · LOC: 171354 · Classes: 1176 · Types: 1932 · Interfaces: 572"
      },
      {
        "label": "Languages",
        "value": "7 · apex, css, javascript, php, prisma, sql, typescript"
      },
      {
        "label": "Frameworks",
        "value": "11 · NestJS, Next.js, React, Prisma ORM, tRPC API, ASP.NET WebAPI/MVC Endpoints, Delphi Data Access, Express/Fastify/Hono API Endpoints, process.env (Node.js), SQLAlchemy, TypeORM"
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
        "value": "9 · ASP.NET WebAPI/MVC Endpoints, Delphi Data Access, Express/Fastify/Hono API Endpoints, Next.js API Routes, Prisma ORM, process.env (Node.js), SQLAlchemy, tRPC API Procedures, TypeORM"
      },
      {
        "label": "Database model",
        "value": "Schema artifacts: 604 · Entities: 101 · Fields: 843 · Relationships: 263"
      },
      {
        "label": "API endpoints",
        "value": "245 · tRPC (189), REST/HTTP (56)"
      },
      {
        "label": "Other runtime surfaces",
        "value": "Message channels: 0 · Config keys: 0"
      },
      {
        "label": "Sonde Performance",
        "value": "Analysis: 19.3 sec · Rate: 274.6 files/sec · Payload: 62 MB"
      }
    ],
    "visualizationId": "visualization-repository-health"
  }
]
;
