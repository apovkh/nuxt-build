# feedback/

> **Це дорожня карта, а не опис наявного.** Реалізовано в цій папці: `UIEmptyState`, `UITooltip`.
> Решта рядків таблиці — заплановане; оцінки годин лишилися з вихідного проєкту.

Alerts, toasts, progress, loading, empty/error states. Replaces v2: `alert`, `dismissOnTimeout`, `progressbar`, `progress`, hand-rolled spinners.

| Component | Status | Hours | Vuetify base | Що додає |
| --- | :---: | ---: | --- | --- |
| `UIAlert` | … | 4 | `VAlert` | Color presets (info/success/warning/error) |
| `UISnackbar` | … | 4 | `VSnackbar` | Programmatic via `useNotify()` |
| `UINotification` | … | 6 | composite (`VSnackbar` / overlay) | Rich toast: title + body + actions, stacking |
| `UIProgressBar` | … | 2 | `VProgressLinear` | Determinate/indeterminate, color presets |
| `UIProgressCircular` | … | 2 | `VProgressCircular` | — |
| `UISkeletonLoader` | … | 4 | `VSkeletonLoader` | Шаблони: card, list, table |
| `UIEmptyState` | … | 4 | composite | Icon + title + description + action slot |
| `UIErrorState` | … | 4 | composite | Для 4xx/5xx у компонентах (не route-level) |

**Subtotal: 30 h** (0 done, 30 pending)

**Suporting:** `app/shared/composables/useNotify.ts` (вже є).
