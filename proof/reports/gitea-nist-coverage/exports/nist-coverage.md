# Gitea — NIST 800-53 Coverage

<sub>source: data/nist-rollup-summary.txt:L1-L1</sub>

## Summary

11/103 controls present — Coverage 10.7%.

## Control families

### AC — Access Control {#oscal-family-ac}

| Control | Status | Validation | Rationale |
|---|---|---|---|
| `AC-3` | Not satisfied | access-enforcement |  |
| `AC-3.7` | Not satisfied | access-enforcement |  |
| `AC-3.8` | Not satisfied | access-enforcement | Runtime revocation and route-level deny evidence require customer tenancy context. |
| `AC-3.13` | Not satisfied | access-enforcement |  |
| `AC-4` | Requires customer context | — | Information-flow enforcement needs parseable allowlist or boundary enforcement evidence. |
| `AC-6` | Satisfied | least-privilege |  |
| `AC-6.1` | Satisfied | least-privilege | Authorized access-to-security-functions review needs role inventory and operator policy. |
| `AC-6.2` | Satisfied | least-privilege | Non-privileged account use needs identity-provider and break-glass procedure evidence. |
| `AC-6.5` | Satisfied | least-privilege | Privileged group membership is customer environment state, not source-only evidence. |
| `AC-6.8` | Requires customer context | — | Privileged command auditing requires source audit instrumentation plus runtime command-policy evidence; source-only audit events do not prove privileged command analysis. |
| `AC-6.9` | Satisfied | least-privilege | Requires audit witness on privileged-function call sites plus least-privilege evidence. |
| `AC-6.10` | Satisfied | least-privilege |  |
| `AC-7` | Not satisfied | access-enforcement |  |
| `AC-11` | Satisfied | session-management | Session-timeout values live in deployment config; source-pattern coverage is partial. |
| `AC-12` | Satisfied | session-management |  |
| `AC-17` | Gap | transmission-encryption |  |
| `AC-17.2` | Gap | transmission-encryption |  |
| `AC-17.8` | Gap | transmission-encryption |  |
| `AC-18` | Requires customer context | — | Wireless access restrictions require deployment and device-management evidence. |

### AU — Audit and Accountability {#oscal-family-au}

| Control | Status | Validation | Rationale |
|---|---|---|---|
| `AU-2` | Not satisfied | audit-event-coverage |  |
| `AU-3` | Not satisfied | audit-record-completeness |  |
| `AU-3.1` | Not satisfied | audit-record-completeness |  |
| `AU-4` | Requires customer context | — | Audit storage capacity counts only explicit audit-log capacity/rotation source evidence. |
| `AU-5` | Requires customer context | — | Audit processing failure response needs operational alerting and incident procedure evidence. |
| `AU-6` | Requires customer context | — | Audit review, correlation, reporting, SIEM rules, and alert handling are operational evidence beyond source-visible audit event generation. |
| `AU-8` | Not satisfied | audit-record-completeness |  |
| `AU-9` | Requires customer context | — | Audit record protection requires storage ACL and retention evidence beyond source code. |
| `AU-10` | Requires customer context | — | Non-repudiation counts only explicit signed event or identity-provider source evidence. |
| `AU-12` | Not satisfied | audit-event-coverage |  |
| `AU-12.1` | Requires customer context | — | System-wide audit generation requires deployment topology and platform coverage evidence; source coverage attests application instrumentation only. |
| `AU-12.3` | Requires customer context | — | Changes by authorized individuals need release-control and approval evidence plus audit instrumentation. |

### CM — Configuration Management {#oscal-family-cm}

| Control | Status | Validation | Rationale |
|---|---|---|---|
| `CM-2` | Requires customer context | — | Baseline configuration derives from declarative GitOps reconciliation (e.g. a Flux Kustomization pruning a committed source baseline) or otherwise needs committed manifests plus operator-approved baseline policy. |
| `CM-3` | Requires customer context | — | Configuration change control needs VCS and approval workflow evidence. |
| `CM-4` | Requires customer context | — | Impact analysis derives from blast-radius probe rather than a single validation. |
| `CM-5` | Satisfied | least-privilege | Access restrictions for change need repository permissions and deployment policy evidence. |
| `CM-6` | Not satisfied | configuration-defaults-safety |  |
| `CM-6.1` | Requires customer context | — | Automated configuration enforcement counts only a Kubernetes Namespace whose metadata.labels set pod-security.kubernetes.io/enforce to an enforcing Pod Security Admission level (restricted or baseline); audit/warn-only labels, the privileged no-op level, and Helm values without a Namespace kind remain customer deployment evidence. |
| `CM-7` | Not satisfied | least-functionality |  |
| `CM-7.1` | Requires customer context | — | Periodic review of allowed functions requires operator review cadence evidence. |
| `CM-7.2` | Requires customer context | — | Preventing program execution requires runtime policy and allowlist evidence. |
| `CM-7.4` | Requires customer context | — | Unauthorized software denylisting derives from admission-control deny-by-exception policy or endpoint/runtime denylist evidence. |
| `CM-7.5` | Requires customer context | — | Authorized software allowlisting derives from admission-control allow-by-exception policy or endpoint/runtime allowlist evidence. |
| `CM-8` | Requires customer context | — | Component inventory derives from parseable dependency graph or lockfile inventory evidence. |
| `CM-10` | Requires customer context | — | Software usage restrictions require license and operator policy evidence. |
| `CM-11` | Requires customer context | — | User-installed software restrictions require endpoint management evidence. |

### IA — Identification and Authentication {#oscal-family-ia}

| Control | Status | Validation | Rationale |
|---|---|---|---|
| `IA-2` | Not satisfied | auth-required |  |
| `IA-2.1` | Partially satisfied | mfa-required | Multifactor authentication for privileged accounts requires IdP configuration evidence. |
| `IA-2.2` | Partially satisfied | mfa-required | Multifactor authentication for non-privileged accounts requires IdP configuration evidence. |
| `IA-2.6` | Not satisfied | auth-required | Network access to privileged accounts requires runtime access-policy evidence. |
| `IA-2.8` | Not satisfied | auth-required | Replay-resistant authentication needs protocol and IdP configuration evidence. |
| `IA-5` | Not satisfied | credential-storage-safety |  |
| `IA-5.1` | Not satisfied | password-strength |  |
| `IA-5.2` | Requires customer context | — | Public-key authentication requires certificate lifecycle and key-store evidence. |
| `IA-5.4` | Not satisfied | password-strength | Automated password management support combines password policy with IdP evidence. |
| `IA-5.6` | Not satisfied | credential-storage-safety |  |
| `IA-5.7` | Not satisfied | credential-storage-safety |  |
| `IA-5.13` | Requires customer context | — | Password managers require customer endpoint and secret-management policy evidence. |
| `IA-6` | Not satisfied | auth-required |  |
| `IA-7` | Requires customer context | — | Cryptographic module authentication requires module inventory and FIPS evidence. |
| `IA-8` | Not satisfied | auth-required | Non-organizational user identification needs tenant and federation-policy evidence. |

### SC — System and Communications Protection {#oscal-family-sc}

| Control | Status | Validation | Rationale |
|---|---|---|---|
| `SC-2` | Requires customer context | — | Application partitioning needs process/runtime deployment evidence. |
| `SC-3` | Requires customer context | — | Security function isolation needs architecture and deployment-boundary evidence. |
| `SC-4` | Requires customer context | — | Information in shared system resources requires runtime isolation evidence. |
| `SC-5` | Requires customer context | — | Denial-of-service protection requires perimeter and capacity evidence. |
| `SC-7` | Requires customer context | — | Boundary protection requires network architecture and ingress policy evidence. |
| `SC-8` | Gap | transmission-encryption |  |
| `SC-8.1` | Gap | transmission-encryption |  |
| `SC-12` | Requires customer context | — | Cryptographic key establishment needs key-management lifecycle evidence. |
| `SC-13` | Gap | cryptographic-strength |  |
| `SC-13.1` | Requires customer context | — | FIPS-validated cryptography needs module inventory and validation evidence. |
| `SC-17` | Requires customer context | — | Public key infrastructure certificates count only declarative cert-manager source of truth: a Certificate resource with an issuerRef, a managed secretName, and a subject identity (commonName/dnsNames/uris/ipAddresses), or an Issuer/ClusterIssuer with a configured backend (selfSigned/ca/acme/vault/venafi). Trust-anchor approval, CA accreditation, and approved-service-provider facts remain customer/policy evidence. |
| `SC-23` | Satisfied | session-management |  |
| `SC-28` | Not satisfied | data-at-rest-encryption |  |
| `SC-28.1` | Not satisfied | data-at-rest-encryption |  |
| `SC-39` | Requires customer context | — | Process isolation counts only fully hardened workload securityContext source evidence (runAsNonRoot, allowPrivilegeEscalation:false, readOnlyRootFilesystem, dropped ALL capabilities, and a seccomp profile); broader runtime-sandbox posture remains customer deployment evidence. |

### SI — System and Information Integrity {#oscal-family-si}

| Control | Status | Validation | Rationale |
|---|---|---|---|
| `SI-2` | Not satisfied | dependency-vulnerability-status |  |
| `SI-2.2` | Requires customer context | — | Automated flaw remediation status needs dependency data plus release workflow evidence. |
| `SI-2.4` | Requires customer context | — | Automated patch management requires deployment and package-management evidence. |
| `SI-3` | Requires customer context | — | Malicious code protection requires endpoint and runtime scanning evidence. |
| `SI-4` | Requires customer context | — | System monitoring derives from a deployed metrics-collection resource (e.g. a Prometheus PodMonitor/ServiceMonitor scraping workloads) or otherwise requires telemetry deployment and alerting policy evidence. |
| `SI-7` | Requires customer context | — | Software integrity needs signing, checksum, or supply-chain verification evidence. |
| `SI-7.1` | Requires customer context | — | Subresource integrity attests on HTML; complements code-level checks. |
| `SI-7.6` | Requires customer context | — | Cryptographic protection of software integrity needs signing-key lifecycle evidence. |
| `SI-10` | Not satisfied | input-validation |  |
| `SI-10.5` | Not satisfied | input-validation | Input validation on restricted inputs requires domain-specific parser coverage. |
| `SI-10.6` | Satisfied | injection-prevention |  |
| `SI-11` | Not satisfied | error-message-safety |  |
| `SI-12` | Requires customer context | — | Information management and retention is policy-backed customer context. |
| `SI-16` | Requires customer context | — | Memory protection requires runtime/compiler hardening evidence outside source-only checks. |

### RA — Risk Assessment {#oscal-family-ra}

| Control | Status | Validation | Rationale |
|---|---|---|---|
| `RA-5` | Not satisfied | dependency-vulnerability-status |  |
| `RA-5.2` | Requires customer context | — | Update-by-prior-vulnerability evidence needs dependency status plus release cadence. |
| `RA-5.4` | Requires customer context | — | Discoverable information analysis requires public surface and deployment evidence. |
| `RA-5.5` | Requires customer context | — | Privileged vulnerability scanning requires scanner credential and environment evidence. |

### SA — System and Services Acquisition {#oscal-family-sa}

| Control | Status | Validation | Rationale |
|---|---|---|---|
| `SA-4.9` | Requires customer context | — | Developer security testing requirements need acquisition-contract evidence plus Sonde results. |
| `SA-8` | Requires customer context | — | Security and privacy engineering principles need architecture and review evidence. |
| `SA-10` | Requires customer context | — | Developer configuration management requires VCS and release-control evidence. |
| `SA-11` | Requires customer context | — | Developer security testing is represented by a committed CI static-analysis workflow (e.g. CodeQL), Sonde findings, and certification evidence. |
| `SA-11.1` | Requires customer context | — | Static code analysis is represented by a committed CodeQL/SAST CI workflow, Sonde execution evidence, and probe certification. |
| `SA-15` | Requires customer context | — | Development process standards require SDLC policy and repository workflow evidence. |

### PT — PII Processing and Transparency {#oscal-family-pt}

| Control | Status | Validation | Rationale |
|---|---|---|---|
| `PT-2` | Requires customer context | — | Authority to process PII is policy and authorization evidence, not source-only evidence. |
| `PT-3` | Requires customer context | — | PII processing purpose is policy-driven; source validation covers credential storage only. |
| `PT-6` | Requires customer context | — | System of records notice coverage requires privacy program and publication evidence. |
| `PT-7` | Requires customer context | — | Specific categories of PII processing require data inventory and privacy evidence. |
