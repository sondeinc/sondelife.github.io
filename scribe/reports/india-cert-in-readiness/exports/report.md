# India CERT-In Readiness Evidence Pack

Sonde Scribe alpha

Scope: Sonde self-analysis and Express reference corpus India CERT-In corpus
Runtime: file-direct
Report type: in-cert-in
Export source: exports/report.md

<a id="section-overview"></a>
## Overview

This report packages source-visible India CERT-In evidence from the pinned Sonde self-analysis and Express corpus. It records readiness evidence and gaps, while legal conclusions, operator evidence, and regulator communication decisions stay outside the artifact.

**Regulator claim boundary:** The report deliberately uses readiness evidence language, excludes requires-customer-context and attestation-required states from scoring, and refuses unsupported CERT-In certification or filing claims.

- **Evidence boundary:** 3 source-visible CERT-In readiness evidence items and 1 explicit readiness gap are represented with source-line provenance.
- **Scoring boundary:** **not scored**: customer-context, operator-evidence, and regulator-filing states are excluded from pass/fail scoring.
- **Conformance boundary:** G11 conformance emits HTML, Markdown, and a fail-closed India CERT-In conformance boundary. Unsupported legal-certification or regulator-filing claims remain disabled.

<a id="finding-in-cert-in-incident-readiness"></a>
## CERT-In incident-reporting readiness evidence is source-visible

Severity: Info
Classification: India CERT-In readiness
Language: typescript
Framework: India CERT-In readiness evidence

The evidence mapper requires incident endpoint, escalation workflow, contact target, and SLA evidence before presenting the control as complete reporting-readiness support.

**Criterion:** IN-CERT-IN-INCIDENT-REPORTING-READINESS

**Recommended next step:** Link this source-visible evidence to customer-owned severity taxonomy, CERT-In contact route, six-hour reporting policy, and incident decision records.

<a id="source-in-cert-in-incident-readiness"></a>
### India CERT-In readiness evidence source evidence

packages/racks/in-cert-in/src/inCertInProbe.ts L439-L475

Source: packages/racks/in-cert-in/src/inCertInProbe.ts L439-L475

```typescript
function incidentReportingDescriptors(
  incidentReadiness: IncidentReadinessEvidenceGroups,
): readonly InCertInEvidenceDescriptor[] {
  if (incidentReadiness.readinessNodes.length === 0) return [];
  const complete = incidentReadiness.hasReportingReadinessProfile;
  return [
    {
      controlId: 'IN-CERT-IN-INCIDENT-REPORTING-READINESS',
      ruleId: complete ? 'in-cert-in-incident-reporting-readiness' : 'in-cert-in-incident-reporting-partial',
      severity: complete ? 'info' : 'warning',
      evidenceMode: complete ? 'code-evidence' : 'gap-evidence',
```

<a id="finding-in-cert-in-log-retention"></a>
## Log-retention readiness stays separate from operational retention proof

Severity: Info
Classification: India CERT-In readiness
Language: typescript
Framework: India CERT-In readiness evidence

Source-visible logging and retention configuration can support readiness evidence, while production retention duration and storage location remain customer-owned.

**Criterion:** IN-CERT-IN-LOG-RETENTION-READINESS

**Recommended next step:** Link logging evidence to retention duration, Indian storage or access policy where applicable, tamper-resistance, and operational audit-record procedures.

<a id="source-in-cert-in-log-retention"></a>
### India CERT-In readiness evidence source evidence

packages/racks/in-cert-in/src/inCertInProbe.ts L478-L502

Source: packages/racks/in-cert-in/src/inCertInProbe.ts L478-L502

```typescript
function logRetentionDescriptors(nodes: readonly SemanticNode[]): readonly InCertInEvidenceDescriptor[] {
  const evidenceNodes = nodesWithEvidence(nodes, LOG_RETENTION_BOOLEAN_KEYS, LOG_RETENTION_LABELS, {
    numberKeys: LOG_RETENTION_NUMBER_KEYS,
  });
  if (evidenceNodes.length === 0) return [];
  return [
    {
      controlId: 'IN-CERT-IN-LOG-RETENTION-READINESS',
      ruleId: 'in-cert-in-log-retention-readiness',
      severity: 'info',
      evidenceMode: 'code-evidence',
```

<a id="finding-in-cert-in-time-sync"></a>
## Time-synchronization readiness is config evidence, not a live clock assertion

Severity: Info
Classification: India CERT-In readiness
Language: typescript
Framework: India CERT-In readiness evidence

NTP or trusted time-source declarations can support readiness, but live clock synchronization and drift monitoring remain operator evidence.

**Criterion:** IN-CERT-IN-TIME-SYNC-READINESS

**Recommended next step:** Link the source-visible time-source declaration to production NTP configuration, monitoring, and incident evidence retention.

<a id="source-in-cert-in-time-sync"></a>
### India CERT-In readiness evidence source evidence

packages/racks/in-cert-in/src/inCertInProbe.ts L504-L528

Source: packages/racks/in-cert-in/src/inCertInProbe.ts L504-L528

```typescript
function timeSyncDescriptors(nodes: readonly SemanticNode[]): readonly InCertInEvidenceDescriptor[] {
  const evidenceNodes = nodesWithEvidence(nodes, TIME_SYNC_BOOLEAN_KEYS, TIME_SYNC_LABELS, {
    stringKeys: TIME_SYNC_STRING_KEYS,
  });
  if (evidenceNodes.length === 0) return [];
  return [
    {
      controlId: 'IN-CERT-IN-TIME-SYNC-READINESS',
      ruleId: 'in-cert-in-time-sync-readiness',
      severity: 'info',
      evidenceMode: 'code-evidence',
```

<a id="finding-in-cert-in-dependency-risk"></a>
## Dependency vulnerability evidence is readiness triage, not reportability proof

Severity: Warning
Classification: India CERT-In readiness
Language: typescript
Framework: India CERT-In readiness evidence

Dependency vulnerability or lockfile risk evidence may support cyber-readiness review, but exploitability, reportability, and remediation completion remain operator evidence.

**Criterion:** IN-CERT-IN-INCIDENT-REPORTING-READINESS

**Recommended next step:** Triage dependency risk with SBOM, patch SLA, exploitability, incident reportability, and customer remediation evidence.

<a id="source-in-cert-in-dependency-risk"></a>
### India CERT-In readiness evidence source evidence

packages/racks/in-cert-in/src/inCertInProbe.ts L582-L604

Source: packages/racks/in-cert-in/src/inCertInProbe.ts L582-L604

```typescript
function dependencyRiskDescriptors(nodes: readonly SemanticNode[]): readonly InCertInEvidenceDescriptor[] {
  const evidenceNodes = nodes.filter(isDependencyRiskNode);
  if (evidenceNodes.length === 0) return [];
  return [
    {
      controlId: 'IN-CERT-IN-INCIDENT-REPORTING-READINESS',
      ruleId: 'in-cert-in-dependency-risk-readiness',
      severity: 'warning',
      evidenceMode: 'gap-evidence',
```

<a id="fix-plan-in-cert-in-readiness"></a>
## Conformance plan: keep India CERT-In claims fail-closed

Publish readiness evidence only when source provenance, locale completeness, corpus pins, and unsupported-claim checks are all present.

1. Keep HTML, Markdown, conformance JSON, source snippets, and corpus pins in the public package manifest.
2. Enable future CERT-In report claims only after G11 schemas and hostile negative-claim fixtures prove the supported boundary.

Fix plan link: [Conformance plan: keep India CERT-In claims fail-closed](../fix-plans/finding-in-cert-in-readiness/index.html#fix-plan-in-cert-in-readiness)

Public export note: this Markdown file is derived from public runtime manifest and search-source data only. Private receipt data and gated fix-plan prose are excluded.
