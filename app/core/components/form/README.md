# form/

Обгортка форми, групування полів і сабміт.

**Реалізовано:** нічого.

Нижче — план, а не опис наявного.

| Component | Vuetify base | Що додає |
| --- | --- | --- |
| `UIValidation` | renderless | Передає `rules` + `model-value` через scoped slot |
| `UIForm` | `VForm` | `v-model:valid`, дефолти, submit-хендлер із prevention |
| `UIFormField` | composite | Обгортка label + hint + error для довгих форм |
| `UIFieldset` | `<fieldset>` + slots | Група пов'язаних полів із заголовком |
| `UISubmitBtn` | `UIBtn` + контекст форми | Авто-disabled, поки форма невалідна або в польоті |
