# Selecting an Embedded Linux Platform for Industrial IoT Devices

## A FLECS Technologies Technical Whitepaper

**Version 1.1 | March 2026**
**Authors:** FLECS Technologies GmbH, Duisburg, Germany
**Classification:** Public

---

## Abstract

Industrial IoT device manufacturers face a critical architectural decision: which embedded Linux platform to adopt for long-term device management, over-the-air (OTA) software updates, and regulatory compliance. This whitepaper provides a systematic evaluation of leading embedded Linux platforms---Yocto/OpenEmbedded, Ubuntu Core, Debian derivatives, and container-optimized distributions---against the requirements of industrial automation OEMs. We present a two-layer reference architecture separating the immutable operating system from the containerized application layer, demonstrating how this design satisfies the EU Cyber Resilience Act (CRA), IEC 62443, and the operational demands of fleet-scale device management. We include a detailed mapping of all 21 CRA Annex I requirements against the FLECS platform's current coverage (12 of 21 implemented), CRA product classification guidance for industrial devices, and FLECS's three-tier compliance infrastructure spanning on-device SBOM generation, centralized fleet management, and compliance reporting. Our analysis concludes with FLECS Technologies' recommendation for industrial partners.

**Keywords:** Embedded Linux, Industrial IoT, OTA Updates, Yocto, RAUC, Container Runtime, IEC 62443, Cyber Resilience Act, Edge Computing, Device Fleet Management

---

## 1. Introduction

### 1.1 Problem Statement

Component manufacturers in industrial automation---drive vendors, PLC makers, sensor manufacturers, and edge gateway OEMs---increasingly ship devices that run software throughout their operational lifetime. Unlike consumer electronics with 2--3 year replacement cycles, industrial devices operate for 10--20 years in the field. This creates three compounding challenges:

1. **Long-term security maintenance.** Linux kernel CVE disclosures reached 5,530 in 2025, a 28% year-over-year increase, averaging 8--9 new vulnerabilities per day [1]. The gap between patch availability and deployment remains the primary attack vector in industrial environments.

2. **Regulatory compliance.** The EU Cyber Resilience Act mandates vulnerability reporting by September 2026 and full lifecycle security management by December 2027, including mandatory SBOMs and a minimum five-year free security update commitment [2]. IEC 62443-4-2 imposes technical security requirements on individual IACS components [3].

3. **Application lifecycle management.** OEMs and their customers need to install, update, configure, and remove software applications on deployed devices without reflashing the entire operating system.

### 1.2 Scope

This paper evaluates embedded Linux platforms along five dimensions critical to industrial IoT: (i) image size and boot time, (ii) OTA update mechanisms, (iii) long-term security maintenance, (iv) container runtime support, and (v) regulatory compliance readiness. We restrict our analysis to platforms supporting ARMv7, ARMv8/AArch64, and x86-64 architectures commonly found in industrial hardware.

---

## 2. Evaluation Framework

We define the following weighted evaluation criteria based on requirements gathered from FLECS industrial partners across manufacturing, building automation, and energy sectors:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Image footprint | 15% | Base OS image size; RAM and storage requirements |
| OTA update robustness | 25% | Atomic updates, A/B partitioning, rollback guarantees |
| Security maintenance | 25% | CVE response time, LTS duration, SBOM generation |
| Container runtime | 20% | Docker/OCI compatibility, resource overhead, orchestration |
| Regulatory readiness | 15% | IEC 62443, EU CRA, secure boot chain support |

---

## 3. Platform Analysis

### 3.1 Yocto Project / OpenEmbedded

The Yocto Project is an open-source collaboration providing templates, tools, and methods to create custom Linux distributions for embedded hardware, regardless of architecture [4]. Yocto produces deterministic, reproducible images with minimal attack surface.

**Strengths:**

- *Minimal footprint.* Yocto images can be reduced to under 100 MB for headless devices, excluding all unnecessary libraries and services [5]. This directly reduces the CVE exposure surface.
- *Hardware flexibility.* Board Support Packages (BSPs) exist for virtually all industrial SoC families (NXP i.MX, TI Sitara, Intel Atom, Xilinx Zynq). Siemens' Sokol Flex OS and Industrial Edge runtime both build on Yocto [6].
- *OTA with RAUC.* The Robust Auto-Update Controller (RAUC) provides cryptographically signed A/B partition updates with automatic rollback on boot failure [7]. Updates are verified using X.509 certificates, and differential updates via casync minimize bandwidth consumption.
- *SBOM generation.* Yocto's build system inherently tracks all package sources, versions, and licenses, enabling automated SBOM generation compliant with CRA requirements.

**Weaknesses:**

- *Steep learning curve.* Building and maintaining a Yocto BSP requires specialized embedded Linux engineering resources. The initial development investment is 3--6 months for a production-ready image.
- *Security patches are self-managed.* Unlike vendor-supported distributions, the OEM is responsible for monitoring CVEs, backporting patches, and rebuilding images. This represents an ongoing operational cost.
- *No built-in fleet management.* Yocto produces images; fleet-scale deployment, monitoring, and remote access require additional tooling (e.g., hawkBit, Mender, or a platform like FLECS).

### 3.2 Ubuntu Core (Snap-based)

Ubuntu Core is Canonical's IoT-optimized distribution using Snap packages for both system components and applications [8]. Each snap is confined, transactionally updated, and independently versioned.

**Strengths:**

- *Transactional updates with automatic rollback.* Snap package updates are atomic; failed updates revert to the previous working version without manual intervention.
- *10-year LTS support.* Canonical provides up to 10 years of security maintenance (extendable to 15 years with Ubuntu Pro for Devices), including kernel livepatch for zero-downtime CVE remediation [9].
- *Integrated Kubernetes.* MicroK8s provides a lightweight Kubernetes distribution for edge orchestration, simplifying multi-container workloads [10].
- *IEC 62443 alignment.* Canonical has published compliance guides mapping Ubuntu Core security features to IEC 62443 requirements [3].

**Weaknesses:**

- *Snap confinement overhead.* The squashfs-based snap runtime introduces additional memory consumption (typically 50--100 MB) and slightly slower cold-start times compared to native binaries [5].
- *Vendor lock-in.* The Snap Store is operated exclusively by Canonical. While snaps can be sideloaded, the ecosystem incentivizes dependency on Canonical's infrastructure.
- *Less common in OT environments.* Ubuntu Core adoption in factory-floor environments lags behind Yocto-based solutions. Most industrial automation vendors (Siemens, Bosch, Phoenix Contact) standardize on Yocto.

### 3.3 Debian / Raspberry Pi OS Derivatives

Standard Debian-based distributions (including Raspberry Pi OS) are frequently used in prototyping and low-volume industrial deployments due to developer familiarity.

**Strengths:**

- *Lowest barrier to entry.* Developers can use standard `apt` package management, familiar tooling, and extensive community documentation.
- *Large package repository.* Over 60,000 pre-built packages available, reducing development time for non-critical applications.

**Weaknesses:**

- *No atomic OTA updates.* Standard `apt upgrade` is not atomic; interrupted updates can leave devices in an inconsistent state. A/B partitioning must be retrofitted manually.
- *Bloated image size.* A minimal Debian image with Docker support typically exceeds 500 MB, exposing a larger CVE surface and consuming scarce flash storage on industrial hardware.
- *Security maintenance gaps.* While Debian provides LTS releases, the patch cadence for embedded-specific packages (kernel, bootloader, firmware) often lags behind Yocto and Ubuntu Core.
- *Not recommended for production.* Debian derivatives lack the deterministic build properties, reproducibility, and update robustness required for regulatory compliance under CRA and IEC 62443.

### 3.4 Container-Optimized Distributions (Alpine, Balena OS, Pantacor)

Purpose-built distributions that minimize the host OS to serve primarily as a container runtime.

**Strengths:**

- *Minimal host OS.* Alpine Linux base images start at approximately 5 MB. Balena OS provides a complete Docker-capable host in under 200 MB [11].
- *Container-native fleet management.* Balena OS includes integrated fleet management, OTA delta updates, and multi-container orchestration for 80+ device types [11].
- *Fast iteration cycles.* Developers push Docker images; the host OS is largely invisible.

**Weaknesses:**

- *Limited industrial adoption.* These distributions lack the industrial certifications and BSP breadth of Yocto.
- *Vendor dependency.* Balena OS requires the balenaCloud platform for fleet management. Pantacor, while open-source, has a smaller ecosystem.
- *musl libc compatibility.* Alpine's use of musl (rather than glibc) can cause compatibility issues with commercial industrial software compiled against glibc.

---

## 4. FLECS Reference Architecture

Based on our evaluation and production deployments across multiple industrial partners, FLECS Technologies recommends a **two-layer architecture** that cleanly separates concerns:

```
+------------------------------------------------------------------+
|                    APPLICATION LAYER                              |
|  +------------+  +------------+  +------------+  +------------+  |
|  | App A      |  | App B      |  | App C      |  | App N      |  |
|  | (Docker)   |  | (Docker)   |  | (Docker)   |  | (Docker)   |  |
|  +------------+  +------------+  +------------+  +------------+  |
|                                                                  |
|  +------------------------------------------------------------+  |
|  |              FLECS Core Runtime                             |  |
|  |  App Lifecycle | OTA App Updates | Marketplace | Config Mgmt|  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
|                    OPERATING SYSTEM LAYER                         |
|  +------------------------------------------------------------+  |
|  |              Container Runtime (Docker Engine)              |  |
|  +------------------------------------------------------------+  |
|  +------------------------------------------------------------+  |
|  |    Base OS (Yocto / Ubuntu Core / Vendor BSP)               |  |
|  |    Kernel | Drivers | Networking | Secure Boot              |  |
|  +------------------------------------------------------------+  |
|  +------------------------------------------------------------+  |
|  |    OTA System Update (RAUC / snapd / Mender)                |  |
|  |    A/B Rootfs | Signed Images | Rollback                   |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
|                    HARDWARE                                       |
|  ARM Cortex-A | x86-64 | RISC-V                                 |
+------------------------------------------------------------------+
```

**Figure 1.** FLECS two-layer reference architecture for industrial IoT devices.

### 4.1 OS Layer: Immutable, Vendor-Managed

The OS layer is built once per hardware platform and updated infrequently (quarterly or on critical CVEs). Its sole responsibilities are:

- Boot the device securely (secure boot chain, verified boot)
- Provide a container runtime (Docker Engine or containerd)
- Provide network connectivity and device drivers
- Execute A/B system updates via RAUC (Yocto) or snapd (Ubuntu Core)

**This layer is managed by the hardware OEM or their embedded Linux partner.** The OEM controls the BSP, kernel configuration, and system update cadence.

### 4.2 Application Layer: Dynamic, FLECS-Managed

The application layer runs entirely in Docker containers orchestrated by FLECS Core. Its responsibilities are:

- Install, update, configure, and remove industrial applications
- Provide the FLECS Marketplace for app discovery and deployment
- Manage application configuration (network, ports, environment, USB passthrough)
- Report application health, resource usage, and operational metrics

**This layer is managed by the device operator (end customer) or the app vendor via the FLECS platform.** Application updates are independent of OS updates---an app vendor can ship a security patch within hours without waiting for an OS image rebuild.

### 4.3 Industrial Control Platform Integration

FLECS positions within the ISA-95 automation hierarchy as the **application management layer** between the enterprise network (Level 4) and the control systems (Levels 0--2):

```
ISA-95 Level 4  │  Enterprise Network (ERP, MES)
────────────────┼───────────────────────────────────────
ISA-95 Level 3  │  FLECS Core + Containerized Apps
                │  ├── OPC UA servers/clients
                │  ├── Protocol converters (Modbus → MQTT)
                │  ├── Edge analytics & ML inference
                │  └── Containerized PLC runtimes (CODESYS, logi.cals)
────────────────┼───────────────────────────────────────
ISA-95 Level 2  │  HMI, SCADA
ISA-95 Level 1  │  PLCs, DCS controllers
ISA-95 Level 0  │  Sensors, actuators, field devices
```

**Figure 2.** FLECS deployment within the ISA-95 automation hierarchy.

Key capabilities for industrial control:

- **Containerized PLC runtimes.** Soft-PLC environments (e.g., CODESYS, logi.cals logi.RTS) run as Docker containers managed by FLECS, enabling deployment of PLC logic to edge devices in **1--2 weeks** rather than months of firmware development.
- **OPC UA and industrial protocol support.** Containerized OPC UA servers and protocol converters bridge the gap between legacy fieldbus systems and modern IT infrastructure.
- **100% open source.** FLECS Core is fully open source, providing complete transparency for security audits, regulatory compliance, and supply chain trust.
- **Hardware-agnostic deployment.** The same containerized application runs on any Linux device with Docker support---from ARM-based industrial gateways to x86 edge servers---eliminating vendor lock-in at the application layer.

### 4.4 Why Two Layers

This separation delivers three critical benefits:

1. **Independent update cadences.** The OS updates quarterly; applications update on-demand. Neither blocks the other.
2. **Clear responsibility boundaries.** The OEM maintains the OS; app vendors maintain their apps; the device operator decides when to update. This maps cleanly to IEC 62443 zone and conduit models.
3. **Regulatory compliance by design.** SBOMs are generated independently for the OS layer (by the Yocto build system) and the application layer (by FLECS in SPDX 2.3 format). CRA vulnerability reporting can be partitioned by responsible entity, with FLECS providing continuous CVE monitoring at the application layer.

---

## 5. Platform Recommendations by Partner Profile

### 5.1 Large Industrial OEMs (e.g., Drive Manufacturers, PLC Vendors)

**Recommendation: Yocto + RAUC + FLECS Core**

Large OEMs with existing embedded Linux teams should build custom Yocto images tailored to their hardware. RAUC provides the A/B update mechanism for the OS layer. FLECS Core runs as a system service managing the Docker-based application layer.

This combination is used by Siemens (Industrial Edge), Bosch, and other Tier-1 industrial vendors [6]. It provides maximum control over the OS image, deterministic builds, minimal footprint, and full regulatory traceability.

**Estimated integration effort:** 3--6 months for initial BSP; ongoing maintenance at 0.5--1 FTE.

### 5.2 Mid-Size OEMs and System Integrators

**Recommendation: Ubuntu Core + FLECS Core**

OEMs without dedicated embedded Linux teams benefit from Canonical's managed security updates and 10-year LTS commitment. Ubuntu Core provides atomic updates, secure boot, and app confinement out of the box. FLECS Core runs as a snap or Docker container on top.

This approach trades some image size and boot time for significantly reduced maintenance burden. The 10-year LTS commitment aligns well with industrial device lifecycles and CRA obligations.

**Estimated integration effort:** 1--3 months; ongoing maintenance minimal (handled by Canonical).

### 5.3 Startups and Rapid Prototyping

**Recommendation: Balena OS + FLECS Core (prototype) -> Yocto (production)**

For initial proof-of-concept and small-volume deployments (< 1,000 devices), Balena OS or a standard Debian derivative with Docker provides the fastest path to a working prototype. Once the product is validated, the production image should migrate to Yocto for regulatory compliance and long-term maintenance.

FLECS Core runs identically on both environments, enabling a seamless transition from prototype to production without application changes.

**Estimated integration effort:** Days to weeks (prototype); 3--6 months (production migration).

---

## 6. Regulatory Compliance Mapping

### 6.1 EU Cyber Resilience Act (CRA) — Timeline and Industry Readiness

The CRA entered into force on 10 December 2024 and establishes binding obligations on a phased timeline:

| Milestone | Date | Obligation |
|---|---|---|
| CRA enters into force | 10 Dec 2024 | Regulation published |
| Conformity assessment bodies notified | 11 Jun 2026 | Assessment infrastructure in place |
| **Vulnerability reporting mandatory** | **11 Sep 2026** | Active exploitation must be reported to ENISA within 24h |
| **Full compliance mandatory** | **11 Dec 2027** | All requirements apply; non-compliant products may not be placed on the EU market |

Research by the Linux Foundation (2024) reveals significant preparedness gaps across the industry [12]:

- **62% of respondents** are not familiar with the CRA or its requirements
- Only **34% of organizations** currently produce Software Bills of Materials (SBOMs)
- Approximately **90% of products** fall into the Default category eligible for manufacturer self-assessment

These findings underscore the urgency of the two-layer architecture described in Section 4: manufacturers who adopt a platform with built-in SBOM generation and vulnerability tracking gain a structural advantage over those who must retrofit compliance onto legacy firmware architectures.

### 6.2 CRA Product Classification for Industrial Automation

The CRA classifies products with digital elements into four risk tiers. Industrial device manufacturers must determine their classification early, as it dictates the conformity assessment procedure:

| Category | Estimated Market Share | Assessment Method | Industrial Examples |
|---|---|---|---|
| **Default** | ~90% | Manufacturer self-assessment | Sensors, simple gateways, HMI displays |
| **Important Class I** | ~8% | Harmonized standard or third-party assessment | Industrial routers, firewalls, PLCs with network connectivity |
| **Important Class II** | ~1.5% | Third-party assessment mandatory | Hypervisors, container runtimes, OS distributions, firewalls for industrial use |
| **Critical** | <0.5% | European cybersecurity certification | Hardware security modules, smart meter gateways |

For the vast majority of industrial automation components (~90%), manufacturers can perform self-assessment---provided they have the technical infrastructure to generate SBOMs, track vulnerabilities, and deliver timely security updates. The FLECS platform provides this infrastructure out of the box.

### 6.3 CRA Annex I Requirements — FLECS Coverage

The CRA's Annex I defines 21 essential cybersecurity requirements. The following table maps each requirement to its implementation status within the FLECS platform:

| # | Annex I Requirement | FLECS Status | Implementation |
|---|---|---|---|
| 1 | Secure by default configuration | **Covered** | Hardened container defaults, minimal attack surface |
| 2 | Protection against unauthorized access | **Covered** | OAuth 2.0/OIDC authentication, RBAC, container isolation |
| 3 | Protection of data confidentiality | **Covered** | TLS 1.3 for all API communication, encrypted storage |
| 4 | Protection of data integrity | **Covered** | Signed container images, verified downloads |
| 5 | Data minimization | **Covered** | Containers run with least-privilege, no unnecessary data collection |
| 6 | Availability and resilience | **Covered** | Container health monitoring, automatic restart, cgroup resource limits |
| 7 | Minimized negative impact on other devices | **Covered** | Network isolation, container sandboxing, firewall rules |
| 8 | Secure communication | **Covered** | TLS for all endpoints, certificate validation |
| 9 | Minimized attack surface | **Covered** | Minimal base images, no unnecessary services |
| 10 | Incident impact mitigation | **Covered** | Container rollback, A/B app updates, watchdog |
| 11 | Security-relevant information recording and monitoring | **Covered** | Audit logging, FLECS monitoring, event tracking |
| 12 | Vulnerability handling and remediation | **Covered** | CVE monitoring, automated scanning, OTA app updates |
| 13 | Secure software updates | **Coming soon** | Signed OTA updates with rollback (in progress) |
| 14 | Vulnerability disclosure and reporting | **Coming soon** | ENISA-compliant reporting workflow (in progress) |
| 15 | Software Bill of Materials (SBOM) | **Covered (Beta)** | SPDX 2.3 generation, CycloneDX compatible |
| 16 | Clear and understandable instructions | **Coming soon** | Documentation portal for security configuration |
| 17 | Defined support period | **Coming soon** | Lifecycle management with defined EOL dates |
| 18 | Secure data deletion | **Coming soon** | Container volume cleanup, factory reset |
| 19 | Transfer of ownership security | **Coming soon** | Device deregistration and re-provisioning |
| 20 | Security update availability for 5+ years | **Coming soon** | Long-term support roadmap aligned with device lifecycle |
| 21 | Notification of security issues | **Coming soon** | Automated CVE notification to device operators |

**Current coverage: 12 of 21 requirements fully implemented.** The remaining 9 are on the FLECS product roadmap for delivery before the September 2026 vulnerability reporting deadline.

### 6.4 FLECS Three-Tier Compliance Infrastructure

FLECS implements compliance across three interconnected tiers:

**Tier 1 — On Device (FLECS Core Runtime)**
- Container-level SBOM generation (SPDX 2.3 format)
- Runtime vulnerability scanning against known CVE databases
- Secure app lifecycle management (install, update, rollback, remove)
- Audit logging of all app operations

**Tier 2 — Central Service Portal (FLECS Cloud)**
- Fleet-wide vulnerability dashboard
- Aggregated SBOM management across all deployed devices
- Centralized OTA update orchestration
- Device health monitoring and alerting

**Tier 3 — Compliance Management**
- CRA-aligned vulnerability reporting workflows
- IEC 62443 evidence collection and documentation
- SBOM export in SPDX 2.3 and CycloneDX formats for supply chain transparency
- Audit trail generation for conformity assessment
- Referenced standards: BSI TR-03183 (German technical guideline for SBOM), ENISA CRA guidance mapping

### 6.5 CRA Compliance by Architecture Layer

| CRA Requirement | OS Layer (Yocto/Ubuntu Core) | App Layer (FLECS) |
|---|---|---|
| Vulnerability reporting (Sep 2026) | OEM reports OS-level CVEs | App vendor reports app-level CVEs via FLECS |
| Security updates for 5+ years | RAUC A/B updates or Canonical LTS | FLECS OTA app updates with rollback |
| SBOM (Dec 2027) | Yocto build manifest or snap manifest | FLECS SPDX 2.3 per container image |
| Secure by design | Minimal image, secure boot, signed updates | Container isolation, signed images, least-privilege |
| Incident response | OEM responsibility | App vendor + FLECS Central Service Portal |
| CVE monitoring | OEM CVE tracking | FLECS continuous vulnerability scanning |

### 6.6 IEC 62443-4-2 (Component Security)

| IEC 62443-4-2 Requirement | Implementation |
|---|---|
| FR 1: Identification and Authentication | OS-level user management + FLECS OAuth/OIDC |
| FR 2: Use Control | Linux capabilities, container isolation, RBAC |
| FR 3: System Integrity | Secure boot, dm-verity, signed container images |
| FR 4: Data Confidentiality | TLS 1.3 for all API communication |
| FR 5: Restricted Data Flow | Container network isolation, firewall rules |
| FR 6: Timely Response to Events | FLECS monitoring, audit logging |
| FR 7: Resource Availability | Container resource limits (cgroups), watchdog |

---

## 7. Comparative Summary

| Criterion | Yocto + RAUC | Ubuntu Core | Debian Derivative | Balena OS |
|-----------|-------------|-------------|-------------------|-----------|
| Base image size | 50--200 MB | 300--500 MB | 500+ MB | 150--250 MB |
| OTA robustness | A/B, signed, rollback | Atomic snaps, rollback | Manual, no rollback | Delta, rollback |
| LTS duration | Self-managed | 10--15 years (Canonical) | 5 years (community) | Vendor-dependent |
| CVE response | Self-managed | Canonical livepatch | Community-paced | Vendor-paced |
| Container support | Docker/containerd | Docker via snap | Docker native | Docker native |
| IEC 62443 readiness | High (with effort) | High (guided) | Low | Medium |
| CRA compliance | High (SBOM native) | High (SBOM via snap) | Low | Medium |
| Industrial adoption | Very high | Growing | Prototype only | Niche |
| Integration effort | 3--6 months | 1--3 months | Days | Days--weeks |
| Ongoing maintenance | 0.5--1 FTE | Minimal | High (unmanaged) | Vendor-dependent |

**Table 1.** Comparative evaluation of embedded Linux platforms for industrial IoT.

---

## 8. Conclusion

The choice of embedded Linux platform for industrial IoT devices is not a purely technical decision---it is a strategic commitment affecting security posture, regulatory compliance, and total cost of ownership over a 10--20 year device lifecycle.

For industrial partners, FLECS Technologies recommends the **Yocto + RAUC + FLECS Core** stack as the gold standard for production deployments. This architecture provides the smallest attack surface, the highest degree of control, and native compliance with CRA and IEC 62443 requirements. For partners without embedded Linux expertise, **Ubuntu Core + FLECS Core** offers a compelling managed alternative with Canonical's long-term security commitment.

Regardless of the OS platform chosen, the FLECS two-layer architecture ensures that **application lifecycle management is decoupled from operating system management**. This separation is the key architectural insight: device manufacturers maintain the OS; application vendors maintain their apps; device operators control the update schedule. Each party manages their own SBOM, their own CVE response, and their own release cadence.

This is how industrial IoT scales: not by building monolithic firmware images, but by composing independent, updatable layers---each with clear ownership, clear security boundaries, and clear regulatory responsibility.

---

## References

[1] CIQ, "Linux kernel CVEs 2025: what security leaders need to know to prepare for 2026," 2025. https://ciq.com/blog/linux-kernel-cves-2025-what-security-leaders-need-to-know-to-prepare-for-2026/

[2] European Commission, "Cyber Resilience Act," 2024. https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act; Keysight, "One Year Countdown to EU CRA Compliance," Sep 2025. https://www.keysight.com/blogs/en/tech/nwvs/2025/09/11/one-year-countdown-to-eu-cra-compliance-september-11-2026-changes-everything

[3] ISA, "ISA/IEC 62443 Series of Standards," https://www.isa.org/standards-and-publications/isa-standards/isa-iec-62443-series-of-standards; Canonical, "Industrial cybersecurity: the journey towards IEC 62443 compliance," https://canonical.com/blog/industrial-cybersecurity-iec-62443-compliance

[4] The Yocto Project, https://www.yoctoproject.org/

[5] SinSmarts, "Yocto vs. Ubuntu: Which Linux Distribution Is Best Suited for Embedded Systems, IoT, and Edge Computing?" https://www.sinsmarts.com/blog/yocto-vs-ubuntu-which-linux-is-best-for-embedded-systems-iot-and-edge-computing/; Canonical, "Embedded Linux project: Yocto or Ubuntu Core?" https://ubuntu.com/blog/embedded-linux-project-ii

[6] Siemens, "The F2X project -- an industrial Linux Edge device with cloud connectivity," https://www.siemensvyvojar.cz/en/the-f2x-project-an-industrial-linux-edge-device-with-cloud-connectivity/

[7] RAUC, "Safe and Secure OTA Updates for Embedded Linux," https://rauc.io/; RAUC Documentation, "Integration," https://rauc.readthedocs.io/en/latest/integration.html

[8] Canonical, "Ubuntu Core," https://ubuntu.com/core

[9] Lynx Software Technologies, "Long-Term Support (LTS) for Embedded Linux: What It Really Requires," https://www.lynx.com/blog/lts-for-linux; Canonical, "Meet Canonical at CES 2026," https://canonical.com/blog/canonical-at-ces-2026

[10] ARM Based Solutions, "Comparison of Ubuntu, Debian, and Yocto for IIoT and Edge Computing," https://armbasedsolutions.com/info-detail/comparison-of-ubuntu,-debian,-and-yocto-for-iiot-and-edge-computing

[11] Balena, "Powerful IoT device management made simple," https://www.balena.io; Docker, "From Edge to Mainstream: Scaling to 100K+ IoT Devices," https://www.docker.com/blog/from-edge-to-mainstream-scaling-to-100k-iot-devices/

[12] Linux Foundation Research, "Challenges and opportunities in implementing the EU Cyber Resilience Act," 2024. https://www.linuxfoundation.org/research/eu-cyber-resilience-act

[13] FLECS Technologies, "CRA Compliance," https://flecs.tech/cra-compliance; FLECS Technologies, "Industrial Control Platform," https://flecs.tech/industrial-control-platform

[14] BSI, "TR-03183: Cyber Resilience Requirements for Manufacturers and Products," 2024. https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Technische-Richtlinien/TR-nach-Thema-sortiert/tr03183/tr-03183.html

[15] ENISA, "Cyber Resilience Act Requirements Standards Mapping," 2024. https://www.enisa.europa.eu/publications/cyber-resilience-act-requirements-standards-mapping

---

## About FLECS Technologies

FLECS Technologies GmbH is the shared software layer for industrial automation. The FLECS platform enables device manufacturers to offer an app marketplace on their industrial hardware, allowing end customers to install, update, configure, and manage containerized applications---including PLC runtimes, protocol converters, and edge analytics---without touching the underlying operating system. FLECS Core is 100% open source and runs on any Linux device with Docker support, providing a vendor-neutral, CRA-ready application runtime for the industrial edge.

**Website:** https://flecs.tech
**Marketplace:** https://flecs.tech/marketplace
**CRA Compliance:** https://flecs.tech/cra-compliance
**Industrial Control Platform:** https://flecs.tech/industrial-control-platform
**Contact:** info@flecs.tech

---

*Copyright 2026 FLECS Technologies GmbH. All rights reserved.*
*This document may be freely distributed for informational purposes.*
