import { jsPDF } from 'jspdf';
import {
  ATTACHMENT_FIELD,
  ATTACHMENT_TEXT_PLACEHOLDER,
  isImageDataUrl,
} from '@/lib/attachment';
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

function drawScholarshipForm(
  doc: jsPDF,
  template: LetterTemplate,
  fields: Record<string, string>,
) {
  const x0 = CONTENT_LEFT;
  const x1 = CONTENT_RIGHT;
  const labelRight = 104.2;
  const colonRight = 118;
  const valueRight = 284.4;
  const gapRight = 298.2;
  const y0 = 54.4;
  const y1 = 81.4;
  const y2 = 95.8;
  const y3 = 109.6;
  const y4 = 189.2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('FORM PENGAJUAN DANA BEASISWA', PAGE_WIDTH / 2, 41, {
    align: 'center',
  });

  doc.setDrawColor(0);
  doc.setLineWidth(0.6);
  doc.rect(x0, y0, x1 - x0, y4 - y0);
  doc.line(labelRight, y0, labelRight, y4);
  doc.line(colonRight, y0, colonRight, y4);
  doc.line(valueRight, y0, valueRight, y4);
  doc.line(gapRight, y0, gapRight, y4);
  doc.line(x0, y1, gapRight, y1);
  doc.line(x0, y2, gapRight, y2);
  doc.line(x0, y3, gapRight, y3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.8);

  const labelCenter = (x0 + labelRight) / 2;
  doc.text('Nama', labelCenter, 65.2, { align: 'center' });
  doc.text('Kampus', labelCenter, 92.4, { align: 'center' });
  doc.text('Negara', labelCenter, 106.2, { align: 'center' });
  doc.text('Jenis Dana', labelCenter, 120.4, { align: 'center' });
  doc.text('Pengajuan', labelCenter, 133.8, { align: 'center' });
  doc.text('dan', labelCenter, 147.2, { align: 'center' });
  doc.text('Jumlahnya', labelCenter, 160.6, { align: 'center' });

  const name = valueOf(fields, 'nama') || '—';
  const nameWidth = valueRight - 123.6 - 3;
  let nameSize = 10.8;
  doc.setFontSize(nameSize);
  let nameLines = doc.splitTextToSize(name, nameWidth) as string[];
  while (nameLines.length > 2 && nameSize > 8) {
    nameSize -= 0.3;
    doc.setFontSize(nameSize);
    nameLines = doc.splitTextToSize(name, nameWidth) as string[];
  }
  doc.text(':', 109.9, 65.2);
  nameLines.slice(0, 2).forEach((line, index) => {
    doc.text(line, 123.6, 65.2 + index * 13.4);
  });

  doc.text(':', 109.9, 92.4);
  drawFittedText(
    doc,
    valueOf(fields, 'kampus') || '—',
    123.6,
    92.4,
    nameWidth,
  );

  doc.text(':', 109.9, 106.2);
  drawFittedText(
    doc,
    valueOf(fields, 'negara') || '—',
    123.6,
    106.2,
    nameWidth,
  );

  doc.text(':', 109.9, 120.4);
  drawFittedText(
    doc,
    valueOf(fields, 'jenisDana') || template.type,
    123.6,
    120.4,
    nameWidth,
  );

  drawFittedText(
    doc,
    valueOf(fields, 'jumlah') || template.amount,
    123.6,
    147,
    nameWidth,
  );

  const bankX = 303.3;
  const bankWidth = x1 - bankX - 4;
  const bankRows: [string, string][] = [
    ['Nama Bank', valueOf(fields, 'namaBank')],
    ['Nama Account', valueOf(fields, 'namaAccount')],
    ['Nomor Rekening', valueOf(fields, 'nomorRekening')],
    ['BIC / Swift Code', valueOf(fields, 'bicSwift')],
    ['IBAN / ABA / BSB', valueOf(fields, 'iban')],
  ];

  bankRows.forEach(([label, value], index) => {
    const line = value ? `${label} : ${value}` : `${label} :`;
    drawFittedText(doc, line, bankX, 65.2 + index * 13.4, bankWidth);
  });
}

async function generateScholarshipPdf(
  template: LetterTemplate,
  fields: Record<string, string>,
  filename?: string,
) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const documents = template.documents ?? [];

  drawScholarshipForm(doc, template, fields);
  drawAttachmentBorder(doc, 189.2);

  const images = await Promise.all(
    documents.map((document) => loadAttachment(fields[document.key])),
  );

  documents.forEach((document, index) => {
    const image = images[index];
    if (!image && document.required === false) return;

    if (index === 0) {
      drawSectionHeading(doc, document.label, index, document.numbered !== false, 205.2);
      if (image) {
        drawContainedImage(
          doc,
          fields[document.key],
          image,
          221,
          500,
          550,
        );
      }
      return;
    }

    doc.addPage();
    drawAttachmentBorder(doc, 27);
    drawSectionHeading(doc, document.label, index, document.numbered !== false, 55);
    if (image) {
      drawContainedImage(
        doc,
        fields[document.key],
        image,
        72,
        500,
        696,
      );
    }
  });

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
      `Dokumen ini diterbitkan melalui Layanan Surat LPDP UI — Halaman ${i}/${pageCount}`,
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
  if (template.documents?.length) {
    await generateScholarshipPdf(template, fields, filename);
    return;
  }
  await generateTextPdf(template, fields, filename);
}
