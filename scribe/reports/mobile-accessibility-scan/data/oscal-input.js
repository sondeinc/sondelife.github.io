window.__SCRIBE_OSCAL_INPUT__ = {
  "entityName": "Mobile Accessibility Scan",
  "findings": [
    {
      "description": "The local runtime accessibility tree exposes the cockpit-mobile seed icon action as a symbolic name instead of a durable accessible name.",
      "pageUrl": "https://sonde.life/scribe/reports/mobile-accessibility-scan/#finding-1-runtime-scan-found-symbolic-accessible-name",
      "probe": "Compose Multiplatform — Android runtime",
      "severity": "high",
      "standard": "WCAG 4.1.2"
    },
    {
      "description": "The local runtime accessibility tree exposes the cockpit-mobile seed icon action as a symbolic name instead of a durable accessible name.",
      "pageUrl": "https://sonde.life/scribe/reports/mobile-accessibility-scan/#finding-2-runtime-scan-found-symbolic-accessible-name",
      "probe": "Compose Multiplatform — iOS runtime",
      "severity": "high",
      "standard": "WCAG 4.1.2"
    },
    {
      "description": "The SwiftUI Image renders as meaningful content in the profile alert row but exposes no accessibilityLabel — VoiceOver announces nothing and the UIKit transform inherits the gap.",
      "pageUrl": "https://sonde.life/scribe/reports/mobile-accessibility-scan/#finding-missing-alt",
      "probe": "SwiftUI — iOS runtime",
      "severity": "high",
      "standard": "WCAG 1.1.1"
    },
    {
      "description": "The real cockpit-mobile Findings screen renders compact 32dp filter controls below Android's 48dp minimum target size — touch users with motor impairments can miss the control entirely.",
      "pageUrl": "https://sonde.life/scribe/reports/mobile-accessibility-scan/#finding-4-filter-control-target-is-below-android-minimum",
      "probe": "Compose Multiplatform — Android Material Design (target size)",
      "severity": "critical",
      "standard": "WCAG 2.5.5"
    },
    {
      "description": "Under the iOS runtime text scale used by the simulator, the Findings group heading truncates before its full label fits — readers using larger text lose the section context.",
      "pageUrl": "https://sonde.life/scribe/reports/mobile-accessibility-scan/#finding-5-finding-group-heading-can-truncate-under-ios-dynamic-type",
      "probe": "Compose Multiplatform — iOS HIG (Dynamic Type)",
      "severity": "medium",
      "standard": "WCAG 1.4.4"
    },
    {
      "description": "The UIImageView is explicitly marked as an accessibility element with the image trait but carries no accessibilityLabel, so the SwiftUI Image transform inherits an unlabelled meaningful image.",
      "pageUrl": "https://sonde.life/scribe/reports/mobile-accessibility-scan/#finding-7-objective-c-uikit-image-is-missing-an-accessible-name",
      "probe": "UIKit (Objective-C) — iOS runtime",
      "severity": "high",
      "standard": "WCAG 1.1.1"
    },
    {
      "conformanceLevel": "A",
      "description": "The bare `<img>` element exposes no alt attribute, so assistive technologies announce the file path or nothing at all.",
      "pageUrl": "https://sonde.life/scribe/reports/mobile-accessibility-scan/#finding-9-image-element-is-missing-the-alt-attribute",
      "probe": "React / TSX — WCAG static probe",
      "severity": "high",
      "standard": "WCAG 1.1.1"
    },
    {
      "conformanceLevel": "A",
      "description": "The `<button tabindex=\"3\">` creates an unpredictable focus order — positive tabindex values jump out of natural DOM order and disorient keyboard users.",
      "pageUrl": "https://sonde.life/scribe/reports/mobile-accessibility-scan/#finding-10-element-has-positive-tabindex-focus-order",
      "probe": "HTML — WCAG mechanical probe",
      "severity": "high",
      "standard": "WCAG 2.4.3"
    }
  ],
  "rendererEpoch": 1,
  "scanDate": "2026-05-15T12:00:00.000Z",
  "slug": "mobile-accessibility-scan",
  "url": "https://sonde.life/scribe/reports/mobile-accessibility-scan/",
  "vertical": "scribe"
}
;
