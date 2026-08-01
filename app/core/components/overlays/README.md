# overlays/

Діалоги, меню, оверлеї.

**Реалізовано:** `UIDialog`, `UIScrollBox`.

Нижче — план, а не опис наявного.

| Component | Vuetify base | Що додає |
| --- | --- | --- |
| `UIConfirm` | composite (`UIDialog` + 2 кнопки) | Підтвердження через композабл, що повертає `Promise<boolean>` |
| `UIAlertDialog` | composite | Іконка info/warning/error + дії |
| `UIMenu` | `VMenu` | — |
| `UIBottomSheet` | `VBottomSheet` | Модалка, зручна на мобільному |
| `UIOverlay` | `VOverlay` | Повноекранний спінер |
