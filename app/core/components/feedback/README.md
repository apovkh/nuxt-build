# feedback/

Алерти, тости, прогрес, стани завантаження й порожнечі.

**Реалізовано:** `UIEmptyState`, `UITooltip`.

Нижче — план, а не опис наявного.

| Component | Vuetify base | Що додає |
| --- | --- | --- |
| `UIAlert` | `VAlert` | Пресети кольорів (info/success/warning/error) |
| `UISnackbar` | `VSnackbar` | Програмний виклик через композабл-нотифікатор |
| `UINotification` | composite (`VSnackbar` / overlay) | Тост із заголовком, тілом і діями; стекування |
| `UIProgressBar` | `VProgressLinear` | Determinate/indeterminate, пресети кольорів |
| `UIProgressCircular` | `VProgressCircular` | — |
| `UISkeletonLoader` | `VSkeletonLoader` | Шаблони: card, list, table |
| `UIErrorState` | composite | Для 4xx/5xx усередині компонентів (не route-level) |
