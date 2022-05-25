import { Injectable } from '@angular/core';
import * as html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  constructor() {}

  public async exportHTMLToPDF(
    selectedSize,
    pages,
    loader?: any,
    outputType = 'blob'
  ) {
    const opt = {
      margin: [0, 0],
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3 },
      jsPDF: {
        unit: 'in',
        format: selectedSize.name,
        orientation: 'landscape'
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        after: ['.html2pdf__page-break']
      }
    };
    const doc = new jsPDF(opt.jsPDF);
    const pageSize = jsPDF.getPageSize(opt.jsPDF);
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageImage = await html2pdf().from(page).set(opt).outputImg();
      loader && loader.update({ total: pages.length, current: i + 1 });
      if (i !== 0) {
        doc.addPage();
      }
      doc.addImage(
        pageImage.src,
        'jpeg',
        opt.margin[0],
        opt.margin[1],
        pageSize.width,
        pageSize.height
      );
    }
    // This can be whatever output you want. I prefer blob.
    const pdf = doc.output(outputType);
    return pdf;
  }
}
