import { type IconNode } from 'lucide';

/**
 * An icon is either a Lucide `IconNode` (tree-shakeable, preferred) or a raw
 * SVG markup string for custom brand icons. Custom SVGs must be 24×24,
 * stroke 2, `currentColor` and come from the design team.
 */
export type IconDefinition = IconNode | string;

export type IconMap = Readonly<Record<string, IconDefinition>>;

export const ICON_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type IconSize = (typeof ICON_SIZES)[number];

const SVG_ATTRIBUTES: Readonly<Record<string, string>> = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
};

export const isIconNode = (definition: IconDefinition): definition is IconNode =>
  Array.isArray(definition);

const escapeAttribute = (value: string | number): string =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Serialises an IconNode to an SVG string (used for Taiga's registry and CSS masks). */
export const iconNodeToSvg = (
  node: IconNode,
  extraAttributes: Record<string, string> = {},
): string => {
  const attributes = { ...SVG_ATTRIBUTES, ...extraAttributes };
  const open = Object.entries(attributes)
    .map(([key, value]) => `${key}="${escapeAttribute(value)}"`)
    .join(' ');
  const children = node
    .map(([tag, attrs]) => {
      const inner = Object.entries(attrs)
        .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
        .map(([key, value]) => `${key}="${escapeAttribute(value)}"`)
        .join(' ');
      return `<${tag} ${inner}/>`;
    })
    .join('');
  return `<svg ${open}>${children}</svg>`;
};

export const iconToSvg = (definition: IconDefinition): string =>
  isIconNode(definition) ? iconNodeToSvg(definition) : definition;

export const svgToDataUri = (svg: string): string =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
