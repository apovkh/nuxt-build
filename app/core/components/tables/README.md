# tables/

> **Це дорожня карта, а не опис наявного.** Реалізовано в цій папці: `UITable` + `UITableGroupOpenBtn`.
> Решта рядків таблиці — заплановане; оцінки годин лишилися з вихідного проєкту.

Data tables та virtual scroll. Replaces v2: `ui-grid` (1 директива з 14+ subcomponents — найбільший shift).

| Component | Status | Hours | Vuetify base | Що додає |
| --- | :---: | ---: | --- | --- |
| `UITable` | … | 8 | `VDataTable` | Defaults: pagination, sticky header; `headers` мапер з `{key, title}` |
| `UITableServer` | … | 16 | `VDataTableServer` | TanStack Query інтеграція через `useExamsQuery()`-like pattern |
| `AVirtualTable` | … | 8 | `VDataTableVirtual` | Для admin-екранів з тисячами записів |
| `AVirtualScroll` | … | 4 | `VVirtualScroll` | Generic scroll для не-табличних списків (replaces `whenScrolled`) |
| `ATableActions` | … | 4 | composite | Іконки + confirm + tooltip — щоб не дублювати у кожній таблиці |

**Subtotal: 40 h** (0 done, 40 pending)
