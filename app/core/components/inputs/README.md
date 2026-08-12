# inputs/

Input fields. Label, hint, counter, and error live in `UILabel` —
every wrapper renders through it, so the `<label for>` link to the input
and `aria-describedby` for the error are wired up in one place.

**Implemented:** `UILabel`, `UITextField`, `UITextarea`, `UISelect`, `UICheckbox` (+ `UICheckboxBtn`).

Below is a plan, not a description of what exists.

| Component | Vuetify base | What it adds |
| --- | --- | --- |
| `UIAutocomplete` | `VAutocomplete` | List search |
| `UIMultiSelect` | `VSelect` (multiple) | Multi-select with chips |
| `UIRadioGroup` + `UIRadio` | `VRadioGroup` + `VRadio` | — |
| `UICheckboxGroup` | composite | Checkbox group with a single `v-model` array |
| `UISwitch` | `VSwitch` | — |
| `UIFileInput` | `VFileInput` | Type/size limits, preview |
| `UINumberInput` | `VNumberInput` | Step, bounds, formatting |
