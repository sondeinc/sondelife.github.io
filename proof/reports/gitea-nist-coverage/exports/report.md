# Gitea — NIST 800-53 Coverage

Sonde Scribe alpha

Scope: Gitea NIST/FedRAMP coverage corpus
Runtime: file-direct
Report type: nist-coverage
Export source: exports/report.md

<a id="section-overview"></a>
## Overview

This report packages a pinned NIST/FedRAMP rollup as a Scribe html-daylight report and exposes only supported standard artifacts.

**Coverage boundary:** 11 controls are satisfied, 35 are unsatisfied, and 55 require customer context instead of being mislabeled as SSP evidence.

- **Control accounting:** 103 NIST controls across 9 families are accounted with 55 customer-context entries left explicit.
- **Coverage score:** **107** / 1000 (11/103 controls satisfied)
- **Conformance boundary:** OSCAL Assessment Results are emitted. OSCAL SSP, SAP, SAR, POA&M, Component Definition, Catalog, and Profile artifacts are declared unsupported for this package.

<a id="diagram-nist-coverage-controls"></a>
## NIST family coverage matrix

The matrix is generated from the same rollup used for HTML, Markdown, and OSCAL Assessment Results.

Projection: NIST family coverage matrix
Source: finding-nist-coverage
Mermaid: unavailable
SVG: unavailable

- **AC Access Control:** 8/19 present controls
- **AU Audit and Accountability:** 0/12 present controls
- **CM Configuration Management:** 1/14 present controls
- **IA Identification and Authentication:** 0/15 present controls
- **SC System and Communications Protection:** 1/15 present controls
- **SI System and Information Integrity:** 1/14 present controls
- **RA Risk Assessment:** 0/4 present controls
- **SA System and Services Acquisition:** 0/6 present controls
- **PT PII Processing and Transparency:** 0/4 present controls

<a id="finding-nist-coverage"></a>
## NIST controls require explicit supported-artifact boundaries

Severity: Warning
Classification: NIST FedRAMP coverage
Language: text
Framework: NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5

The NIST coverage package emits supported OSCAL Assessment Results and declares unsupported federal package artifacts separately.

**Criterion:** OSCAL Assessment Results only; SSP/SAP/SAR/POA&M unsupported

**Recommended next step:** Keep unsupported standard artifacts fail-closed until G11 data-model conformance is implemented.

<a id="source-nist-coverage-rollup"></a>
### NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5 source evidence

data/nist-rollup-summary.txt L1-L19

Source: data/nist-rollup-summary.txt L1-L19

```text
NIST/FedRAMP coverage summary
Total control families: 9
Total controls accounted: 103
Satisfied controls: 11
Customer-context controls: 55
Unsatisfied controls: 35
Coverage ratio: 10.7%
Raw rollup JSON download: data/nist-rollup.json
OSCAL Assessment Results download: exports/nist-coverage.oscal-assessment-results.json
Family summary:
- AC Access Control: 8/19 satisfied, 3 customer-context, 8 unsatisfied
- AU Audit and Accountability: 0/12 satisfied, 7 customer-context, 5 unsatisfied
- CM Configuration Management: 1/14 satisfied, 11 customer-context, 2 unsatisfied
- IA Identification and Authentication: 0/15 satisfied, 3 customer-context, 10 unsatisfied
- SC System and Communications Protection: 1/15 satisfied, 9 customer-context, 5 unsatisfied
- SI System and Information Integrity: 1/14 satisfied, 9 customer-context, 4 unsatisfied
- RA Risk Assessment: 0/4 satisfied, 3 customer-context, 1 unsatisfied
- SA System and Services Acquisition: 0/6 satisfied, 6 customer-context, 0 unsatisfied
- PT PII Processing and Transparency: 0/4 satisfied, 4 customer-context, 0 unsatisfied
```

<a id="finding-nist-coverage-family-ac"></a>
## AC Access Control coverage: 8/19 controls satisfied

Severity: Warning
Classification: NIST FedRAMP coverage
Language: text
Framework: NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5

Access Control has 8 satisfied controls, 3 customer-context controls, and 8 unsatisfied controls.

**Criterion:** Family-level NIST controls must keep satisfied, customer-context, and unsatisfied states separate.

**Recommended next step:** Review customer-context and unsatisfied controls before making SSP/SAP/SAR/POA&M claims.

<a id="source-nist-coverage-family-ac"></a>
### NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5 source evidence

data/nist-coverage-family-ac-summary.txt L1-L10

Source: data/nist-coverage-family-ac-summary.txt L1-L10

```text
NIST family AC: Access Control
Total controls: 19
Satisfied controls: 8
Customer-context controls: 3
Unsatisfied controls: 8
Validation-resolved controls: 10
Evidence-tier controls: 9
Deferred-elsewhere controls: 0
Representative controls: ac-3:absent, ac-3.7:absent, ac-3.8:absent, ac-3.13:absent, ac-4:requires-customer-context, ac-6:present, ac-6.1:present, ac-6.2:present, ac-6.5:present, ac-6.8:requires-customer-context
Raw rollup JSON download: data/nist-rollup.json
```

<a id="finding-nist-coverage-family-au"></a>
## AU Audit and Accountability coverage: 0/12 controls satisfied

Severity: Warning
Classification: NIST FedRAMP coverage
Language: text
Framework: NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5

Audit and Accountability has 0 satisfied controls, 7 customer-context controls, and 5 unsatisfied controls.

**Criterion:** Family-level NIST controls must keep satisfied, customer-context, and unsatisfied states separate.

**Recommended next step:** Review customer-context and unsatisfied controls before making SSP/SAP/SAR/POA&M claims.

<a id="source-nist-coverage-family-au"></a>
### NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5 source evidence

data/nist-coverage-family-au-summary.txt L1-L10

Source: data/nist-coverage-family-au-summary.txt L1-L10

```text
NIST family AU: Audit and Accountability
Total controls: 12
Satisfied controls: 0
Customer-context controls: 7
Unsatisfied controls: 5
Validation-resolved controls: 5
Evidence-tier controls: 7
Deferred-elsewhere controls: 0
Representative controls: au-2:absent, au-3:absent, au-3.1:absent, au-4:requires-customer-context, au-5:requires-customer-context, au-6:requires-customer-context, au-8:absent, au-9:requires-customer-context, au-10:requires-customer-context, au-12:absent
Raw rollup JSON download: data/nist-rollup.json
```

<a id="finding-nist-coverage-family-cm"></a>
## CM Configuration Management coverage: 1/14 controls satisfied

Severity: Warning
Classification: NIST FedRAMP coverage
Language: text
Framework: NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5

Configuration Management has 1 satisfied controls, 11 customer-context controls, and 2 unsatisfied controls.

**Criterion:** Family-level NIST controls must keep satisfied, customer-context, and unsatisfied states separate.

**Recommended next step:** Review customer-context and unsatisfied controls before making SSP/SAP/SAR/POA&M claims.

<a id="source-nist-coverage-family-cm"></a>
### NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5 source evidence

data/nist-coverage-family-cm-summary.txt L1-L10

Source: data/nist-coverage-family-cm-summary.txt L1-L10

```text
NIST family CM: Configuration Management
Total controls: 14
Satisfied controls: 1
Customer-context controls: 11
Unsatisfied controls: 2
Validation-resolved controls: 2
Evidence-tier controls: 12
Deferred-elsewhere controls: 0
Representative controls: cm-2:requires-customer-context, cm-3:requires-customer-context, cm-4:requires-customer-context, cm-5:present, cm-6:absent, cm-6.1:requires-customer-context, cm-7:absent, cm-7.1:requires-customer-context, cm-7.2:requires-customer-context, cm-7.4:requires-customer-context
Raw rollup JSON download: data/nist-rollup.json
```

<a id="finding-nist-coverage-family-ia"></a>
## IA Identification and Authentication coverage: 0/15 controls satisfied

Severity: Warning
Classification: NIST FedRAMP coverage
Language: text
Framework: NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5

Identification and Authentication has 0 satisfied controls, 3 customer-context controls, and 10 unsatisfied controls.

**Criterion:** Family-level NIST controls must keep satisfied, customer-context, and unsatisfied states separate.

**Recommended next step:** Review customer-context and unsatisfied controls before making SSP/SAP/SAR/POA&M claims.

<a id="source-nist-coverage-family-ia"></a>
### NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5 source evidence

data/nist-coverage-family-ia-summary.txt L1-L10

Source: data/nist-coverage-family-ia-summary.txt L1-L10

```text
NIST family IA: Identification and Authentication
Total controls: 15
Satisfied controls: 0
Customer-context controls: 3
Unsatisfied controls: 10
Validation-resolved controls: 6
Evidence-tier controls: 9
Deferred-elsewhere controls: 0
Representative controls: ia-2:absent, ia-2.1:partial, ia-2.2:partial, ia-2.6:absent, ia-2.8:absent, ia-5:absent, ia-5.1:absent, ia-5.2:requires-customer-context, ia-5.4:absent, ia-5.6:absent
Raw rollup JSON download: data/nist-rollup.json
```

<a id="finding-nist-coverage-family-sc"></a>
## SC System and Communications Protection coverage: 1/15 controls satisfied

Severity: Warning
Classification: NIST FedRAMP coverage
Language: text
Framework: NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5

System and Communications Protection has 1 satisfied controls, 9 customer-context controls, and 5 unsatisfied controls.

**Criterion:** Family-level NIST controls must keep satisfied, customer-context, and unsatisfied states separate.

**Recommended next step:** Review customer-context and unsatisfied controls before making SSP/SAP/SAR/POA&M claims.

<a id="source-nist-coverage-family-sc"></a>
### NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5 source evidence

data/nist-coverage-family-sc-summary.txt L1-L10

Source: data/nist-coverage-family-sc-summary.txt L1-L10

```text
NIST family SC: System and Communications Protection
Total controls: 15
Satisfied controls: 1
Customer-context controls: 9
Unsatisfied controls: 5
Validation-resolved controls: 6
Evidence-tier controls: 9
Deferred-elsewhere controls: 0
Representative controls: sc-2:requires-customer-context, sc-3:requires-customer-context, sc-4:requires-customer-context, sc-5:requires-customer-context, sc-7:requires-customer-context, sc-8:gap, sc-8.1:gap, sc-12:requires-customer-context, sc-13:gap, sc-13.1:requires-customer-context
Raw rollup JSON download: data/nist-rollup.json
```

<a id="finding-nist-coverage-family-si"></a>
## SI System and Information Integrity coverage: 1/14 controls satisfied

Severity: Warning
Classification: NIST FedRAMP coverage
Language: text
Framework: NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5

System and Information Integrity has 1 satisfied controls, 9 customer-context controls, and 4 unsatisfied controls.

**Criterion:** Family-level NIST controls must keep satisfied, customer-context, and unsatisfied states separate.

**Recommended next step:** Review customer-context and unsatisfied controls before making SSP/SAP/SAR/POA&M claims.

<a id="source-nist-coverage-family-si"></a>
### NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5 source evidence

data/nist-coverage-family-si-summary.txt L1-L10

Source: data/nist-coverage-family-si-summary.txt L1-L10

```text
NIST family SI: System and Information Integrity
Total controls: 14
Satisfied controls: 1
Customer-context controls: 9
Unsatisfied controls: 4
Validation-resolved controls: 4
Evidence-tier controls: 10
Deferred-elsewhere controls: 0
Representative controls: si-2:absent, si-2.2:requires-customer-context, si-2.4:requires-customer-context, si-3:requires-customer-context, si-4:requires-customer-context, si-7:requires-customer-context, si-7.1:requires-customer-context, si-7.6:requires-customer-context, si-10:absent, si-10.5:absent
Raw rollup JSON download: data/nist-rollup.json
```

<a id="finding-nist-coverage-family-ra"></a>
## RA Risk Assessment coverage: 0/4 controls satisfied

Severity: Warning
Classification: NIST FedRAMP coverage
Language: text
Framework: NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5

Risk Assessment has 0 satisfied controls, 3 customer-context controls, and 1 unsatisfied controls.

**Criterion:** Family-level NIST controls must keep satisfied, customer-context, and unsatisfied states separate.

**Recommended next step:** Review customer-context and unsatisfied controls before making SSP/SAP/SAR/POA&M claims.

<a id="source-nist-coverage-family-ra"></a>
### NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5 source evidence

data/nist-coverage-family-ra-summary.txt L1-L10

Source: data/nist-coverage-family-ra-summary.txt L1-L10

```text
NIST family RA: Risk Assessment
Total controls: 4
Satisfied controls: 0
Customer-context controls: 3
Unsatisfied controls: 1
Validation-resolved controls: 1
Evidence-tier controls: 3
Deferred-elsewhere controls: 0
Representative controls: ra-5:absent, ra-5.2:requires-customer-context, ra-5.4:requires-customer-context, ra-5.5:requires-customer-context
Raw rollup JSON download: data/nist-rollup.json
```

<a id="finding-nist-coverage-family-sa"></a>
## SA System and Services Acquisition coverage: 0/6 controls satisfied

Severity: Info
Classification: NIST FedRAMP coverage
Language: text
Framework: NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5

System and Services Acquisition has 0 satisfied controls, 6 customer-context controls, and 0 unsatisfied controls.

**Criterion:** Family-level NIST controls must keep satisfied, customer-context, and unsatisfied states separate.

**Recommended next step:** Review customer-context and unsatisfied controls before making SSP/SAP/SAR/POA&M claims.

<a id="source-nist-coverage-family-sa"></a>
### NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5 source evidence

data/nist-coverage-family-sa-summary.txt L1-L10

Source: data/nist-coverage-family-sa-summary.txt L1-L10

```text
NIST family SA: System and Services Acquisition
Total controls: 6
Satisfied controls: 0
Customer-context controls: 6
Unsatisfied controls: 0
Validation-resolved controls: 0
Evidence-tier controls: 6
Deferred-elsewhere controls: 0
Representative controls: sa-4.9:requires-customer-context, sa-8:requires-customer-context, sa-10:requires-customer-context, sa-11:requires-customer-context, sa-11.1:requires-customer-context, sa-15:requires-customer-context
Raw rollup JSON download: data/nist-rollup.json
```

<a id="finding-nist-coverage-family-pt"></a>
## PT PII Processing and Transparency coverage: 0/4 controls satisfied

Severity: Info
Classification: NIST FedRAMP coverage
Language: text
Framework: NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5

PII Processing and Transparency has 0 satisfied controls, 4 customer-context controls, and 0 unsatisfied controls.

**Criterion:** Family-level NIST controls must keep satisfied, customer-context, and unsatisfied states separate.

**Recommended next step:** Review customer-context and unsatisfied controls before making SSP/SAP/SAR/POA&M claims.

<a id="source-nist-coverage-family-pt"></a>
### NIST SP 800-53 Rev. 5 / FedRAMP Rev. 5 source evidence

data/nist-coverage-family-pt-summary.txt L1-L10

Source: data/nist-coverage-family-pt-summary.txt L1-L10

```text
NIST family PT: PII Processing and Transparency
Total controls: 4
Satisfied controls: 0
Customer-context controls: 4
Unsatisfied controls: 0
Validation-resolved controls: 0
Evidence-tier controls: 4
Deferred-elsewhere controls: 0
Representative controls: pt-2:requires-customer-context, pt-3:requires-customer-context, pt-6:requires-customer-context, pt-7:requires-customer-context
Raw rollup JSON download: data/nist-rollup.json
```

<a id="fix-plan-nist-coverage"></a>
## Fix plan

Live, per-finding fix plans generate automatically when Sonde analyzes your repository. This curated showcase demonstrates the report; see automated remediation in action on a live example.

Fix plan link: [Fix plan](../fix-plans/finding-nist-coverage/index.html#fix-plan-nist-coverage)

Public export note: this Markdown file is derived from public runtime manifest and search-source data only. Private receipt data and gated fix-plan prose are excluded.
