# tables/

Таблиці даних і віртуальний скрол.

**Реалізовано:** `UITable` + `UITableGroupOpenBtn`.

Нижче — план, а не опис наявного.

| Component | Vuetify base | Що додає |
| --- | --- | --- |
| `UITableServer` | `VDataTableServer` | Серверні пагінація/сортування через TanStack Query |
| `UIVirtualTable` | `VDataTableVirtual` | Списки на тисячі рядків |
| `UIVirtualScroll` | `VVirtualScroll` | Віртуальний скрол для не-табличних списків |
| `UITableActions` | composite | Іконки-дії + підтвердження + тултип одним рядком |
