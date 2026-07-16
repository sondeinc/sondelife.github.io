window.__SCRIBE_SOURCE_SNIPPETS__ = [
  {
    "anchorId": "source-oscal-profile-intake",
    "code": "OSCAL Catalog/Profile intake summary\nProfiles normalized: 22\nCatalogs linked: 23\nImport links resolved: 22\nDangling import links: 0\nUnique controls selected or excluded: 463\nValidation issues: 0\nUnsupported package-family artifacts: 12\nRaw intake JSON download: exports/oscal-profile-intake.json\nCatalog provenance data: data/oscal-catalog-provenance.json",
    "endLine": 10,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "OSCAL Catalog/Profile / FedRAMP Rev. 5"
      },
      "msgid": "scribe.report.complianceExample.source.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "{framework} source evidence"
        }
      }
    },
    "language": "text",
    "pagePath": "findings/finding-oscal-profile-intake/index.html",
    "snippetId": "source-oscal-profile-intake",
    "sourcePath": "data/oscal-profile-intake-summary.txt",
    "startLine": 1,
    "verifiedSourceHash": "sha256:28dafed520f39cbe9b0b79b91467c9a02386851efbb91f018e16c27998025ea7"
  },
  {
    "anchorId": "source-oscal-profile-imports",
    "code": "OSCAL import-resolution summary\nResolved imports: 22\nDangling imports: 0\nProfiles scanned: 22\nCatalog/profile provenance records: 45\nRepresentative import links:\n- resolved: fedramp-resources/baselines/rev5/json/FedRAMP_rev5_catalog_tailoring_profile.json imports #39653e2d-c342-4b6e-93bd-5a324e8f7e3f -> nist-oscal-content-v1-4/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json\n- resolved: fedramp-resources/baselines/rev5/json/FedRAMP_rev5_HIGH-baseline_profile.json imports #051a77c1-b61d-4995-8275-dacfe688d510 -> fedramp-resources/baselines/rev5/json/FedRAMP_rev5_catalog_tailoring_profile.json\n- resolved: fedramp-resources/baselines/rev5/json/FedRAMP_rev5_LI-SaaS-baseline_profile.json imports #051a77c1-b61d-4995-8275-dacfe688d510 -> fedramp-resources/baselines/rev5/json/FedRAMP_rev5_LOW-baseline_profile.json\n- resolved: fedramp-resources/baselines/rev5/json/FedRAMP_rev5_LOW-baseline_profile.json imports #051a77c1-b61d-4995-8275-dacfe688d510 -> fedramp-resources/baselines/rev5/json/FedRAMP_rev5_catalog_tailoring_profile.json",
    "endLine": 10,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "OSCAL Catalog/Profile / FedRAMP Rev. 5"
      },
      "msgid": "scribe.report.complianceExample.source.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "{framework} source evidence"
        }
      }
    },
    "language": "text",
    "pagePath": "findings/finding-oscal-profile-intake/index.html",
    "snippetId": "source-oscal-profile-imports",
    "sourcePath": "data/oscal-profile-intake-import-resolution.txt",
    "startLine": 1,
    "verifiedSourceHash": "sha256:ce27574c93148d1a8b43a98fbe5b89c7e7e05b3688f16b2cecb150e78278e562"
  },
  {
    "anchorId": "source-oscal-profile-controls",
    "code": "OSCAL control-selection summary\nUnique profile controls selected or excluded: 463\nUnique catalog controls in provenance: 1216\nProfiles with tailoring: 8\nODP parameter summaries: 1818\nRepresentative controls: ac-1, ac-2, ac-2.1, ac-2.2, ac-2.3, ac-2.4, ac-2.5, ac-2.7, ac-2.9, ac-2.11, ac-2.12, ac-2.13",
    "endLine": 6,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "OSCAL Catalog/Profile / FedRAMP Rev. 5"
      },
      "msgid": "scribe.report.complianceExample.source.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "{framework} source evidence"
        }
      }
    },
    "language": "text",
    "pagePath": "findings/finding-oscal-profile-intake/index.html",
    "snippetId": "source-oscal-profile-controls",
    "sourcePath": "data/oscal-profile-intake-control-selection.txt",
    "startLine": 1,
    "verifiedSourceHash": "sha256:b3d42dbd49f297eaca1ebde5989d36e05ad9da98e537cb08b77d65ef21b3bfa4"
  },
  {
    "anchorId": "source-oscal-profile-unsupported-boundary",
    "code": "Unsupported OSCAL package-family boundary\nFamilies kept fail-closed: poam, sap, sar, ssp\nDetected unsupported artifact files: 12\nProfile-declared unsupported boundaries: 88\nReasoning:\n- System Security Plan packages require system ownership and implementation statements beyond artifact analysis.\n- System Security Plan packages require system ownership and implementation statements beyond artifact analysis.\n- System Security Plan packages require system ownership and implementation statements beyond artifact analysis.\n- System Security Plan packages require system ownership and implementation statements beyond artifact analysis.\nRaw intake JSON download: exports/oscal-profile-intake.json",
    "endLine": 10,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "OSCAL Catalog/Profile / FedRAMP Rev. 5"
      },
      "msgid": "scribe.report.complianceExample.source.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "{framework} source evidence"
        }
      }
    },
    "language": "text",
    "pagePath": "findings/finding-oscal-profile-intake/index.html",
    "snippetId": "source-oscal-profile-unsupported-boundary",
    "sourcePath": "data/oscal-profile-intake-unsupported-boundary.txt",
    "startLine": 1,
    "verifiedSourceHash": "sha256:fbbbf249876281a6bc4ae8925c317f46d10f0f0a145daeefcf8597cee40ebe12"
  }
]
;
