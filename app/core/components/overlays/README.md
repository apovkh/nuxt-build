# overlays/

> **Це дорожня карта, а не опис наявного.** Реалізовано в цій папці: `UIDialog`, `UIScrollBox`.
> Решта рядків таблиці — заплановане; оцінки годин лишилися з вихідного проєкту.

Dialogs, menus, tooltips, overlays. Replaces v2: `modal-window`, `dropdown`, `commonDialogController`, `warningController`.

| Component | Status | Hours | Vuetify base | Що додає |
| --- | :---: | ---: | --- | --- |
| `UIDialog` | ✓ | 0 | `VDialog` | `v-model` proxy |
| `UIConfirm` | … | 8 | composite (`UIDialog` + 2 buttons) | Заміна 99% підтверджень: `useConfirm()` повертає `Promise<boolean>` |
| `UIAlertDialog` | … | 6 | composite | Info/warning/error icon + actions |
| `UIMenu` | … | 2 | `VMenu` | — |
| `UITooltip` | … | 4 | `VTooltip` | Defaults: location/delay |
| `UIBottomSheet` | … | 2 | `VBottomSheet` | Mobile-friendly modal |
| `UIOverlay` | … | 2 | `VOverlay` | Full-screen spinner |

**Subtotal: 24 h** (0 done, 24 pending)

**Suporting:** `app/shared/composables/useConfirm.ts`, `useDialog.ts` (вже є).
