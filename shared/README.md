# web/shared/

Shared assets for the `sonde.life/`, `sonde.life/arrival`, and `daylight.sonde.life/`
teaser surfaces. Every file here is referenced by the static HTML in
`web/sonde-life/` and `web/daylight/` via relative paths, so `file://`
opens work during local review and the paths stay valid in deploy
trees once `packages/cli/src/teaser/buildTeaserHtml.ts` (see
`docs/plans/arrival-ship-it.md` M5/M6) writes the same layout into
`.sonde/staging/…/`.

## `themes/`

Verbatim mirrors of the canonical theme CSS from `packages/themes/`:

| File | Source of truth |
|---|---|
| `tokens.css` | `packages/themes/tokens.css` |
| `ultraviolet.css` | `packages/themes/ultraviolet.css` |
| `daylight.css` | `packages/themes/daylight.css` |
| `high-contrast.css` | `packages/themes/high-contrast.css` |

**`packages/themes/` is authoritative.** These copies exist so the
teaser HTML can link them with a plain relative `href` instead of
reaching out of the web tree. If the canonical file changes, this
mirror must be updated in lockstep. The existing `sites/daylight/themes/`
mirror follows the same convention and is refreshed by `pnpm day:home`;
`web/shared/themes/` should be refreshed by `buildTeaserHtml.ts` (M2).

## `themes/teaser-toggle-sonde-life.css` and `teaser-toggle-daylight.css`

Small scoped overrides that add `[data-theme="light"]`,
`[data-theme="dark"]`, and `[data-theme="high-contrast"]` explicit
toggle states on top of the canonical theme. The canonical
ultraviolet/daylight CSS only handles the **media-query** theme path
(`prefers-color-scheme`, `prefers-contrast`). The teaser surfaces need
an explicit user-facing 3-state toggle, so the override file adds the
missing selectors without forking the canonical file.

## `sondeProbe.svg`

Standalone Voyager probe silhouette SVG. Same geometry as the inline
probe group in `web/sonde-life/arrival.html` (`rotate(-40)`, matching
boom lengths, dish curve). Fills use `currentColor` so an embedding
`<img>` or `<object>` adopts the parent text color. For the teaser
HTML, the probe is still inlined so `--sonde-color-*` CSS variables
can style individual parts; this standalone file exists for OG image
generation and any future reuse that doesn't need per-part theming.
