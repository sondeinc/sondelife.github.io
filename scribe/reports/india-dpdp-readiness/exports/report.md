# India DPDP Readiness Evidence Pack

Sonde Scribe alpha

Scope: Sonde self-analysis and Express reference corpus India DPDP corpus
Runtime: file-direct
Report type: in-dpdp
Export source: exports/report.md

<a id="section-overview"></a>
## Overview

This report packages source-visible India DPDP evidence from the pinned Sonde self-analysis and Express corpus. It records readiness evidence and gaps, while legal conclusions, operator evidence, and regulator-facing decisions stay outside the artifact.

**Legal claim boundary:** The report deliberately uses readiness evidence language, excludes requires-customer-context and attestation-required states from scoring, and refuses unsupported DPDP certification claims.

- **Evidence boundary:** 3 source-visible DPDP evidence items and 1 explicit readiness gap are represented with source-line provenance.
- **Scoring boundary:** **not scored**: customer-context and attestation-required states are excluded from pass/fail scoring.
- **Conformance boundary:** G11 conformance emits HTML, Markdown, and a fail-closed India DPDP conformance boundary. Unsupported legal-certification claims remain disabled.

<a id="finding-in-dpdp-consent-lifecycle"></a>
## DPDP notice and consent lifecycle evidence is source-visible

Severity: Info
Classification: India DPDP readiness
Language: typescript
Framework: India DPDP readiness evidence

The evidence mapper distinguishes notice, purpose-bound consent capture, versioning, and withdrawal before presenting the control as source-visible readiness evidence.

**Criterion:** IN-DPDP-NOTICE-CONSENT

**Recommended next step:** Attach this source-visible evidence to customer-owned notice content, legal basis, rollout timing, and operating request-handling evidence.

<a id="source-in-dpdp-consent-lifecycle"></a>
### India DPDP readiness evidence source evidence

packages/racks/in-dpdp/src/inDpdpProbe.ts L731-L755

Source: packages/racks/in-dpdp/src/inDpdpProbe.ts L731-L755

```typescript
function consentLifecycleDescriptors(
  consentLifecycle: InDpdpConsentLifecycleSummary,
): readonly InDpdpEvidenceDescriptor[] {
  if (consentLifecycle.status === 'not-observed') return [];
  if (consentLifecycle.status === 'complete') {
    return [
      {
        controlId: 'IN-DPDP-NOTICE-CONSENT',
        ruleId: 'in-dpdp-consent-lifecycle-source-evidence',
        severity: 'info',
        evidenceMode: 'code-evidence',
```

<a id="finding-in-dpdp-consent-withdrawal-gap"></a>
## Consent withdrawal remains a source-visible readiness gap in the sample flow

Severity: Warning
Classification: India DPDP readiness
Language: typescript
Framework: India DPDP readiness evidence

A partial consent lifecycle is reported as a readiness gap only after DPDP scope is supplied; the report does not infer lawful consent from source code.

**Criterion:** IN-DPDP-NOTICE-CONSENT

**Recommended next step:** Add or link a withdrawal flow and route it through the same consent ledger and versioning evidence used for notice and purpose-bound consent capture.

<a id="source-in-dpdp-consent-withdrawal-gap"></a>
### India DPDP readiness evidence source evidence

packages/racks/in-dpdp/src/inDpdpProbe.ts L758-L778

Source: packages/racks/in-dpdp/src/inDpdpProbe.ts L758-L778

```typescript
if (consentLifecycle.hasWithdrawal) return [];
return [
  {
    controlId: 'IN-DPDP-NOTICE-CONSENT',
    ruleId: 'in-dpdp-consent-withdrawal-missing',
    severity: 'warning',
    evidenceMode: 'gap-evidence',
    title: msg('rack.in-dpdp.finding.consentWithdrawal.title', 'Consent lifecycle lacks withdrawal evidence'),
```

<a id="finding-in-dpdp-children-context"></a>
## Children data duties require customer context before scoring

Severity: Info
Classification: India DPDP readiness
Language: typescript
Framework: India DPDP readiness evidence

Unknown children-data context renders requires-customer-context instead of a source-code failure, preventing false positives for software that is not child-directed.

**Criterion:** IN-DPDP-SCOPE-ROLE

**Recommended next step:** Provide customer-owned DPDP applicability context before SDF or children-data duties are treated as assessed evidence.

<a id="source-in-dpdp-children-context"></a>
### India DPDP readiness evidence source evidence

packages/racks/in-dpdp/src/inDpdpProbe.ts L408-L423

Source: packages/racks/in-dpdp/src/inDpdpProbe.ts L408-L423

```typescript
if (adjunct.childrenDataStatus === 'unknown') {
  return makeScopeContext(
    'requires-customer-context',
    dpdp,
    sdfStatus,
    adjunct.childrenDataStatus,
    msg(
      'rack.in-dpdp.scope.childrenUnknown',
      'DPDP personal-data scope is declared, but children-data context is unknown, so criteria are not assessed as source-code failures.',
```

<a id="finding-in-dpdp-operator-evidence"></a>
## Breach notification readiness keeps operator evidence outside scoring

Severity: Info
Classification: India DPDP readiness
Language: typescript
Framework: India DPDP readiness evidence

Incident intake and notification pathways can be readiness evidence, but actual breach determination and notification completion remain operator-owned.

**Criterion:** IN-DPDP-BREACH-READINESS

**Recommended next step:** Link readiness evidence to customer incident classification, escalation, notification decisioning, and audit records.

<a id="source-in-dpdp-operator-evidence"></a>
### India DPDP readiness evidence source evidence

packages/racks/in-dpdp/src/inDpdpProbe.ts L804-L824

Source: packages/racks/in-dpdp/src/inDpdpProbe.ts L804-L824

```typescript
function breachReadinessDescriptors(nodes: readonly SemanticNode[]): readonly InDpdpEvidenceDescriptor[] {
  if (nodes.length === 0) return [];
  return [
    {
      controlId: 'IN-DPDP-BREACH-READINESS',
      ruleId: 'in-dpdp-breach-readiness-source-evidence',
      severity: 'info',
      evidenceMode: 'code-evidence',
```

<a id="fix-plan-in-dpdp-readiness"></a>
## Conformance plan: keep India DPDP claims fail-closed

Publish readiness evidence only when source provenance, locale completeness, corpus pins, and unsupported-claim checks are all present.

1. Keep HTML, Markdown, conformance JSON, source snippets, and corpus pins in the public package manifest.
2. Enable future DPDP or CERT-In report claims only after G11 schemas and hostile negative-claim fixtures prove the supported boundary.

Fix plan link: [Conformance plan: keep India DPDP claims fail-closed](../fix-plans/finding-in-dpdp-readiness/index.html#fix-plan-in-dpdp-readiness)

Public export note: this Markdown file is derived from public runtime manifest and search-source data only. Private receipt data and gated fix-plan prose are excluded.
