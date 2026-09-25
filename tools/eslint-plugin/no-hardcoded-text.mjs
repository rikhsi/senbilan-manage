/**
 * Custom ESLint plugin `@senbilan`:
 * - `no-hardcoded-text` (templates): Text nodes with letters
 * - `no-hardcoded-text` (TS): string / template literals that look like UI copy
 *
 * Escape hatch (any file):
 *   // eslint-disable-next-line @senbilan/no-hardcoded-text -- intentional
 * Templates:
 *   <!-- eslint-disable-next-line @senbilan/no-hardcoded-text -->
 *
 * Severity is `warn` in eslint.config.mjs so CI can tighten later.
 */
import { createRequire } from 'node:module';
import { ESLintUtils } from '@typescript-eslint/utils';

const require = createRequire(import.meta.url);
const {
  createESLintRule,
} = require('@angular-eslint/eslint-plugin-template/dist/utils/create-eslint-rule.js');

/** Letters that imply user-facing copy (Latin + Cyrillic incl. Uzbek extensions). */
export const LETTER_RE = /[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]/;

/** Require 2+ letters so single-glyph brand marks (e.g. "S") are allowed. */
export const HARDCODED_COPY_RE =
  /[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ].*[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]|[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]{2,}/;

/** i18n key / identifier-ish: `users.create`, `auth.login.title` */
const I18N_KEY_RE = /^[a-z][a-z0-9_-]*(\.[a-z0-9_-]+)+$/i;

/** Paths, URLs, CSS units, emails, technical tokens */
const TECHNICAL_RE =
  /^(https?:\/\/|\/|\.\/|\.\.\/|[a-z-]+:\/\/)|@|\\|[.#][a-z]|^\d+(\.\d+)?(px|rem|em|%|ms|s)$/i;

export const RULE_NAME = 'no-hardcoded-text';

export const looksLikeUserFacing = (raw) => {
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!text || text.length < 2) {
    return false;
  }
  if (!LETTER_RE.test(text)) {
    return false;
  }
  if (I18N_KEY_RE.test(text) || TECHNICAL_RE.test(text)) {
    return false;
  }
  // Angular selectors / BEM-ish tokens: `auth-login-page`, `users-page__title`
  if (/^[a-z][a-z0-9_-]*$/i.test(text) && !/\s/.test(text)) {
    return false;
  }
  // Prefer phrases with whitespace or punctuation over single identifiers.
  if (!/[\s,.!?;:'"«»—–-]/.test(text) && text.length < 24 && !/\s/.test(text)) {
    // Single camelCase / PascalCase tokens are usually identifiers.
    if (/^[A-Za-z_$][\w$]*$/.test(text)) {
      return false;
    }
  }
  return true;
};

const templateRule = createESLintRule({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded text nodes with letters; use Transloco / t() instead.',
    },
    schema: [],
    messages: {
      hardcoded:
        'Hardcoded template text "{{text}}". Use Transloco (`{{ \'key\' | transloco }}`) or a `t()` binding. Escape: <!-- eslint-disable-next-line @senbilan/no-hardcoded-text -->',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      Text(node) {
        const value = typeof node.value === 'string' ? node.value : '';
        const trimmed = value.trim();
        if (!trimmed || !HARDCODED_COPY_RE.test(trimmed)) {
          return;
        }
        context.report({
          node,
          messageId: 'hardcoded',
          data: { text: trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed },
        });
      },
    };
  },
});

const createTsRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/senbilan/senbilan-manage/blob/main/docs/I18N.md',
);

const tsRule = createTsRule({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow user-facing string literals in UI TypeScript; use Transloco keys.',
    },
    schema: [],
    messages: {
      hardcoded:
        'Hardcoded UI string "{{text}}". Prefer Transloco keys. Escape: // eslint-disable-next-line @senbilan/no-hardcoded-text',
    },
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename.replace(/\\/g, '/');
    if (
      filename.includes('.spec.') ||
      filename.includes('.stories.') ||
      filename.includes('/testing/') ||
      filename.includes('/mock/')
    ) {
      return {};
    }

    const check = (node, value) => {
      if (!looksLikeUserFacing(value)) {
        return;
      }
      const trimmed = value.trim();
      context.report({
        node,
        messageId: 'hardcoded',
        data: { text: trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed },
      });
    };

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          check(node, node.value);
        }
      },
      TemplateLiteral(node) {
        if (node.expressions.length > 0) {
          return;
        }
        const raw = node.quasis.map((q) => q.value.cooked ?? '').join('');
        check(node, raw);
      },
    };
  },
});

/** Flat-config plugin export. Same rule name; ESLint picks the right AST by file type. */
const plugin = {
  meta: { name: '@senbilan/eslint-plugin', version: '0.1.0' },
  rules: {
    [RULE_NAME]: templateRule,
    [`${RULE_NAME}-ts`]: tsRule,
  },
};

export default plugin;
