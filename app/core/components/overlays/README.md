# overlays/

Dialogs, menus, overlays.

**Implemented:** `UIDialog`, `UIScrollBox`.

| `UIConfirm` | composite (`UIDialog` + 2 buttons) | Confirmation via a composable that returns `Promise<boolean>` |
| `UIAlertDialog` | composite | info/warning/error icon + actions |
| `UIMenu` | `VMenu` | — |
| `UIBottomSheet` | `VBottomSheet` | Mobile-friendly modal |
| `UIOverlay` | `VOverlay` | Full-screen spinner |
