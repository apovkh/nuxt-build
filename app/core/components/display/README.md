# display/

> **Це дорожня карта, а не опис наявного.** Реалізовано в цій папці: нічого (UIIcon живе в core/UIIcon).
> Решта рядків таблиці — заплановане; оцінки годин лишилися з вихідного проєкту.

Display elements: chips, badges, avatars, lists, icons.

| Component | Status | Hours | Vuetify base | Що додає |
| --- | :---: | ---: | --- | --- |
| `UIChip` | … | 2 | `VChip` | Tags у bank/admin |
| `UIBadge` | … | 2 | `VBadge` | Counter badges |
| `UIAvatar` | … | 2 | `VAvatar` | User avatar |
| `UIImage` | … | 2 | `NuxtImg` | `<img>` з lazy + fallback |
| `UIList` + `UIListItem` | … | 4 | `VList` + `VListItem` | `<ul>` для menu/filter lists |
| `UIIcon` | … | 2 | `NuxtIcon` (rename з `Icon`) | Той самий A*-патерн; `<AIcon name="..." />` |

**Subtotal: 14 h** (0 done, 14 pending)

**Migration note:** `UIIcon` замінює поточний `Icon` (з окремої папки `Icons/`). Після додавання — оновити `nuxt.config.ts` (прибрати `path: '~/shared/ui/Icons', prefix: 'Icon'` блок) і grep+replace всі `<Icon name="..." />` → `<AIcon name="..." />`.
