window.__SCRIBE_SOURCE_SNIPPETS__ = [
  {
    "anchorId": "source-in-dpdp-consent-lifecycle",
    "code": "function consentLifecycleDescriptors(\n  consentLifecycle: InDpdpConsentLifecycleSummary,\n): readonly InDpdpEvidenceDescriptor[] {\n  if (consentLifecycle.status === 'not-observed') return [];\n  if (consentLifecycle.status === 'complete') {\n    return [\n      {\n        controlId: 'IN-DPDP-NOTICE-CONSENT',\n        ruleId: 'in-dpdp-consent-lifecycle-source-evidence',\n        severity: 'info',\n        evidenceMode: 'code-evidence',",
    "endLine": 755,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "India DPDP readiness evidence"
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
    "pagePath": "findings/finding-in-dpdp-readiness/index.html",
    "snippetId": "source-in-dpdp-consent-lifecycle",
    "sourcePath": "packages/racks/in-dpdp/src/inDpdpProbe.ts",
    "startLine": 731,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/racks/in-dpdp/src/inDpdpProbe.ts#L731-L755",
    "verifiedSourceHash": "sha256:fe1d213b86283562821c37f5df2a2acbf433a8d4c7b90d13ee1f37a5220503b6"
  },
  {
    "anchorId": "source-in-dpdp-consent-withdrawal-gap",
    "code": "if (consentLifecycle.hasWithdrawal) return [];\nreturn [\n  {\n    controlId: 'IN-DPDP-NOTICE-CONSENT',\n    ruleId: 'in-dpdp-consent-withdrawal-missing',\n    severity: 'warning',\n    evidenceMode: 'gap-evidence',\n    title: msg('rack.in-dpdp.finding.consentWithdrawal.title', 'Consent lifecycle lacks withdrawal evidence'),",
    "endLine": 778,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "India DPDP readiness evidence"
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
    "pagePath": "findings/finding-in-dpdp-readiness/index.html",
    "snippetId": "source-in-dpdp-consent-withdrawal-gap",
    "sourcePath": "packages/racks/in-dpdp/src/inDpdpProbe.ts",
    "startLine": 758,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/racks/in-dpdp/src/inDpdpProbe.ts#L758-L778",
    "verifiedSourceHash": "sha256:c7c9d8e698e08d6ba8548e6e5e8dd3ab8c1995e581f1800b3bcbf3f14ea26bdb"
  },
  {
    "anchorId": "source-in-dpdp-children-context",
    "code": "if (adjunct.childrenDataStatus === 'unknown') {\n  return makeScopeContext(\n    'requires-customer-context',\n    dpdp,\n    sdfStatus,\n    adjunct.childrenDataStatus,\n    msg(\n      'rack.in-dpdp.scope.childrenUnknown',\n      'DPDP personal-data scope is declared, but children-data context is unknown, so criteria are not assessed as source-code failures.',",
    "endLine": 423,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "India DPDP readiness evidence"
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
    "pagePath": "findings/finding-in-dpdp-readiness/index.html",
    "snippetId": "source-in-dpdp-children-context",
    "sourcePath": "packages/racks/in-dpdp/src/inDpdpProbe.ts",
    "startLine": 408,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/racks/in-dpdp/src/inDpdpProbe.ts#L408-L423",
    "verifiedSourceHash": "sha256:2aef18d2d0825b5085d744696d38e48fada10ebb826b98ffa4d50d306f207abc"
  },
  {
    "anchorId": "source-in-dpdp-operator-evidence",
    "code": "function breachReadinessDescriptors(nodes: readonly SemanticNode[]): readonly InDpdpEvidenceDescriptor[] {\n  if (nodes.length === 0) return [];\n  return [\n    {\n      controlId: 'IN-DPDP-BREACH-READINESS',\n      ruleId: 'in-dpdp-breach-readiness-source-evidence',\n      severity: 'info',\n      evidenceMode: 'code-evidence',",
    "endLine": 824,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "India DPDP readiness evidence"
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
    "pagePath": "findings/finding-in-dpdp-readiness/index.html",
    "snippetId": "source-in-dpdp-operator-evidence",
    "sourcePath": "packages/racks/in-dpdp/src/inDpdpProbe.ts",
    "startLine": 804,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/racks/in-dpdp/src/inDpdpProbe.ts#L804-L824",
    "verifiedSourceHash": "sha256:334c02bb6dcdb996a03a6221a13a8743c9880a334b09a9edd6dc1f2fa68e916c"
  }
]
;
