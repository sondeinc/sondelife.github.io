# FedRAMP Rev 5 OSCAL Profile Intake

Sonde Scribe alpha

Scope: FedRAMP Resources and NIST OSCAL Content Catalog/Profile corpora
Runtime: file-direct
Report type: oscal-profile-intake
Export source: exports/report.md

<a id="section-overview"></a>
## Overview

This Scribe package validates OSCAL Catalog/Profile inputs and records provenance for import resolution, control membership, tailoring, ODPs, and unsupported package-family boundaries.

**Validation boundary:** Catalog/Profile evidence is artifact-analysis achievable; SSP, SAP, SAR, and POA&M generation remains unsupported without human process inputs.

- **Catalog/Profile intake:** 22 OSCAL Profile artifact(s) and 23 Catalog artifact(s) were normalized with 22 resolved import link(s).
- **Import validation score:** **1000** / 1000 (0 validation issue(s))
- **Package boundary:** 12 unsupported SSP/SAP/SAR/POA&M artifact occurrence(s) remained fail-closed instead of being emitted as package evidence.

<a id="diagram-oscal-profile-intake"></a>
## OSCAL intake summary

The visualization is a source-data table showing the count of normalized profiles, catalogs, resolved imports, dangling imports, issues, and unsupported artifacts.

Projection: OSCAL profile intake summary
Source: finding-oscal-profile-intake
Mermaid: unavailable
SVG: unavailable

- **Profiles:** 22 artifacts
- **Catalogs:** 23 artifacts
- **Resolved imports:** 22 links
- **Dangling imports:** 0 links
- **Validation issues:** 0 issues
- **Unsupported artifacts:** 12 fail-closed

<a id="finding-oscal-profile-intake"></a>
## OSCAL Catalog/Profile intake is provenance-bound

Severity: Info
Classification: OSCAL profile intake
Language: text
Framework: OSCAL Catalog/Profile / FedRAMP Rev. 5

The package emits Catalog/Profile intake evidence and leaves human-process package families fail-closed.

**Criterion:** Catalog/Profile intake only; SSP/SAP/SAR/POA&M unsupported

**Recommended next step:** Resolve dangling imports or unknown controls and keep unsupported package families fail-closed.

<a id="source-oscal-profile-intake"></a>
### OSCAL Catalog/Profile / FedRAMP Rev. 5 source evidence

data/oscal-profile-intake-summary.txt L1-L10

Source: data/oscal-profile-intake-summary.txt L1-L10

```text
OSCAL Catalog/Profile intake summary
Profiles normalized: 22
Catalogs linked: 23
Import links resolved: 22
Dangling import links: 0
Unique controls selected or excluded: 463
Validation issues: 0
Unsupported package-family artifacts: 12
Raw intake JSON download: exports/oscal-profile-intake.json
Catalog provenance data: data/oscal-catalog-provenance.json
```

<a id="finding-oscal-profile-imports"></a>
## OSCAL imports resolved: 22 linked, 0 dangling

Severity: Info
Classification: OSCAL profile intake
Language: text
Framework: OSCAL Catalog/Profile / FedRAMP Rev. 5

22 import links resolved and 0 remain dangling.

**Criterion:** Profile import hrefs must resolve to pinned Catalog/Profile provenance.

**Recommended next step:** Pin the missing OSCAL catalogs or profiles beside the baseline corpus before claiming a complete package.

<a id="source-oscal-profile-imports"></a>
### OSCAL Catalog/Profile / FedRAMP Rev. 5 source evidence

data/oscal-profile-intake-import-resolution.txt L1-L10

Source: data/oscal-profile-intake-import-resolution.txt L1-L10

```text
OSCAL import-resolution summary
Resolved imports: 22
Dangling imports: 0
Profiles scanned: 22
Catalog/profile provenance records: 45
Representative import links:
- resolved: fedramp-resources/baselines/rev5/json/FedRAMP_rev5_catalog_tailoring_profile.json imports #39653e2d-c342-4b6e-93bd-5a324e8f7e3f -> nist-oscal-content-v1-4/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json
- resolved: fedramp-resources/baselines/rev5/json/FedRAMP_rev5_HIGH-baseline_profile.json imports #051a77c1-b61d-4995-8275-dacfe688d510 -> fedramp-resources/baselines/rev5/json/FedRAMP_rev5_catalog_tailoring_profile.json
- resolved: fedramp-resources/baselines/rev5/json/FedRAMP_rev5_LI-SaaS-baseline_profile.json imports #051a77c1-b61d-4995-8275-dacfe688d510 -> fedramp-resources/baselines/rev5/json/FedRAMP_rev5_LOW-baseline_profile.json
- resolved: fedramp-resources/baselines/rev5/json/FedRAMP_rev5_LOW-baseline_profile.json imports #051a77c1-b61d-4995-8275-dacfe688d510 -> fedramp-resources/baselines/rev5/json/FedRAMP_rev5_catalog_tailoring_profile.json
```

<a id="finding-oscal-profile-controls"></a>
## OSCAL profile controls normalized: 463 controls, 1818 ODP summaries

Severity: Info
Classification: OSCAL profile intake
Language: text
Framework: OSCAL Catalog/Profile / FedRAMP Rev. 5

463 profile controls and 1818 ODP parameter summaries are ready for review.

**Criterion:** Control include/exclude sets and ODP parameters must be explicit review inputs.

**Recommended next step:** Review tailoring deltas against the intended FedRAMP baseline before publishing downstream artifacts.

<a id="source-oscal-profile-controls"></a>
### OSCAL Catalog/Profile / FedRAMP Rev. 5 source evidence

data/oscal-profile-intake-control-selection.txt L1-L6

Source: data/oscal-profile-intake-control-selection.txt L1-L6

```text
OSCAL control-selection summary
Unique profile controls selected or excluded: 463
Unique catalog controls in provenance: 1216
Profiles with tailoring: 8
ODP parameter summaries: 1818
Representative controls: ac-1, ac-2, ac-2.1, ac-2.2, ac-2.3, ac-2.4, ac-2.5, ac-2.7, ac-2.9, ac-2.11, ac-2.12, ac-2.13
```

<a id="finding-oscal-profile-unsupported-boundary"></a>
## SSP/SAP/SAR/POA&M remain fail-closed: 12 unsupported artifact occurrence(s)

Severity: Info
Classification: OSCAL profile intake
Language: text
Framework: OSCAL Catalog/Profile / FedRAMP Rev. 5

12 unsupported artifact occurrence(s) are declared instead of generated.

**Criterion:** Unsupported package families must not be emitted as fake conformance files.

**Recommended next step:** Add SSP, SAP, SAR, and POA&M only after human-process evidence and G11 artifact conformance are certified.

<a id="source-oscal-profile-unsupported-boundary"></a>
### OSCAL Catalog/Profile / FedRAMP Rev. 5 source evidence

data/oscal-profile-intake-unsupported-boundary.txt L1-L10

Source: data/oscal-profile-intake-unsupported-boundary.txt L1-L10

```text
Unsupported OSCAL package-family boundary
Families kept fail-closed: poam, sap, sar, ssp
Detected unsupported artifact files: 12
Profile-declared unsupported boundaries: 88
Reasoning:
- System Security Plan packages require system ownership and implementation statements beyond artifact analysis.
- System Security Plan packages require system ownership and implementation statements beyond artifact analysis.
- System Security Plan packages require system ownership and implementation statements beyond artifact analysis.
- System Security Plan packages require system ownership and implementation statements beyond artifact analysis.
Raw intake JSON download: exports/oscal-profile-intake.json
```

<a id="fix-plan-oscal-profile-intake"></a>
## Fix plan

Live, per-finding fix plans generate automatically when Sonde analyzes your repository. This curated showcase demonstrates the report; see automated remediation in action on a live example.

Fix plan link: [Fix plan](../fix-plans/finding-oscal-profile-intake/index.html#fix-plan-oscal-profile-intake)

Public export note: this Markdown file is derived from public runtime manifest and search-source data only. Private receipt data and gated fix-plan prose are excluded.
