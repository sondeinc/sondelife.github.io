# Gitea — NIST 800-53 Coverage

<sub>source: data/nist-rollup-summary.txt:L1-L1</sub>

## Resumen

11/103 controles cumplidos — Cobertura 10.7%.

## Familias de controles

### AC — Access Control {#oscal-family-ac}

| Control | Estado | Atestiguación | Justificación |
|---|---|---|---|
| `AC-3` | No cumplido | access-enforcement |  |
| `AC-3.7` | No cumplido | access-enforcement |  |
| `AC-3.8` | No cumplido | access-enforcement | Runtime revocation and route-level deny evidence require customer tenancy context. |
| `AC-3.13` | No cumplido | access-enforcement |  |
| `AC-4` | Requiere contexto del cliente | — | Information-flow enforcement needs parseable allowlist or boundary enforcement evidence. |
| `AC-6` | Cumplido | least-privilege |  |
| `AC-6.1` | Cumplido | least-privilege | Authorized access-to-security-functions review needs role inventory and operator policy. |
| `AC-6.2` | Cumplido | least-privilege | Non-privileged account use needs identity-provider and break-glass procedure evidence. |
| `AC-6.5` | Cumplido | least-privilege | Privileged group membership is customer environment state, not source-only evidence. |
| `AC-6.8` | Requiere contexto del cliente | — | Privileged command auditing requires source audit instrumentation plus runtime command-policy evidence; source-only audit events do not prove privileged command analysis. |
| `AC-6.9` | Cumplido | least-privilege | Requires audit witness on privileged-function call sites plus least-privilege evidence. |
| `AC-6.10` | Cumplido | least-privilege |  |
| `AC-7` | No cumplido | access-enforcement |  |
| `AC-11` | Cumplido | session-management | Session-timeout values live in deployment config; source-pattern coverage is partial. |
| `AC-12` | Cumplido | session-management |  |
| `AC-17` | Brecha | transmission-encryption |  |
| `AC-17.2` | Brecha | transmission-encryption |  |
| `AC-17.8` | Brecha | transmission-encryption |  |
| `AC-18` | Requiere contexto del cliente | — | Wireless access restrictions require deployment and device-management evidence. |

### AU — Audit and Accountability {#oscal-family-au}

| Control | Estado | Atestiguación | Justificación |
|---|---|---|---|
| `AU-2` | No cumplido | audit-event-coverage |  |
| `AU-3` | No cumplido | audit-record-completeness |  |
| `AU-3.1` | No cumplido | audit-record-completeness |  |
| `AU-4` | Requiere contexto del cliente | — | Audit storage capacity counts only explicit audit-log capacity/rotation source evidence. |
| `AU-5` | Requiere contexto del cliente | — | Audit processing failure response needs operational alerting and incident procedure evidence. |
| `AU-6` | Requiere contexto del cliente | — | Audit review, correlation, reporting, SIEM rules, and alert handling are operational evidence beyond source-visible audit event generation. |
| `AU-8` | No cumplido | audit-record-completeness |  |
| `AU-9` | Requiere contexto del cliente | — | Audit record protection requires storage ACL and retention evidence beyond source code. |
| `AU-10` | Requiere contexto del cliente | — | Non-repudiation counts only explicit signed event or identity-provider source evidence. |
| `AU-12` | No cumplido | audit-event-coverage |  |
| `AU-12.1` | Requiere contexto del cliente | — | System-wide audit generation requires deployment topology and platform coverage evidence; source coverage attests application instrumentation only. |
| `AU-12.3` | Requiere contexto del cliente | — | Changes by authorized individuals need release-control and approval evidence plus audit instrumentation. |

### CM — Configuration Management {#oscal-family-cm}

| Control | Estado | Atestiguación | Justificación |
|---|---|---|---|
| `CM-2` | Requiere contexto del cliente | — | Baseline configuration derives from declarative GitOps reconciliation (e.g. a Flux Kustomization pruning a committed source baseline) or otherwise needs committed manifests plus operator-approved baseline policy. |
| `CM-3` | Requiere contexto del cliente | — | Configuration change control needs VCS and approval workflow evidence. |
| `CM-4` | Requiere contexto del cliente | — | Impact analysis derives from blast-radius probe rather than a single validation. |
| `CM-5` | Cumplido | least-privilege | Access restrictions for change need repository permissions and deployment policy evidence. |
| `CM-6` | No cumplido | configuration-defaults-safety |  |
| `CM-6.1` | Requiere contexto del cliente | — | Automated configuration enforcement counts only a Kubernetes Namespace whose metadata.labels set pod-security.kubernetes.io/enforce to an enforcing Pod Security Admission level (restricted or baseline); audit/warn-only labels, the privileged no-op level, and Helm values without a Namespace kind remain customer deployment evidence. |
| `CM-7` | No cumplido | least-functionality |  |
| `CM-7.1` | Requiere contexto del cliente | — | Periodic review of allowed functions requires operator review cadence evidence. |
| `CM-7.2` | Requiere contexto del cliente | — | Preventing program execution requires runtime policy and allowlist evidence. |
| `CM-7.4` | Requiere contexto del cliente | — | Unauthorized software denylisting derives from admission-control deny-by-exception policy or endpoint/runtime denylist evidence. |
| `CM-7.5` | Requiere contexto del cliente | — | Authorized software allowlisting derives from admission-control allow-by-exception policy or endpoint/runtime allowlist evidence. |
| `CM-8` | Requiere contexto del cliente | — | Component inventory derives from parseable dependency graph or lockfile inventory evidence. |
| `CM-10` | Requiere contexto del cliente | — | Software usage restrictions require license and operator policy evidence. |
| `CM-11` | Requiere contexto del cliente | — | User-installed software restrictions require endpoint management evidence. |

### IA — Identification and Authentication {#oscal-family-ia}

| Control | Estado | Atestiguación | Justificación |
|---|---|---|---|
| `IA-2` | No cumplido | auth-required |  |
| `IA-2.1` | Parcialmente cumplido | mfa-required | Multifactor authentication for privileged accounts requires IdP configuration evidence. |
| `IA-2.2` | Parcialmente cumplido | mfa-required | Multifactor authentication for non-privileged accounts requires IdP configuration evidence. |
| `IA-2.6` | No cumplido | auth-required | Network access to privileged accounts requires runtime access-policy evidence. |
| `IA-2.8` | No cumplido | auth-required | Replay-resistant authentication needs protocol and IdP configuration evidence. |
| `IA-5` | No cumplido | credential-storage-safety |  |
| `IA-5.1` | No cumplido | password-strength |  |
| `IA-5.2` | Requiere contexto del cliente | — | Public-key authentication requires certificate lifecycle and key-store evidence. |
| `IA-5.4` | No cumplido | password-strength | Automated password management support combines password policy with IdP evidence. |
| `IA-5.6` | No cumplido | credential-storage-safety |  |
| `IA-5.7` | No cumplido | credential-storage-safety |  |
| `IA-5.13` | Requiere contexto del cliente | — | Password managers require customer endpoint and secret-management policy evidence. |
| `IA-6` | No cumplido | auth-required |  |
| `IA-7` | Requiere contexto del cliente | — | Cryptographic module authentication requires module inventory and FIPS evidence. |
| `IA-8` | No cumplido | auth-required | Non-organizational user identification needs tenant and federation-policy evidence. |

### SC — System and Communications Protection {#oscal-family-sc}

| Control | Estado | Atestiguación | Justificación |
|---|---|---|---|
| `SC-2` | Requiere contexto del cliente | — | Application partitioning needs process/runtime deployment evidence. |
| `SC-3` | Requiere contexto del cliente | — | Security function isolation needs architecture and deployment-boundary evidence. |
| `SC-4` | Requiere contexto del cliente | — | Information in shared system resources requires runtime isolation evidence. |
| `SC-5` | Requiere contexto del cliente | — | Denial-of-service protection requires perimeter and capacity evidence. |
| `SC-7` | Requiere contexto del cliente | — | Boundary protection requires network architecture and ingress policy evidence. |
| `SC-8` | Brecha | transmission-encryption |  |
| `SC-8.1` | Brecha | transmission-encryption |  |
| `SC-12` | Requiere contexto del cliente | — | Cryptographic key establishment needs key-management lifecycle evidence. |
| `SC-13` | Brecha | cryptographic-strength |  |
| `SC-13.1` | Requiere contexto del cliente | — | FIPS-validated cryptography needs module inventory and validation evidence. |
| `SC-17` | Requiere contexto del cliente | — | Public key infrastructure certificates count only declarative cert-manager source of truth: a Certificate resource with an issuerRef, a managed secretName, and a subject identity (commonName/dnsNames/uris/ipAddresses), or an Issuer/ClusterIssuer with a configured backend (selfSigned/ca/acme/vault/venafi). Trust-anchor approval, CA accreditation, and approved-service-provider facts remain customer/policy evidence. |
| `SC-23` | Cumplido | session-management |  |
| `SC-28` | No cumplido | data-at-rest-encryption |  |
| `SC-28.1` | No cumplido | data-at-rest-encryption |  |
| `SC-39` | Requiere contexto del cliente | — | Process isolation counts only fully hardened workload securityContext source evidence (runAsNonRoot, allowPrivilegeEscalation:false, readOnlyRootFilesystem, dropped ALL capabilities, and a seccomp profile); broader runtime-sandbox posture remains customer deployment evidence. |

### SI — System and Information Integrity {#oscal-family-si}

| Control | Estado | Atestiguación | Justificación |
|---|---|---|---|
| `SI-2` | No cumplido | dependency-vulnerability-status |  |
| `SI-2.2` | Requiere contexto del cliente | — | Automated flaw remediation status needs dependency data plus release workflow evidence. |
| `SI-2.4` | Requiere contexto del cliente | — | Automated patch management requires deployment and package-management evidence. |
| `SI-3` | Requiere contexto del cliente | — | Malicious code protection requires endpoint and runtime scanning evidence. |
| `SI-4` | Requiere contexto del cliente | — | System monitoring derives from a deployed metrics-collection resource (e.g. a Prometheus PodMonitor/ServiceMonitor scraping workloads) or otherwise requires telemetry deployment and alerting policy evidence. |
| `SI-7` | Requiere contexto del cliente | — | Software integrity needs signing, checksum, or supply-chain verification evidence. |
| `SI-7.1` | Requiere contexto del cliente | — | Subresource integrity attests on HTML; complements code-level checks. |
| `SI-7.6` | Requiere contexto del cliente | — | Cryptographic protection of software integrity needs signing-key lifecycle evidence. |
| `SI-10` | No cumplido | input-validation |  |
| `SI-10.5` | No cumplido | input-validation | Input validation on restricted inputs requires domain-specific parser coverage. |
| `SI-10.6` | Cumplido | injection-prevention |  |
| `SI-11` | No cumplido | error-message-safety |  |
| `SI-12` | Requiere contexto del cliente | — | Information management and retention is policy-backed customer context. |
| `SI-16` | Requiere contexto del cliente | — | Memory protection requires runtime/compiler hardening evidence outside source-only checks. |

### RA — Risk Assessment {#oscal-family-ra}

| Control | Estado | Atestiguación | Justificación |
|---|---|---|---|
| `RA-5` | No cumplido | dependency-vulnerability-status |  |
| `RA-5.2` | Requiere contexto del cliente | — | Update-by-prior-vulnerability evidence needs dependency status plus release cadence. |
| `RA-5.4` | Requiere contexto del cliente | — | Discoverable information analysis requires public surface and deployment evidence. |
| `RA-5.5` | Requiere contexto del cliente | — | Privileged vulnerability scanning requires scanner credential and environment evidence. |

### SA — System and Services Acquisition {#oscal-family-sa}

| Control | Estado | Atestiguación | Justificación |
|---|---|---|---|
| `SA-4.9` | Requiere contexto del cliente | — | Developer security testing requirements need acquisition-contract evidence plus Sonde results. |
| `SA-8` | Requiere contexto del cliente | — | Security and privacy engineering principles need architecture and review evidence. |
| `SA-10` | Requiere contexto del cliente | — | Developer configuration management requires VCS and release-control evidence. |
| `SA-11` | Requiere contexto del cliente | — | Developer security testing is represented by a committed CI static-analysis workflow (e.g. CodeQL), Sonde findings, and certification evidence. |
| `SA-11.1` | Requiere contexto del cliente | — | Static code analysis is represented by a committed CodeQL/SAST CI workflow, Sonde execution evidence, and probe certification. |
| `SA-15` | Requiere contexto del cliente | — | Development process standards require SDLC policy and repository workflow evidence. |

### PT — PII Processing and Transparency {#oscal-family-pt}

| Control | Estado | Atestiguación | Justificación |
|---|---|---|---|
| `PT-2` | Requiere contexto del cliente | — | Authority to process PII is policy and authorization evidence, not source-only evidence. |
| `PT-3` | Requiere contexto del cliente | — | PII processing purpose is policy-driven; source validation covers credential storage only. |
| `PT-6` | Requiere contexto del cliente | — | System of records notice coverage requires privacy program and publication evidence. |
| `PT-7` | Requiere contexto del cliente | — | Specific categories of PII processing require data inventory and privacy evidence. |
