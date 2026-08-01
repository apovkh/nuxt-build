# inputs/

Поля вводу. Підпис, підказка, лічильник і помилка живуть в `UILabel` —
через нього рендеряться всі обгортки, тож зв'язок `<label for>` з інпутом
і `aria-describedby` для помилки збираються в одному місці.

**Реалізовано:** `UILabel`, `UITextField`, `UITextarea`, `UISelect`, `UICheckbox` (+ `UICheckboxBtn`).

Нижче — план, а не опис наявного.

| Component | Vuetify base | Що додає |
| --- | --- | --- |
| `UIAutocomplete` | `VAutocomplete` | Пошук по списку |
| `UIMultiSelect` | `VSelect` (multiple) | Мультивибір із чіпами |
| `UIRadioGroup` + `UIRadio` | `VRadioGroup` + `VRadio` | — |
| `UICheckboxGroup` | composite | Група чекбоксів з одним `v-model`-масивом |
| `UISwitch` | `VSwitch` | — |
| `UIFileInput` | `VFileInput` | Обмеження типу/розміру, прев'ю |
| `UINumberInput` | `VNumberInput` | Крок, межі, форматування |
