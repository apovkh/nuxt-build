# form/

> **Це дорожня карта, а не опис наявного.** Реалізовано в цій папці: нічого.
> Решта рядків таблиці — заплановане; оцінки годин лишилися з вихідного проєкту.

| `UIValidation` | ✓ | 0 | renderless | Передає `rules` + `model-value` через scoped slot |
| `UIForm` | … | 12 | `VForm` | `v-model:valid`, defaults, submit handler з prevention |
| `UIFormField` | … | 6 | composite | Label + hint + error wrapper для масових форм адмінки |
| `UIFieldset` | … | 2 | `<fieldset>` + slots | Group of related fields with title |
| `UISubmitBtn` | … | 2 | `UIBtn` + form ctx | Auto-disabled while invalid/loading |
