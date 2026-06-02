window.__SCRIBE_SOURCE_SNIPPETS__ = [
  {
    "anchorId": "source-in-cert-in-incident-readiness",
    "code": "function incidentReportingDescriptors(\n  incidentReadiness: IncidentReadinessEvidenceGroups,\n): readonly InCertInEvidenceDescriptor[] {\n  if (incidentReadiness.readinessNodes.length === 0) return [];\n  const complete = incidentReadiness.hasReportingReadinessProfile;\n  return [\n    {\n      controlId: 'IN-CERT-IN-INCIDENT-REPORTING-READINESS',\n      ruleId: complete ? 'in-cert-in-incident-reporting-readiness' : 'in-cert-in-incident-reporting-partial',\n      severity: complete ? 'info' : 'warning',\n      evidenceMode: complete ? 'code-evidence' : 'gap-evidence',",
    "endLine": 475,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "India CERT-In readiness evidence"
      },
      "msgid": "scribe.report.complianceExample.source.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-IN": {
          "fallback": false,
          "reviewed": true,
          "text": "{framework} source evidence"
        },
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "{framework} source evidence"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-in-cert-in-readiness/index.html",
    "snippetId": "source-in-cert-in-incident-readiness",
    "sourcePath": "packages/racks/in-cert-in/src/inCertInProbe.ts",
    "startLine": 439,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/racks/in-cert-in/src/inCertInProbe.ts#L439-L475",
    "verifiedSourceHash": "sha256:9c0caac1e199b77c19caf2305a766cd2a794293ce8d1dbfaaf5fe84d34039738"
  },
  {
    "anchorId": "source-in-cert-in-log-retention",
    "code": "function logRetentionDescriptors(nodes: readonly SemanticNode[]): readonly InCertInEvidenceDescriptor[] {\n  const evidenceNodes = nodesWithEvidence(nodes, LOG_RETENTION_BOOLEAN_KEYS, LOG_RETENTION_LABELS, {\n    numberKeys: LOG_RETENTION_NUMBER_KEYS,\n  });\n  if (evidenceNodes.length === 0) return [];\n  return [\n    {\n      controlId: 'IN-CERT-IN-LOG-RETENTION-READINESS',\n      ruleId: 'in-cert-in-log-retention-readiness',\n      severity: 'info',\n      evidenceMode: 'code-evidence',",
    "endLine": 502,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "India CERT-In readiness evidence"
      },
      "msgid": "scribe.report.complianceExample.source.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-IN": {
          "fallback": false,
          "reviewed": true,
          "text": "{framework} source evidence"
        },
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "{framework} source evidence"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-in-cert-in-readiness/index.html",
    "snippetId": "source-in-cert-in-log-retention",
    "sourcePath": "packages/racks/in-cert-in/src/inCertInProbe.ts",
    "startLine": 478,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/racks/in-cert-in/src/inCertInProbe.ts#L478-L502",
    "verifiedSourceHash": "sha256:c976d24c892b1019ac5f4586f250254de789cc71a82e797514a7848b27269876"
  },
  {
    "anchorId": "source-in-cert-in-time-sync",
    "code": "function timeSyncDescriptors(nodes: readonly SemanticNode[]): readonly InCertInEvidenceDescriptor[] {\n  const evidenceNodes = nodesWithEvidence(nodes, TIME_SYNC_BOOLEAN_KEYS, TIME_SYNC_LABELS, {\n    stringKeys: TIME_SYNC_STRING_KEYS,\n  });\n  if (evidenceNodes.length === 0) return [];\n  return [\n    {\n      controlId: 'IN-CERT-IN-TIME-SYNC-READINESS',\n      ruleId: 'in-cert-in-time-sync-readiness',\n      severity: 'info',\n      evidenceMode: 'code-evidence',",
    "endLine": 528,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "India CERT-In readiness evidence"
      },
      "msgid": "scribe.report.complianceExample.source.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-IN": {
          "fallback": false,
          "reviewed": true,
          "text": "{framework} source evidence"
        },
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "{framework} source evidence"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-in-cert-in-readiness/index.html",
    "snippetId": "source-in-cert-in-time-sync",
    "sourcePath": "packages/racks/in-cert-in/src/inCertInProbe.ts",
    "startLine": 504,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/racks/in-cert-in/src/inCertInProbe.ts#L504-L528",
    "verifiedSourceHash": "sha256:ebe0d7092a1bb52b512de70af22f02e199641ee5b310584c8a58b8abe5122373"
  },
  {
    "anchorId": "source-in-cert-in-dependency-risk",
    "code": "function dependencyRiskDescriptors(nodes: readonly SemanticNode[]): readonly InCertInEvidenceDescriptor[] {\n  const evidenceNodes = nodes.filter(isDependencyRiskNode);\n  if (evidenceNodes.length === 0) return [];\n  return [\n    {\n      controlId: 'IN-CERT-IN-INCIDENT-REPORTING-READINESS',\n      ruleId: 'in-cert-in-dependency-risk-readiness',\n      severity: 'warning',\n      evidenceMode: 'gap-evidence',",
    "endLine": 604,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "India CERT-In readiness evidence"
      },
      "msgid": "scribe.report.complianceExample.source.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-IN": {
          "fallback": false,
          "reviewed": true,
          "text": "{framework} source evidence"
        },
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "{framework} source evidence"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-in-cert-in-readiness/index.html",
    "snippetId": "source-in-cert-in-dependency-risk",
    "sourcePath": "packages/racks/in-cert-in/src/inCertInProbe.ts",
    "startLine": 582,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/racks/in-cert-in/src/inCertInProbe.ts#L582-L604",
    "verifiedSourceHash": "sha256:07560011a67a31338018e57328a989c595b36b89f759e32218114e8bf5015b9a"
  }
]
;
