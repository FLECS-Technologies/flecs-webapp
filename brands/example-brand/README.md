# Example Brand

This folder is a developer preview of the white-label runtime contract.

The webapp expects these runtime files at the web root:

```txt
/config.json
/theme.css
/logo.svg
/favicon.ico
```

## config.json

```json
{
  "vendor_id": 95,
  "app_title": "Example Manager",
  "company_name": "Example Brand",
  "branding": {
    "show_app_title": true
  },
  "features": {
    "powered_by_flecs": true
  }
}
```

- `vendor_id`: OEM/vendor identifier used by marketplace scoping. `0` means the default FLECS build.
- `app_title`: browser title and shell title when `branding.show_app_title` is enabled.
- `company_name`: brand/company label for future copy and legal surfaces.
- `branding.show_app_title`: set to `false` when `logo.svg` already contains the company/product name.
- `features.powered_by_flecs`: shows the small powered-by badge.

## theme.css

```css
:root {
  --brand-primary: #0d9488;
  --brand-bg-light: #f7faf9;
  --brand-bg-dark: #071312;
  --brand-font: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

`--brand-bg-light` and `--brand-bg-dark` should be contrast-checked before a branded
image is shipped. The app provides accessible defaults, but customer brand packages
should provide deliberate light and dark backgrounds when possible.

Optional logo sizing overrides:

```css
:root {
  --brand-logo-sidebar-max-width: 160px;
  --brand-logo-sidebar-max-height: 32px;
  --brand-logo-mobile-max-width: 152px;
  --brand-logo-mobile-max-height: 28px;
}
```

Most brands should not need these overrides. They exist for unusually wide wordmarks.
