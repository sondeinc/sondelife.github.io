window.__SCRIBE_FINDINGS__ = [
  {
    "anchorId": "finding-missing-alt",
    "audienceInterest": [
      {
        "audience": "executive",
        "weight": 72
      },
      {
        "audience": "compliance-officer",
        "weight": 94
      },
      {
        "audience": "developer",
        "weight": 100
      },
      {
        "audience": "remediator",
        "weight": 100
      }
    ],
    "classification": "accessibility",
    "contextLinks": [],
    "controlIds": [
      "wcag-1-1-1-non-text-content"
    ],
    "feedbackActionId": "feedback-missing-alt",
    "findingId": "finding-missing-alt",
    "frameworkIds": [
      "swiftui-ios-runtime"
    ],
    "language": "swift",
    "recommendation": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "UIKit 変換が実行される前に、製品固有の .accessibilityLabel(...) 修飾子を追加するか、装飾画像として .accessibilityHidden(true) を設定します。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Add a product-specific .accessibilityLabel(...) modifier or mark the Image decorative with .accessibilityHidden(true) before the UIKit transform runs.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.2.finding.fix",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Add a product-specific .accessibilityLabel(...) modifier or mark the Image decorative with .accessibilityHidden(true) before the UIKit transform runs."
        }
      }
    },
    "severity": "high",
    "shareActionId": "share-missing-alt",
    "sourceSnippetIds": [
      "source-swiftui-missing-image-label"
    ],
    "summary": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "SwiftUI の Image はプロフィールアラート行で意味のあるコンテンツとして描画されますが、accessibilityLabel を公開していません。VoiceOver は何も読み上げず、UIKit 変換もその欠落を引き継ぎます。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "The SwiftUI Image renders as meaningful content in the profile alert row but exposes no accessibilityLabel — VoiceOver announces nothing and the UIKit transform inherits the gap.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.2.finding.summary",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The SwiftUI Image renders as meaningful content in the profile alert row but exposes no accessibilityLabel — VoiceOver announces nothing and the UIKit transform inherits the gap."
        }
      }
    },
    "title": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "SwiftUI 画像にアクセシブル名がありません"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "SwiftUI image is missing an accessible name",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.2.finding.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "SwiftUI image is missing an accessible name"
        }
      }
    }
  },
  {
    "anchorId": "finding-1-runtime-scan-found-symbolic-accessible-name",
    "audienceInterest": [
      {
        "audience": "executive",
        "weight": 72
      },
      {
        "audience": "compliance-officer",
        "weight": 94
      },
      {
        "audience": "developer",
        "weight": 100
      },
      {
        "audience": "remediator",
        "weight": 100
      }
    ],
    "classification": "accessibility",
    "contextLinks": [],
    "controlIds": [
      "wcag-4-1-2-name-role-value"
    ],
    "feedbackActionId": "feedback-missing-alt",
    "findingId": "finding-1-runtime-scan-found-symbolic-accessible-name",
    "frameworkIds": [
      "compose-multiplatform-android-runtime"
    ],
    "language": "kotlin",
    "recommendation": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "説明的な Compose semantics の contentDescription を追加するか、アイコンのみの操作をラベル付きコントロールに置き換えてから、ローカル実行時ハンドオフを再実行します。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Add a descriptive Compose semantics contentDescription or replace the icon-only action with a labelled control, then rerun the local runtime handoff.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.0.finding.fix",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Add a descriptive Compose semantics contentDescription or replace the icon-only action with a labelled control, then rerun the local runtime handoff."
        }
      }
    },
    "severity": "high",
    "shareActionId": "share-missing-alt",
    "sourceSnippetIds": [
      "source-1-runtime-scan-found-symbolic-accessible-name"
    ],
    "summary": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "ローカル実行時のアクセシビリティツリーでは、cockpit-mobile のシードアイコン操作が、耐久性のあるアクセシブル名ではなく記号名として公開されています。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "The local runtime accessibility tree exposes the cockpit-mobile seed icon action as a symbolic name instead of a durable accessible name.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.0.finding.summary",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The local runtime accessibility tree exposes the cockpit-mobile seed icon action as a symbolic name instead of a durable accessible name."
        }
      }
    },
    "title": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "実行時スキャンが記号だけのアクセシブル名を検出"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Runtime scan found symbolic accessible name",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.0.finding.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Runtime scan found symbolic accessible name"
        }
      }
    }
  },
  {
    "anchorId": "finding-2-runtime-scan-found-symbolic-accessible-name",
    "audienceInterest": [
      {
        "audience": "executive",
        "weight": 72
      },
      {
        "audience": "compliance-officer",
        "weight": 94
      },
      {
        "audience": "developer",
        "weight": 100
      },
      {
        "audience": "remediator",
        "weight": 100
      }
    ],
    "classification": "accessibility",
    "contextLinks": [],
    "controlIds": [
      "wcag-4-1-2-name-role-value"
    ],
    "feedbackActionId": "feedback-missing-alt",
    "findingId": "finding-2-runtime-scan-found-symbolic-accessible-name",
    "frameworkIds": [
      "compose-multiplatform-ios-runtime"
    ],
    "language": "kotlin",
    "recommendation": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "説明的な Compose semantics の contentDescription を追加するか、アイコンのみの操作をラベル付きコントロールに置き換えてから、ローカル実行時ハンドオフを再実行します。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Add a descriptive Compose semantics contentDescription or replace the icon-only action with a labelled control, then rerun the local runtime handoff.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.1.finding.fix",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Add a descriptive Compose semantics contentDescription or replace the icon-only action with a labelled control, then rerun the local runtime handoff."
        }
      }
    },
    "severity": "high",
    "shareActionId": "share-missing-alt",
    "sourceSnippetIds": [
      "source-2-runtime-scan-found-symbolic-accessible-name"
    ],
    "summary": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "ローカル実行時のアクセシビリティツリーでは、cockpit-mobile のシードアイコン操作が、耐久性のあるアクセシブル名ではなく記号名として公開されています。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "The local runtime accessibility tree exposes the cockpit-mobile seed icon action as a symbolic name instead of a durable accessible name.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.1.finding.summary",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The local runtime accessibility tree exposes the cockpit-mobile seed icon action as a symbolic name instead of a durable accessible name."
        }
      }
    },
    "title": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "実行時スキャンが記号だけのアクセシブル名を検出"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Runtime scan found symbolic accessible name",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.1.finding.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Runtime scan found symbolic accessible name"
        }
      }
    }
  },
  {
    "anchorId": "finding-4-filter-control-target-is-below-android-minimum",
    "audienceInterest": [
      {
        "audience": "executive",
        "weight": 72
      },
      {
        "audience": "compliance-officer",
        "weight": 94
      },
      {
        "audience": "developer",
        "weight": 100
      },
      {
        "audience": "remediator",
        "weight": 100
      }
    ],
    "classification": "accessibility",
    "contextLinks": [],
    "controlIds": [
      "wcag-2-5-5-target-size"
    ],
    "feedbackActionId": "feedback-missing-alt",
    "findingId": "finding-4-filter-control-target-is-below-android-minimum",
    "frameworkIds": [
      "compose-multiplatform-android-material-design-target-size"
    ],
    "language": "kotlin",
    "recommendation": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "グループ化された検出事項の密度を保ちながら、フィルターコントロールのヒット領域を少なくとも 48dp に広げます。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Increase the filter control hit area to at least 48dp while preserving the grouped findings density.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.3.finding.fix",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Increase the filter control hit area to at least 48dp while preserving the grouped findings density."
        }
      }
    },
    "severity": "critical",
    "shareActionId": "share-missing-alt",
    "sourceSnippetIds": [
      "source-4-filter-control-target-is-below-android-minimum"
    ],
    "summary": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "実際の cockpit-mobile Findings 画面では、コンパクトな 32dp のフィルターコントロールが Android の最小ターゲットサイズ 48dp を下回って描画されます。運動機能に制約があるタッチ利用者は、このコントロールを押し損ねる可能性があります。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "The real cockpit-mobile Findings screen renders compact 32dp filter controls below Android's 48dp minimum target size — touch users with motor impairments can miss the control entirely.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.3.finding.summary",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The real cockpit-mobile Findings screen renders compact 32dp filter controls below Android's 48dp minimum target size — touch users with motor impairments can miss the control entirely."
        }
      }
    },
    "title": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "フィルターコントロールのターゲットが Android の最小値を下回っています"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Filter control target is below Android minimum",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.3.finding.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Filter control target is below Android minimum"
        }
      }
    }
  },
  {
    "anchorId": "finding-5-finding-group-heading-can-truncate-under-ios-dynamic-type",
    "audienceInterest": [
      {
        "audience": "executive",
        "weight": 72
      },
      {
        "audience": "compliance-officer",
        "weight": 94
      },
      {
        "audience": "developer",
        "weight": 100
      },
      {
        "audience": "remediator",
        "weight": 100
      }
    ],
    "classification": "accessibility",
    "contextLinks": [],
    "controlIds": [
      "wcag-1-4-4-resize-text"
    ],
    "feedbackActionId": "feedback-missing-alt",
    "findingId": "finding-5-finding-group-heading-can-truncate-under-ios-dynamic-type",
    "frameworkIds": [
      "compose-multiplatform-ios-hig-dynamic-type"
    ],
    "language": "kotlin",
    "recommendation": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "見出しが切り詰められるのではなくリフローするように、見出しテキストの折り返しと間隔をトークン駆動のまま保ちます。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Keep heading text wrapping and spacing token-driven so the heading reflows instead of truncating.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.4.finding.fix",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Keep heading text wrapping and spacing token-driven so the heading reflows instead of truncating."
        }
      }
    },
    "severity": "medium",
    "shareActionId": "share-missing-alt",
    "sourceSnippetIds": [
      "source-5-finding-group-heading-can-truncate-under-ios-dynamic-type"
    ],
    "summary": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "シミュレータで使用した iOS 実行時テキストスケールでは、Findings グループ見出しが完全なラベルを表示する前に切り詰められます。大きなテキストを使用する読者はセクションの文脈を失います。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Under the iOS runtime text scale used by the simulator, the Findings group heading truncates before its full label fits — readers using larger text lose the section context.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.4.finding.summary",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Under the iOS runtime text scale used by the simulator, the Findings group heading truncates before its full label fits — readers using larger text lose the section context."
        }
      }
    },
    "title": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "iOS Dynamic Type で検出グループ見出しが途中で切れる可能性があります"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Finding group heading can truncate under iOS Dynamic Type",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.4.finding.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Finding group heading can truncate under iOS Dynamic Type"
        }
      }
    }
  },
  {
    "anchorId": "finding-6-mobile-brand-consistency-gap-color-drift",
    "audienceInterest": [
      {
        "audience": "executive",
        "weight": 72
      },
      {
        "audience": "compliance-officer",
        "weight": 94
      },
      {
        "audience": "developer",
        "weight": 100
      },
      {
        "audience": "remediator",
        "weight": 100
      }
    ],
    "classification": "brand-consistency",
    "contextLinks": [],
    "controlIds": [
      "mobile-brand-consistency-color"
    ],
    "feedbackActionId": "feedback-missing-alt",
    "findingId": "finding-6-mobile-brand-consistency-gap-color-drift",
    "frameworkIds": [
      "compose-multiplatform-material-design-brand-parity-color-drift"
    ],
    "language": "kotlin",
    "recommendation": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "描画される Android の色を、デザインシステムで定義されたブランドトークンに合わせます。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Align the rendered Android color to the brand token defined in the design system.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.5.finding.fix",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Align the rendered Android color to the brand token defined in the design system."
        }
      }
    },
    "severity": "medium",
    "shareActionId": "share-missing-alt",
    "sourceSnippetIds": [
      "source-6-mobile-brand-consistency-gap-color-drift"
    ],
    "summary": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "Android で描画されたサマリーアクションのアクセント色が、ブランド基準とは異なる色で出荷されていました。クロスプラットフォームのブランドずれは単一プラットフォーム監査では見えませんが、両方の描画を横並びで比較すると明確です。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "The Android render of the summary action accent shipped a different color than the brand reference. Cross-platform brand drift is invisible to single-platform audits but obvious when both renders are compared side-by-side.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.5.finding.summary",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The Android render of the summary action accent shipped a different color than the brand reference. Cross-platform brand drift is invisible to single-platform audits but obvious when both renders are compared side-by-side."
        }
      }
    },
    "title": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "モバイルのブランド一貫性ギャップ（色のずれ）"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Mobile brand consistency gap (color drift)",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.5.finding.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Mobile brand consistency gap (color drift)"
        }
      }
    }
  },
  {
    "anchorId": "finding-7-objective-c-uikit-image-is-missing-an-accessible-name",
    "audienceInterest": [
      {
        "audience": "executive",
        "weight": 72
      },
      {
        "audience": "compliance-officer",
        "weight": 94
      },
      {
        "audience": "developer",
        "weight": 100
      },
      {
        "audience": "remediator",
        "weight": 100
      }
    ],
    "classification": "accessibility",
    "contextLinks": [],
    "controlIds": [
      "wcag-1-1-1-non-text-content"
    ],
    "feedbackActionId": "feedback-missing-alt",
    "findingId": "finding-7-objective-c-uikit-image-is-missing-an-accessible-name",
    "frameworkIds": [
      "uikit-objective-c-ios-runtime"
    ],
    "language": "objectivec",
    "recommendation": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "SwiftUI 変換が実行される前に、UIKit 側で avatarImageView.accessibilityLabel に製品固有の文字列を設定します。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Set avatarImageView.accessibilityLabel to a product-specific string in UIKit before the SwiftUI transform runs.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.6.finding.fix",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Set avatarImageView.accessibilityLabel to a product-specific string in UIKit before the SwiftUI transform runs."
        }
      }
    },
    "severity": "high",
    "shareActionId": "share-missing-alt",
    "sourceSnippetIds": [
      "source-7-objective-c-uikit-image-is-missing-an-accessible-name"
    ],
    "summary": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "UIImageView は画像トレイトを持つアクセシビリティ要素として明示的にマークされていますが、accessibilityLabel がありません。そのため、SwiftUI Image 変換はラベルのない意味のある画像を引き継ぎます。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "The UIImageView is explicitly marked as an accessibility element with the image trait but carries no accessibilityLabel, so the SwiftUI Image transform inherits an unlabelled meaningful image.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.6.finding.summary",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The UIImageView is explicitly marked as an accessibility element with the image trait but carries no accessibilityLabel, so the SwiftUI Image transform inherits an unlabelled meaningful image."
        }
      }
    },
    "title": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "Objective-C UIKit 画像にアクセシブル名がありません"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Objective-C UIKit image is missing an accessible name",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.6.finding.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Objective-C UIKit image is missing an accessible name"
        }
      }
    }
  },
  {
    "anchorId": "finding-8-hardcoded-english-accessibility-label",
    "audienceInterest": [
      {
        "audience": "executive",
        "weight": 72
      },
      {
        "audience": "compliance-officer",
        "weight": 94
      },
      {
        "audience": "developer",
        "weight": 100
      },
      {
        "audience": "remediator",
        "weight": 100
      }
    ],
    "classification": "source-trace",
    "contextLinks": [],
    "controlIds": [
      "sonde-source-trace-availability"
    ],
    "feedbackActionId": "feedback-missing-alt",
    "findingId": "finding-8-hardcoded-english-accessibility-label",
    "frameworkIds": [
      "react-native-source-trace"
    ],
    "language": "typescript",
    "recommendation": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "画面が英語以外の利用者に届く前に、ハードコードされた `accessibilityLabel` をローカライズ済み文字列の参照に置き換えます。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Replace the hardcoded `accessibilityLabel` with a localized string lookup before the screen reaches non-English users.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.7.finding.fix",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Replace the hardcoded `accessibilityLabel` with a localized string lookup before the screen reaches non-English users."
        }
      }
    },
    "severity": "medium",
    "shareActionId": "share-missing-alt",
    "sourceSnippetIds": [
      "source-8-hardcoded-english-accessibility-label"
    ],
    "summary": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "`<Text>` 要素は英語の `accessibilityLabel` をハードコードしたまま出荷されます。英語以外の利用者は、ロケールに関係なく英語の文字列をそのまま聞くことになります。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "The `<Text>` element ships with a hardcoded English `accessibilityLabel`. Non-English users will hear the literal English string regardless of their locale.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.7.finding.summary",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The `<Text>` element ships with a hardcoded English `accessibilityLabel`. Non-English users will hear the literal English string regardless of their locale."
        }
      }
    },
    "title": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "英語のアクセシビリティラベルがハードコードされています"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Hardcoded English accessibility label",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.7.finding.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Hardcoded English accessibility label"
        }
      }
    }
  },
  {
    "anchorId": "finding-9-image-element-is-missing-the-alt-attribute",
    "audienceInterest": [
      {
        "audience": "executive",
        "weight": 72
      },
      {
        "audience": "compliance-officer",
        "weight": 94
      },
      {
        "audience": "developer",
        "weight": 100
      },
      {
        "audience": "remediator",
        "weight": 100
      }
    ],
    "classification": "accessibility",
    "contextLinks": [],
    "controlIds": [
      "wcag-1-1-1-non-text-content-level-a"
    ],
    "feedbackActionId": "feedback-missing-alt",
    "findingId": "finding-9-image-element-is-missing-the-alt-attribute",
    "frameworkIds": [
      "react-tsx-wcag-static-probe"
    ],
    "language": "typescript",
    "recommendation": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "情報を伝える画像には `alt=\"説明\"` を追加し、装飾画像には `alt=\"\"` を追加します。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Add `alt=\"description\"` for informative images, or `alt=\"\"` for decorative images.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.8.finding.fix",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Add `alt=\"description\"` for informative images, or `alt=\"\"` for decorative images."
        }
      }
    },
    "severity": "high",
    "shareActionId": "share-missing-alt",
    "sourceSnippetIds": [
      "source-9-image-element-is-missing-the-alt-attribute"
    ],
    "summary": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "素の `<img>` 要素は alt 属性を公開しないため、支援技術はファイルパスを読み上げるか、何も読み上げません。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "The bare `<img>` element exposes no alt attribute, so assistive technologies announce the file path or nothing at all.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.8.finding.summary",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The bare `<img>` element exposes no alt attribute, so assistive technologies announce the file path or nothing at all."
        }
      }
    },
    "title": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "画像要素に alt 属性がありません"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Image element is missing the alt attribute",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.8.finding.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Image element is missing the alt attribute"
        }
      }
    }
  },
  {
    "anchorId": "finding-10-element-has-positive-tabindex-focus-order",
    "audienceInterest": [
      {
        "audience": "executive",
        "weight": 72
      },
      {
        "audience": "compliance-officer",
        "weight": 94
      },
      {
        "audience": "developer",
        "weight": 100
      },
      {
        "audience": "remediator",
        "weight": 100
      }
    ],
    "classification": "accessibility",
    "contextLinks": [],
    "controlIds": [
      "wcag-2-4-3-focus-order-level-a"
    ],
    "feedbackActionId": "feedback-missing-alt",
    "findingId": "finding-10-element-has-positive-tabindex-focus-order",
    "frameworkIds": [
      "html-wcag-mechanical-probe"
    ],
    "language": "html",
    "recommendation": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "自然なタブ順序に加える場合は `tabindex=\"0\"` を使用し、プログラムによるフォーカス専用には `tabindex=\"-1\"` を使用します。望ましいタブ順序になるよう DOM 順序を並べ替えます。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Use `tabindex=\"0\"` to add to natural tab order, or `tabindex=\"-1\"` for programmatic focus only. Rearrange DOM order to achieve the desired tab sequence.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.9.finding.fix",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Use `tabindex=\"0\"` to add to natural tab order, or `tabindex=\"-1\"` for programmatic focus only. Rearrange DOM order to achieve the desired tab sequence."
        }
      }
    },
    "severity": "high",
    "shareActionId": "share-missing-alt",
    "sourceSnippetIds": [
      "source-10-element-has-positive-tabindex-focus-order"
    ],
    "summary": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "`<button tabindex=\"3\">` は予測できないフォーカス順序を作ります。正の tabindex 値は自然な DOM 順序から飛び出し、キーボード利用者を混乱させます。"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "The `<button tabindex=\"3\">` creates an unpredictable focus order — positive tabindex values jump out of natural DOM order and disorient keyboard users.",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.9.finding.summary",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "The `<button tabindex=\"3\">` creates an unpredictable focus order — positive tabindex values jump out of natural DOM order and disorient keyboard users."
        }
      }
    },
    "title": {
      "catalogDependency": {
        "explicitLocales": [],
        "lookupLocales": [
          "en-US",
          "en-GB",
          "en-CA",
          "fr-CA",
          "en-IN",
          "cy-GB",
          "gd-GB",
          "ga-GB",
          "es-US",
          "es-MX",
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "pl-PL",
          "pt-PT",
          "pt-BR",
          "ro-RO",
          "sv-SE",
          "ko-KR",
          "zh-CN",
          "ja-JP",
          "hi-IN"
        ],
        "reportFallbacks": {
          "ja-JP": "要素に正の tabindex があります（フォーカス順序）"
        },
        "sourceLocale": "en-US"
      },
      "defaultLocale": "en-US",
      "defaultText": "Element has positive tabindex (focus order)",
      "icuArgs": {},
      "msgid": "scribe.report.complianceExample.9.finding.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Element has positive tabindex (focus order)"
        }
      }
    }
  }
]
;
