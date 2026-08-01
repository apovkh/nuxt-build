# navigation/

> **Це дорожня карта, а не опис наявного.** Реалізовано в цій папці: `UITabs` + `UITabItem`.
> Решта рядків таблиці — заплановане; оцінки годин лишилися з вихідного проєкту.

Tabs, breadcrumbs, pagination, drawer, stepper, treeview. Replaces v2: `tabset`, `tab`, `pagination`, `pager`, sidebar HTML.

| Component | Status | Hours | Vuetify base | Що додає |
| --- | :---: | ---: | --- | --- |
| `UITabs` + `UITab` | … | 4 | `VTabs` + `VTab` | `v-model` через name/index |
| `UIBreadcrumbs` | … | 4 | `VBreadcrumbs` | Items з `{label, to}` |
| `UIPagination` | … | 4 | `VPagination` | — |
| `UINavDrawer` | … | 4 | `VNavigationDrawer` | З layouts |
| `UIAppBar` | … | 6 | `VAppBar` | Top header з layouts |
| `UIStepper` | … | 6 | `VStepper` | Wizard у workflow / exam-creation |
| `UITreeview` | … | 8 | `VTreeview` | Bank-categories tree |

**Subtotal: 36 h** (0 done, 36 pending)
