# Mobile Accessibility Scan

Sonde Scribe alpha

Scope: Cockpit Mobile accessibility fixture
Runtime: file-direct
Report type: mobile-accessibility-scan
Export source: exports/report.md

<a id="section-overview"></a>
## Overview

This file-direct report loads runtime data from relative assets, preserves anchors without a server, and uses evidence from the cockpit-mobile accessibility fixture.

**Accessibility issue:** WCAG 1.1.1: the SwiftUI Image is meaningful content, but the fixture exposes it without an accessibilityLabel.

- **Discovery summary:** 10 public findings, 5 source languages, 0 private artifacts exposed.
- **Sonde Score:** **860** / 1000
- **Compliance matrix:** WCAG, HIG, Material Design, source trace, and brand-consistency findings are represented.

<a id="finding-missing-alt"></a>
## SwiftUI image is missing an accessible name

Severity: High
Classification: Accessibility
Language: swift
Framework: SwiftUI — iOS runtime

The SwiftUI Image renders as meaningful content in the profile alert row but exposes no accessibilityLabel — VoiceOver announces nothing and the UIKit transform inherits the gap.

**Criterion:** WCAG 1.1.1 Non-text Content

**Recommended next step:** Add a product-specific .accessibilityLabel(...) modifier or mark the Image decorative with .accessibilityHidden(true) before the UIKit transform runs.

<a id="source-swiftui-missing-image-label"></a>
### SwiftUI — iOS runtime source evidence

packages/cockpit-mobile/src/commonMain/resources/mobileA11yFixtures/swiftUiMissingImageLabel.swift L4-L12

Source: packages/cockpit-mobile/src/commonMain/resources/mobileA11yFixtures/swiftUiMissingImageLabel.swift L4-L12

```swift
struct SondeDogfoodSwiftUIImageMissingLabel: View {
  var body: some View {
    HStack {
      Image(systemName: "person.crop.circle.badge.exclamationmark")
        .font(.title2)
      Text("Profile alert")
    }
  }
}
```

<a id="finding-1-runtime-scan-found-symbolic-accessible-name"></a>
## Runtime scan found symbolic accessible name

Severity: High
Classification: Accessibility
Language: kotlin
Framework: Compose Multiplatform — Android runtime

The local runtime accessibility tree exposes the cockpit-mobile seed icon action as a symbolic name instead of a durable accessible name.

**Criterion:** WCAG 4.1.2 Name, Role, Value

**Recommended next step:** Add a descriptive Compose semantics contentDescription or replace the icon-only action with a labelled control, then rerun the local runtime handoff.

<a id="source-1-runtime-scan-found-symbolic-accessible-name"></a>
### Compose Multiplatform — Android runtime source evidence

packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt L490-L499

Source: packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt L490-L499

```kotlin
@Composable
private fun StaticDogfoodSeedAction() {
  IconButton(
    onClick = {},
    modifier = Modifier.testTag(SondeMobileTestTags.StaticDogfoodSeedAction),
  ) {
    // Intentional Phase 9 M2 dogfood seed: symbolic text is not a durable accessible name.
    Text("!")
  }
}
```

<a id="finding-2-runtime-scan-found-symbolic-accessible-name"></a>
## Runtime scan found symbolic accessible name

Severity: High
Classification: Accessibility
Language: kotlin
Framework: Compose Multiplatform — iOS runtime

The local runtime accessibility tree exposes the cockpit-mobile seed icon action as a symbolic name instead of a durable accessible name.

**Criterion:** WCAG 4.1.2 Name, Role, Value

**Recommended next step:** Add a descriptive Compose semantics contentDescription or replace the icon-only action with a labelled control, then rerun the local runtime handoff.

<a id="source-2-runtime-scan-found-symbolic-accessible-name"></a>
### Compose Multiplatform — iOS runtime source evidence

packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt L490-L499

Source: packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt L490-L499

```kotlin
@Composable
private fun StaticDogfoodSeedAction() {
  IconButton(
    onClick = {},
    modifier = Modifier.testTag(SondeMobileTestTags.StaticDogfoodSeedAction),
  ) {
    // Intentional Phase 9 M2 dogfood seed: symbolic text is not a durable accessible name.
    Text("!")
  }
}
```

<a id="finding-4-filter-control-target-is-below-android-minimum"></a>
## Filter control target is below Android minimum

Severity: Critical
Classification: Accessibility
Language: kotlin
Framework: Compose Multiplatform — Android Material Design (target size)

The real cockpit-mobile Findings screen renders compact 32dp filter controls below Android's 48dp minimum target size — touch users with motor impairments can miss the control entirely.

**Criterion:** WCAG 2.5.5 Target Size

**Recommended next step:** Increase the filter control hit area to at least 48dp while preserving the grouped findings density.

<a id="source-4-filter-control-target-is-below-android-minimum"></a>
### Compose Multiplatform — Android Material Design (target size) source evidence

packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt L648-L662

Source: packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt L648-L662

```kotlin
@Composable
private fun CompactFilterChip(
  selected: Boolean,
  onClick: () -> Unit,
  label: String,
  modifier: Modifier = Modifier,
) {
  Surface(
    modifier = modifier
      .height(SondeMobileTokens.spacingMd * 2)
      .clickable { onClick() }
      .semantics {
        role = Role.Button
        contentDescription = label
      },
```

<a id="finding-5-finding-group-heading-can-truncate-under-ios-dynamic-type"></a>
## Finding group heading can truncate under iOS Dynamic Type

Severity: Medium
Classification: Accessibility
Language: kotlin
Framework: Compose Multiplatform — iOS HIG (Dynamic Type)

Under the iOS runtime text scale used by the simulator, the Findings group heading truncates before its full label fits — readers using larger text lose the section context.

**Criterion:** WCAG 1.4.4 Resize Text

**Recommended next step:** Keep heading text wrapping and spacing token-driven so the heading reflows instead of truncating.

<a id="source-5-finding-group-heading-can-truncate-under-ios-dynamic-type"></a>
### Compose Multiplatform — iOS HIG (Dynamic Type) source evidence

packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt L530-L538

Source: packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt L530-L538

```kotlin
    groups.forEach { group ->
      item {
        Text(
          "${severityGlyph(group.severity)} ${group.severity.name} findings requiring mobile cockpit review",
          modifier = Modifier.testTag("${SondeMobileTestTags.FindingSeverityGroupPrefix}${group.severity.name}"),
          style = MaterialTheme.typography.titleMedium,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis,
        )
```

<a id="finding-6-mobile-brand-consistency-gap-color-drift"></a>
## Mobile brand consistency gap (color drift)

Severity: Medium
Classification: Brand consistency
Language: kotlin
Framework: Compose Multiplatform — Material Design brand parity (color drift)

The Android render of the summary action accent shipped a different color than the brand reference. Cross-platform brand drift is invisible to single-platform audits but obvious when both renders are compared side-by-side.

**Criterion:** Mobile Brand Consistency: color

**Recommended next step:** Align the rendered Android color to the brand token defined in the design system.

<a id="source-6-mobile-brand-consistency-gap-color-drift"></a>
### Compose Multiplatform — Material Design brand parity (color drift) source evidence

packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt L490-L499

Source: packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt L490-L499

```kotlin
@Composable
private fun StaticDogfoodSeedAction() {
  IconButton(
    onClick = {},
    modifier = Modifier.testTag(SondeMobileTestTags.StaticDogfoodSeedAction),
  ) {
    // Intentional Phase 9 M2 dogfood seed: symbolic text is not a durable accessible name.
    Text("!")
  }
}
```

<a id="finding-7-objective-c-uikit-image-is-missing-an-accessible-name"></a>
## Objective-C UIKit image is missing an accessible name

Severity: High
Classification: Accessibility
Language: objectivec
Framework: UIKit (Objective-C) — iOS runtime

The UIImageView is explicitly marked as an accessibility element with the image trait but carries no accessibilityLabel, so the SwiftUI Image transform inherits an unlabelled meaningful image.

**Criterion:** WCAG 1.1.1 Non-text Content

**Recommended next step:** Set avatarImageView.accessibilityLabel to a product-specific string in UIKit before the SwiftUI transform runs.

<a id="source-7-objective-c-uikit-image-is-missing-an-accessible-name"></a>
### UIKit (Objective-C) — iOS runtime source evidence

packages/cockpit-mobile/src/commonMain/resources/mobileA11yFixtures/uikitMissingImageLabel.m L9-L15

Source: packages/cockpit-mobile/src/commonMain/resources/mobileA11yFixtures/uikitMissingImageLabel.m L9-L15

```objectivec
- (void)configureDecorativeLookingAvatar {
  UIImageView *avatarImageView = [[UIImageView alloc] init];
  avatarImageView.isAccessibilityElement = YES;
  avatarImageView.accessibilityTraits = UIAccessibilityTraitImage;
  [avatarImageView.widthAnchor constraintEqualToConstant:44].active = YES;
  [avatarImageView.heightAnchor constraintEqualToConstant:44].active = YES;
}
```

<a id="finding-8-hardcoded-english-accessibility-label"></a>
## Hardcoded English accessibility label

Severity: Medium
Classification: Source trace
Language: typescript
Framework: React Native — source trace

The `<Text>` element ships with a hardcoded English `accessibilityLabel`. Non-English users will hear the literal English string regardless of their locale.

**Criterion:** Sonde Source Trace Availability

**Recommended next step:** Replace the hardcoded `accessibilityLabel` with a localized string lookup before the screen reaches non-English users.

<a id="source-8-hardcoded-english-accessibility-label"></a>
### React Native — source trace source evidence

packages/cockpit-mobile/src/commonMain/resources/mobileA11yFixtures/reactNativeProfileStatus.tsx L2-L6

Source: packages/cockpit-mobile/src/commonMain/resources/mobileA11yFixtures/reactNativeProfileStatus.tsx L2-L6

```typescript
import { Text } from 'react-native';

export function ReactNativeProfileStatus() {
  return <Text accessibilityLabel="Profile status" testID="profile.status" />;
}
```

<a id="finding-9-image-element-is-missing-the-alt-attribute"></a>
## Image element is missing the alt attribute

Severity: High
Classification: Accessibility
Language: typescript
Framework: React / TSX — WCAG static probe

The bare `<img>` element exposes no alt attribute, so assistive technologies announce the file path or nothing at all.

**Criterion:** WCAG 1.1.1 Non-text Content (Level A)

**Recommended next step:** Add `alt="description"` for informative images, or `alt=""` for decorative images.

<a id="source-9-image-element-is-missing-the-alt-attribute"></a>
### React / TSX — WCAG static probe source evidence

packages/cockpit/e2e/fixtures/src-compliance/badAccessibility.tsx L11-L13

Source: packages/cockpit/e2e/fixtures/src-compliance/badAccessibility.tsx L11-L13

```typescript
export function BadImage(): ReactElement {
  return <img src="/logo.png" />;
}
```

<a id="finding-10-element-has-positive-tabindex-focus-order"></a>
## Element has positive tabindex (focus order)

Severity: High
Classification: Accessibility
Language: html
Framework: HTML — WCAG mechanical probe

The `<button tabindex="3">` creates an unpredictable focus order — positive tabindex values jump out of natural DOM order and disorient keyboard users.

**Criterion:** WCAG 2.4.3 Focus Order (Level A)

**Recommended next step:** Use `tabindex="0"` to add to natural tab order, or `tabindex="-1"` for programmatic focus only. Rearrange DOM order to achieve the desired tab sequence.

<a id="source-10-element-has-positive-tabindex-focus-order"></a>
### HTML — WCAG mechanical probe source evidence

packages/fix-apply/e2e/fixtures/wcagMechanicalHtml/index.html L11-L14

Source: packages/fix-apply/e2e/fixtures/wcagMechanicalHtml/index.html L11-L14

```html
  </nav>
  <img src="logo.png">
  <button tabindex="3">Submit</button>
</body>
```

<a id="fix-plan-missing-alt"></a>
## Fix plan: image alt text

This remediation slice gives the public report a concrete repair path without shipping private receipt data.

Fix plan link: [Fix plan: image alt text](../fix-plans/finding-missing-alt/index.html#fix-plan-missing-alt)

Public export note: this Markdown file is derived from public runtime manifest and search-source data only. Private receipt data and gated fix-plan prose are excluded.
