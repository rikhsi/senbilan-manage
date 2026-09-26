import type { RawEditorOptions } from 'tinymce';

/** Shared TinyMCE init (assets served from `/assets/tinymce/`). */
export const APP_TINYMCE_BASE_CONFIG: RawEditorOptions = {
  base_url: '/assets/tinymce/',
  suffix: '.min',
  license_key: 'gpl',
  plugins: 'lists link autolink code table charmap wordcount help',
  toolbar:
    'undo redo | blocks | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link | removeformat code',
  branding: false,
  promotion: false,
  menubar: false,
  height: 320,
  language: 'ru',
  language_url: '/assets/tinymce-lang/ru.js',
  convert_urls: false,
  forced_root_block: 'div',
  content_style:
    'body { font-family: Inter, system-ui, sans-serif; font-size: 0.9375rem; line-height: 1.5; }',
};
