/**
 * Stable re-export of Angular Signal Forms (`@angular/forms/signals`).
 *
 * Prefer these imports from `@senbilan/shared/ng` in features so call sites
 * stay consistent if the experimental package path changes.
 *
 * Fallback: if Signal Forms become unavailable or break typecheck, use
 * Reactive Forms (`FormBuilder` / `ReactiveFormsModule`) as on older screens.
 */
export {
  disabled,
  email,
  form,
  FormField,
  FormRoot,
  required,
  submit,
  type FieldTree,
} from '@angular/forms/signals';
