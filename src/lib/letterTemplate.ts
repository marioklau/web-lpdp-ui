import { ATTACHMENT_FIELD } from '@/lib/attachment';
import type { LetterFormField, LetterTemplate } from '@/types';

export const DEFAULT_FIELD_GROUP = 'Data Pemohon';
export const DEFAULT_FORM_TITLE = 'FORM PENGAJUAN DANA BEASISWA';

export const FIELD_LABELS: Record<string, string> = {
  nama: 'Nama',
  namaBank: 'Nama Bank',
  namaAccount: 'Nama Account',
  nomorRekening: 'Nomor Rekening',
  bicSwift: 'BIC / Swift Code',
  iban: 'IBAN / ABA / BSB',
  kampus: 'Kampus',
  negara: 'Negara',
  jenisDana: 'Jenis Dana Pengajuan',
  jumlah: 'Jumlah',
  tanggal: 'Tanggal',
  keperluan: 'Keperluan',
};

export const PRIMARY_FIELD_KEYS = ['nama', 'kampus', 'negara', 'jenisDana', 'jumlah'];
export const BANK_FIELD_KEYS = [
  'namaBank',
  'namaAccount',
  'nomorRekening',
  'bicSwift',
  'iban',
];
export const OPTIONAL_FIELD_KEYS = new Set([
  'tanggal',
  'bicSwift',
  'iban',
  ATTACHMENT_FIELD,
]);

const AUTO_DEFAULTS: Record<string, string> = {
  jenisDana: '{{type}}',
  jumlah: '{{amount}}',
};

export function humanizeFieldKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

export function slugFieldKey(label: string, existing: string[] = []): string {
  const base =
    label
      .normalize('NFKD')
      .replace(/[^\w\s]/g, '')
      .trim()
      .split(/\s+/)
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join('') || 'field';

  let key = base.replace(/^\d+/, '');
  if (!key) key = 'field';
  let candidate = key;
  let counter = 2;
  while (existing.includes(candidate)) {
    candidate = `${key}${counter}`;
    counter += 1;
  }
  return candidate;
}

export function extractPlaceholders(bodyTemplate: string): string[] {
  const matches = [...bodyTemplate.matchAll(/{{\s*(\w+)\s*}}/g)];
  return [...new Set(matches.map((match) => match[1]))];
}

export function resolveTemplateFormat(
  template: LetterTemplate,
): 'form' | 'text' {
  if (template.format) return template.format;
  if (template.documents?.length || template.fields?.length) return 'form';
  return 'text';
}

export function resolveFieldDefault(
  field: LetterFormField,
  template: LetterTemplate,
): string {
  if (field.defaultValue !== undefined) {
    return field.defaultValue
      .replace(/{{\s*type\s*}}/g, template.type)
      .replace(/{{\s*amount\s*}}/g, template.amount);
  }
  if (field.key === 'jenisDana') return template.type;
  if (field.key === 'jumlah') return template.amount;
  return '';
}

export function deriveFields(template: LetterTemplate): LetterFormField[] {
  const documentKeys = new Set(
    (template.documents ?? []).map((document) => document.key),
  );
  return extractPlaceholders(template.bodyTemplate)
    .filter((key) => !documentKeys.has(key) && key !== ATTACHMENT_FIELD)
    .map((key) => {
      const readOnly = key === 'jenisDana' || key === 'jumlah';
      const group = BANK_FIELD_KEYS.includes(key)
        ? 'Data Bank'
        : PRIMARY_FIELD_KEYS.includes(key)
          ? DEFAULT_FIELD_GROUP
          : 'Lainnya';

      return {
        key,
        label: FIELD_LABELS[key] ?? humanizeFieldKey(key),
        group,
        type: key === 'keperluan' ? 'textarea' : 'text',
        required: !OPTIONAL_FIELD_KEYS.has(key),
        readOnly,
        defaultValue: AUTO_DEFAULTS[key],
      } satisfies LetterFormField;
    });
}

export function resolveTemplateFields(
  template: LetterTemplate,
): LetterFormField[] {
  if (template.fields?.length) return template.fields;
  return deriveFields(template);
}

export function groupTemplateFields(
  fields: LetterFormField[],
): { name: string; fields: LetterFormField[] }[] {
  const groups: { name: string; fields: LetterFormField[] }[] = [];
  fields.forEach((field) => {
    const name = field.group?.trim() || DEFAULT_FIELD_GROUP;
    const last = groups[groups.length - 1];
    if (last && last.name === name) {
      last.fields.push(field);
    } else {
      groups.push({ name, fields: [field] });
    }
  });
  return groups;
}

export function buildFormBody(
  template: LetterTemplate,
  fields: LetterFormField[] = resolveTemplateFields(template),
): string {
  const lines = [
    template.formTitle?.trim() || DEFAULT_FORM_TITLE,
    '',
    ...fields.map((field) => `${field.label} : {{${field.key}}}`),
  ];
  const documents = template.documents ?? [];

  if (documents.length) {
    lines.push('', 'Dokumen Pendukung:');
    documents.forEach((document, index) => {
      lines.push(
        document.numbered === false
          ? document.label
          : `${index + 1}. ${document.label}`,
      );
      lines.push(`{{${document.key}}}`);
      lines.push('');
    });
  }

  return lines.join('\n').trimEnd();
}
