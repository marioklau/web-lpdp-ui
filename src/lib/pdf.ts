import { jsPDF } from 'jspdf';
import {
  ATTACHMENT_FIELD,
  ATTACHMENT_TEXT_PLACEHOLDER,
  isImageDataUrl,
} from '@/lib/attachment';
import {
  DEFAULT_FORM_TITLE,
  groupTemplateFields,
  resolveTemplateFields,
  resolveTemplateFormat,
} from '@/lib/letterTemplate';
import type { LetterTemplate } from '@/types';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const CONTENT_LEFT = 35.7;
const CONTENT_RIGHT = 572.4;

export function renderTemplate(
  template: LetterTemplate,
  fields: Record<string, string>,
): string {
  return template.bodyTemplate.replace(/{{\s*(\w+)\s*}}/g, (_, key: string) => {
    const value = fields[key]?.trim();
    if (!value) return '—';
    return isImageDataUrl(value) ? ATTACHMENT_TEXT_PLACEHOLDER : value;
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Gambar lampiran tidak dapat dibuka.'));
    image.src = src;
  });
}

async function loadAttachment(
  value: string | undefined,
): Promise<HTMLImageElement | null> {
  if (!isImageDataUrl(value)) return null;
  try {
    return await loadImageElement(value as string);
  } catch {
    return null;
  }
}

function valueOf(fields: Record<string, string>, key: string): string {
  return fields[key]?.trim() ?? '';
}

function fitFontSize(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  initialSize = 10.8,
  minSize = 7.2,
): number {
  let size = initialSize;
  doc.setFontSize(size);
  while (size > minSize && doc.getTextWidth(text) > maxWidth) {
    size = Math.max(minSize, size - 0.25);
    doc.setFontSize(size);
  }
  return size;
}

function drawFittedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  initialSize = 10.8,
  minSize = 7.2,
) {
  fitFontSize(doc, text, maxWidth, initialSize, minSize);
  doc.text(text, x, y);
}

function drawSectionHeading(
  doc: jsPDF,
  label: string,
  index: number,
  numbered: boolean,
  y: number,
) {
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  if (numbered) {
    doc.setFontSize(10.8);
    doc.text(`${index + 1}.`, 54, y);
    drawFittedText(doc, label, 72, y, CONTENT_RIGHT - 76, 10.8, 7.2);
  } else {
    drawFittedText(doc, label, 72, y, CONTENT_RIGHT - 76, 10.8, 7.2);
  }
}

function drawAttachmentBorder(doc: jsPDF, top: number) {
  doc.setDrawColor(0);
  doc.setLineWidth(0.75);
  doc.rect(
    CONTENT_LEFT,
    top,
    CONTENT_RIGHT - CONTENT_LEFT,
    PAGE_HEIGHT - 14 - top,
  );
}

function drawContainedImage(
  doc: jsPDF,
  dataUrl: string,
  image: HTMLImageElement,
  top: number,
  maxWidth: number,
  maxHeight: number,
): number {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) return 0;

  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = (PAGE_WIDTH - width) / 2;
  const format = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';

  doc.addImage(dataUrl, format, x, top, width, height);
  return height;
}

function drawFormTitle(doc: jsPDF, title: string) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(title, PAGE_WIDTH / 2, 41, { align: 'center' });
}

function drawScholarshipForm(
  doc: jsPDF,
  template: LetterTemplate,
  fields: Record<string, string>,
): number {
  const x0 = CONTENT_LEFT;
  const x1 = CONTENT_RIGHT;
  const labelWidth = 150;
  const padding = 7;
  const valueWidth = x1 - x0 - labelWidth - padding * 2;
  const title = template.formTitle?.trim() || DEFAULT_FORM_TITLE;
  const groups = groupTemplateFields(resolveTemplateFields(template));
  const bottomLimit = PAGE_HEIGHT - 60;

  drawFormTitle(doc, title);
  let y = 54.4;

  const startNewPage = () => {
    doc.addPage();
    drawFormTitle(doc, title);
    y = 54.4;
  };

  groups.forEach((group) => {
    const headerHeight = 18;
    if (y + headerHeight > bottomLimit) startNewPage();

    doc.setFillColor(238, 242, 251);
    doc.rect(x0, y, x1 - x0, headerHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(31, 58, 138);
    doc.text(group.name.toUpperCase(), x0 + padding, y + 12.5);
    y += headerHeight;

    group.fields.forEach((field) => {
      const value = valueOf(fields, field.key) || '—';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.2);
      const labelLines = doc.splitTextToSize(
        field.label,
        labelWidth - padding * 2,
      ) as string[];
      doc.setFont('helvetica', 'normal');
      const valueLines = doc.splitTextToSize(value, valueWidth) as string[];
      const rowHeight =
        Math.max(labelLines.length, valueLines.length) * 12 + 10;

      if (y + rowHeight > bottomLimit) startNewPage();

      doc.setDrawColor(0);
      doc.setLineWidth(0.6);
      doc.rect(x0, y, x1 - x0, rowHeight);
      doc.line(x0 + labelWidth, y, x0 + labelWidth, y + rowHeight);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.2);
      doc.setTextColor(0);
      labelLines.forEach((line, index) => {
        doc.text(line, x0 + padding, y + 15 + index * 12);
      });

      doc.setFont('helvetica', 'normal');
      valueLines.forEach((line, index) => {
        doc.text(line, x0 + labelWidth + padding, y + 15 + index * 12);
      });

      y += rowHeight;
    });
  });

  const note = template.formNote?.trim();
  if (note) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(70);
    const noteLines = doc.splitTextToSize(note, x1 - x0) as string[];
    if (y + 12 + noteLines.length * 12 > bottomLimit) startNewPage();
    y += 14;
    noteLines.forEach((line) => {
      doc.text(line, x0, y);
      y += 12;
    });
    doc.setTextColor(0);
  }

  return y;
}

async function generateScholarshipPdf(
  template: LetterTemplate,
  fields: Record<string, string>,
  filename?: string,
) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const documents = template.documents ?? [];
  const formBottom = drawScholarshipForm(doc, template, fields);
  const images = await Promise.all(
    documents.map((document) => loadAttachment(fields[document.key])),
  );
  const entries = documents
    .map((document, index) => ({ document, index, image: images[index] }))
    .filter((entry) => entry.image || entry.document.required !== false);

  if (entries.length) {
    let attachmentTop = formBottom + 12;
    if (attachmentTop > PAGE_HEIGHT - 280) {
      doc.addPage();
      drawFormTitle(doc, template.formTitle?.trim() || DEFAULT_FORM_TITLE);
      attachmentTop = 54;
    }

    drawAttachmentBorder(doc, attachmentTop);
    let firstEntry = true;

    entries.forEach(({ document, index, image }) => {
      if (!firstEntry) {
        doc.addPage();
        drawAttachmentBorder(doc, 27);
      }

      const headingY = firstEntry ? attachmentTop + 18 : 55;
      const imageTop = firstEntry ? attachmentTop + 36 : 72;
      const maxImageHeight = PAGE_HEIGHT - 14 - imageTop - 10;

      drawSectionHeading(
        doc,
        document.label,
        index,
        document.numbered !== false,
        headingY,
      );
      if (image) {
        drawContainedImage(
          doc,
          fields[document.key],
          image,
          imageTop,
          500,
          maxImageHeight,
        );
      }

      firstEntry = false;
    });
  }

  doc.save(filename || `surat-${template.id}.pdf`);
}

async function generateTextPdf(
  template: LetterTemplate,
  fields: Record<string, string>,
  filename?: string,
) {
  const attachment = fields[ATTACHMENT_FIELD];
  const hasAttachment = isImageDataUrl(attachment);
  const attachmentImage = hasAttachment
    ? await loadAttachment(attachment)
    : null;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let text = renderTemplate(template, fields);

  if (hasAttachment) {
    text = text.replace(
      ATTACHMENT_TEXT_PLACEHOLDER,
      'Terlampir (lihat gambar di bawah).',
    );
  }

  const marginX = 56;
  const marginTop = 56;
  const marginBottom = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - marginX * 2;
  const lineHeight = 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    if (paragraph.trim() === '') {
      lines.push('');
      continue;
    }
    const wrapped = doc.splitTextToSize(paragraph, maxWidth) as string[];
    lines.push(...wrapped);
  }

  let cursorY = marginTop;
  for (const line of lines) {
    if (cursorY > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
    }
    if (line) doc.text(line, marginX, cursorY);
    cursorY += lineHeight;
  }

  if (attachmentImage) {
    if (cursorY + 140 > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
    } else {
      cursorY += 16;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Lampiran Dokumen Pendukung', marginX, cursorY);
    cursorY += 16;
    doc.setFont('helvetica', 'normal');

    const sourceWidth =
      attachmentImage.naturalWidth || attachmentImage.width;
    const sourceHeight =
      attachmentImage.naturalHeight || attachmentImage.height;
    if (sourceWidth && sourceHeight) {
      const scale = Math.min(
        maxWidth / sourceWidth,
        (pageHeight - marginBottom - cursorY) / sourceHeight,
      );
      const imageFormat = attachment.startsWith('data:image/png')
        ? 'PNG'
        : 'JPEG';
      doc.addImage(
        attachment,
        imageFormat,
        marginX,
        cursorY,
        sourceWidth * scale,
        sourceHeight * scale,
      );
    }
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Dokumen ini diterbitkan melalui Layanan Pengajuan Dana LPDP UI — Halaman ${i}/${pageCount}`,
      pageWidth / 2,
      pageHeight - 24,
      { align: 'center' },
    );
    doc.setTextColor(0);
  }

  doc.save(filename || `surat-${template.id}.pdf`);
}

export async function generateLetterPdf(
  template: LetterTemplate,
  fields: Record<string, string>,
  filename?: string,
): Promise<void> {
  if (resolveTemplateFormat(template) === 'form') {
    await generateScholarshipPdf(template, fields, filename);
    return;
  }
  await generateTextPdf(template, fields, filename);
}
