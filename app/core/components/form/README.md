# form/

Form wrapper, field grouping, and submit.

| `UIValidation` | renderless | Passes `rules` + `model-value` through a scoped slot |
| `UIForm` | `VForm` | `v-model:valid`, defaults, submit handler with prevention |
| `UIFormField` | composite | Label + hint + error wrapper for long forms |
| `UIFieldset` | `<fieldset>` + slots | Group of related fields with a heading |
| `UISubmitBtn` | `UIBtn` + form context | Auto-disabled while the form is invalid or in flight |
