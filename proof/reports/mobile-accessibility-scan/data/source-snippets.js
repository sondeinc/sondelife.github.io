window.__SCRIBE_SOURCE_SNIPPETS__ = [
  {
    "anchorId": "source-swiftui-missing-image-label",
    "code": "struct SondeDogfoodSwiftUIImageMissingLabel: View {\n  var body: some View {\n    HStack {\n      Image(systemName: \"person.crop.circle.badge.exclamationmark\")\n        .font(.title2)\n      Text(\"Profile alert\")\n    }\n  }\n}",
    "endLine": 12,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "SwiftUI — iOS runtime"
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
    "language": "swift",
    "pagePath": "findings/finding-missing-alt/index.html",
    "snippetId": "source-swiftui-missing-image-label",
    "sourcePath": "packages/cockpit-mobile/src/commonMain/resources/mobileA11yFixtures/swiftUiMissingImageLabel.swift",
    "startLine": 4,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/cockpit-mobile/src/commonMain/resources/mobileA11yFixtures/swiftUiMissingImageLabel.swift#L4-L12",
    "verifiedSourceHash": "sha256:c9bf5b764bac6ed0f6544f7ce02068714ead944981a12f1ad82ac5dccbc6709a"
  },
  {
    "anchorId": "source-1-runtime-scan-found-symbolic-accessible-name",
    "code": "@Composable\nprivate fun StaticDogfoodSeedAction() {\n  IconButton(\n    onClick = {},\n    modifier = Modifier.testTag(SondeMobileTestTags.StaticDogfoodSeedAction),\n  ) {\n    // Intentional Phase 9 M2 dogfood seed: symbolic text is not a durable accessible name.\n    Text(\"!\")\n  }\n}",
    "endLine": 499,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "Compose Multiplatform — Android runtime"
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
    "language": "kotlin",
    "pagePath": "findings/finding-missing-alt/index.html",
    "snippetId": "source-1-runtime-scan-found-symbolic-accessible-name",
    "sourcePath": "packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt",
    "startLine": 490,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt#L490-L499",
    "verifiedSourceHash": "sha256:d3f809d30d075c1a84f3bd7f296c4a0351a34b64bb0e2a107a9395bbdd2ca3a5"
  },
  {
    "anchorId": "source-2-runtime-scan-found-symbolic-accessible-name",
    "code": "@Composable\nprivate fun StaticDogfoodSeedAction() {\n  IconButton(\n    onClick = {},\n    modifier = Modifier.testTag(SondeMobileTestTags.StaticDogfoodSeedAction),\n  ) {\n    // Intentional Phase 9 M2 dogfood seed: symbolic text is not a durable accessible name.\n    Text(\"!\")\n  }\n}",
    "endLine": 499,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "Compose Multiplatform — iOS runtime"
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
    "language": "kotlin",
    "pagePath": "findings/finding-missing-alt/index.html",
    "snippetId": "source-2-runtime-scan-found-symbolic-accessible-name",
    "sourcePath": "packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt",
    "startLine": 490,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt#L490-L499",
    "verifiedSourceHash": "sha256:d3f809d30d075c1a84f3bd7f296c4a0351a34b64bb0e2a107a9395bbdd2ca3a5"
  },
  {
    "anchorId": "source-4-filter-control-target-is-below-android-minimum",
    "code": "@Composable\nprivate fun CompactFilterChip(\n  selected: Boolean,\n  onClick: () -> Unit,\n  label: String,\n  modifier: Modifier = Modifier,\n) {\n  Surface(\n    modifier = modifier\n      .height(SondeMobileTokens.spacingMd * 2)\n      .clickable { onClick() }\n      .semantics {\n        role = Role.Button\n        contentDescription = label\n      },",
    "endLine": 662,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "Compose Multiplatform — Android Material Design (target size)"
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
    "language": "kotlin",
    "pagePath": "findings/finding-missing-alt/index.html",
    "snippetId": "source-4-filter-control-target-is-below-android-minimum",
    "sourcePath": "packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt",
    "startLine": 648,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt#L648-L662",
    "verifiedSourceHash": "sha256:2dfe92109623bdf10498f88031f30bc0e3eba73be7eef54c479f78266fddac5e"
  },
  {
    "anchorId": "source-5-finding-group-heading-can-truncate-under-ios-dynamic-type",
    "code": "    groups.forEach { group ->\n      item {\n        Text(\n          \"${severityGlyph(group.severity)} ${group.severity.name} findings requiring mobile cockpit review\",\n          modifier = Modifier.testTag(\"${SondeMobileTestTags.FindingSeverityGroupPrefix}${group.severity.name}\"),\n          style = MaterialTheme.typography.titleMedium,\n          maxLines = 1,\n          overflow = TextOverflow.Ellipsis,\n        )",
    "endLine": 538,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "Compose Multiplatform — iOS HIG (Dynamic Type)"
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
    "language": "kotlin",
    "pagePath": "findings/finding-missing-alt/index.html",
    "snippetId": "source-5-finding-group-heading-can-truncate-under-ios-dynamic-type",
    "sourcePath": "packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt",
    "startLine": 530,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt#L530-L538",
    "verifiedSourceHash": "sha256:b69ec7eb5ef911f09a3ab4c236b63002ade800ebf17be1e9ff132092d400b71f"
  },
  {
    "anchorId": "source-6-mobile-brand-consistency-gap-color-drift",
    "code": "@Composable\nprivate fun StaticDogfoodSeedAction() {\n  IconButton(\n    onClick = {},\n    modifier = Modifier.testTag(SondeMobileTestTags.StaticDogfoodSeedAction),\n  ) {\n    // Intentional Phase 9 M2 dogfood seed: symbolic text is not a durable accessible name.\n    Text(\"!\")\n  }\n}",
    "endLine": 499,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "Compose Multiplatform — Material Design brand parity (color drift)"
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
    "language": "kotlin",
    "pagePath": "findings/finding-missing-alt/index.html",
    "snippetId": "source-6-mobile-brand-consistency-gap-color-drift",
    "sourcePath": "packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt",
    "startLine": 490,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/cockpit-mobile/src/commonMain/kotlin/sonde/mobile/ui/SondeMobileApp.kt#L490-L499",
    "verifiedSourceHash": "sha256:d3f809d30d075c1a84f3bd7f296c4a0351a34b64bb0e2a107a9395bbdd2ca3a5"
  },
  {
    "anchorId": "source-7-objective-c-uikit-image-is-missing-an-accessible-name",
    "code": "- (void)configureDecorativeLookingAvatar {\n  UIImageView *avatarImageView = [[UIImageView alloc] init];\n  avatarImageView.isAccessibilityElement = YES;\n  avatarImageView.accessibilityTraits = UIAccessibilityTraitImage;\n  [avatarImageView.widthAnchor constraintEqualToConstant:44].active = YES;\n  [avatarImageView.heightAnchor constraintEqualToConstant:44].active = YES;\n}",
    "endLine": 15,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "UIKit (Objective-C) — iOS runtime"
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
    "language": "objectivec",
    "pagePath": "findings/finding-missing-alt/index.html",
    "snippetId": "source-7-objective-c-uikit-image-is-missing-an-accessible-name",
    "sourcePath": "packages/cockpit-mobile/src/commonMain/resources/mobileA11yFixtures/uikitMissingImageLabel.m",
    "startLine": 9,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/cockpit-mobile/src/commonMain/resources/mobileA11yFixtures/uikitMissingImageLabel.m#L9-L15",
    "verifiedSourceHash": "sha256:181726807ecc7de7db6ea46cde7a3d55a3ee204fdef943cc90dbcaadcbc794f1"
  },
  {
    "anchorId": "source-8-hardcoded-english-accessibility-label",
    "code": "import { Text } from 'react-native';\n\nexport function ReactNativeProfileStatus() {\n  return <Text accessibilityLabel=\"Profile status\" testID=\"profile.status\" />;\n}",
    "endLine": 6,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "React Native — source trace"
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
    "language": "typescript",
    "pagePath": "findings/finding-missing-alt/index.html",
    "snippetId": "source-8-hardcoded-english-accessibility-label",
    "sourcePath": "packages/cockpit-mobile/src/commonMain/resources/mobileA11yFixtures/reactNativeProfileStatus.tsx",
    "startLine": 2,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/cockpit-mobile/src/commonMain/resources/mobileA11yFixtures/reactNativeProfileStatus.tsx#L2-L6",
    "verifiedSourceHash": "sha256:bea051019bbc48058bcce2fd5c23cc596e42a10226c3b599e32019af51a007a8"
  },
  {
    "anchorId": "source-9-image-element-is-missing-the-alt-attribute",
    "code": "export function BadImage(): ReactElement {\n  return <img src=\"/logo.png\" />;\n}",
    "endLine": 13,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "React / TSX — WCAG static probe"
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
    "language": "typescript",
    "pagePath": "findings/finding-missing-alt/index.html",
    "snippetId": "source-9-image-element-is-missing-the-alt-attribute",
    "sourcePath": "packages/cockpit/e2e/fixtures/src-compliance/badAccessibility.tsx",
    "startLine": 11,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/cockpit/e2e/fixtures/src-compliance/badAccessibility.tsx#L11-L13",
    "verifiedSourceHash": "sha256:92a7402c166f297c8c9643812f992cb6864120c11dcdeec11316b552c2468b73"
  },
  {
    "anchorId": "source-10-element-has-positive-tabindex-focus-order",
    "code": "  </nav>\n  <img src=\"logo.png\">\n  <button tabindex=\"3\">Submit</button>\n</body>",
    "endLine": 14,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "{framework} source evidence",
      "icuArgs": {
        "framework": "HTML — WCAG mechanical probe"
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
    "language": "html",
    "pagePath": "findings/finding-missing-alt/index.html",
    "snippetId": "source-10-element-has-positive-tabindex-focus-order",
    "sourcePath": "packages/fix-apply/e2e/fixtures/wcagMechanicalHtml/index.html",
    "startLine": 11,
    "vcsPermalink": "https://github.com/sondeinc/sonde/blob/main/packages/fix-apply/e2e/fixtures/wcagMechanicalHtml/index.html#L11-L14",
    "verifiedSourceHash": "sha256:96912e2abb10165a8ac346290099fd37910a96ef992de7d77ec5f57176e94bd7"
  }
]
;
