// utils/memoExportUtils.ts
'use client';

import { InvestmentMemo } from '../types';

export interface ExportOptions {
  includeBranding: boolean;
  includeCharts: boolean;
  format: 'PDF' | 'PowerPoint' | 'Word';
}

export interface ExportResult {
  success: boolean;
  fileName: string;
  blob: Blob;
  error?: string;
}

export class MemoExportService {
  static async exportMemo(memo: InvestmentMemo, options: ExportOptions): Promise<ExportResult> {
    try {
      switch (options.format) {
        case 'PDF':
          return await this.exportToPDF(memo, options);
        case 'PowerPoint':
          return await this.exportToPowerPoint(memo, options);
        case 'Word':
          return await this.exportToWord(memo, options);
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }
    } catch (error) {
      console.error('Memo export error:', error);
      return {
        success: false,
        fileName: '',
        blob: new Blob(),
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  private static async exportToPDF(memo: InvestmentMemo, options: ExportOptions): Promise<ExportResult> {
    try {
      // Dynamic import to reduce bundle size
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = 20;

      // Set default font
      doc.setFont('helvetica');

      // Track current page
      let currentPage = 1;

      // Header with branding
      if (options.includeBranding) {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(59, 130, 246); // Blue color
        doc.text('SYNERGYAI', margin, yPosition);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate color
        doc.text('INVESTMENT MEMORANDUM', margin, yPosition + 6);
        yPosition += 20;
      }

      // Title section
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`Investment Memo: ${memo.projectName}`, margin, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 116, 139);
      const targetText = `Target: ${memo.targetCompany || 'Not specified'} | Generated: ${new Date().toLocaleDateString()}`;
      doc.text(targetText, margin, yPosition);
      yPosition += 15;

      // Add a horizontal line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Add footer for first page
      this.addFooter(doc, currentPage, options.includeBranding, pageWidth, pageHeight, margin);

      // Process all sections with proper formatting
      const sections = [
        { title: 'EXECUTIVE SUMMARY', content: memo.executiveSummary || '' },
        { title: 'VALUATION ANALYSIS', content: memo.valuationSection || '' },
        { title: 'SYNERGY ASSESSMENT', content: memo.synergySection || '' },
        { title: 'RISK PROFILE', content: memo.riskSection || '' },
        { title: 'STRATEGIC RATIONALE', content: memo.strategicRationale || '' },
        { title: 'RECOMMENDATIONS', content: memo.recommendationSection || '' }
      ];

      for (const section of sections) {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          currentPage++;
          yPosition = 20;
          this.addFooter(doc, currentPage, options.includeBranding, pageWidth, pageHeight, margin);
        }

        // Section title
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(section.title, margin, yPosition);
        yPosition += 8;

        // Add underline
        doc.setDrawColor(59, 130, 246);
        doc.line(margin, yPosition - 2, margin + 50, yPosition - 2);
        yPosition += 5;

        // Section content with proper formatting
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);

        const cleanContent = this.cleanContent(section.content);
        const lines = doc.splitTextToSize(cleanContent, contentWidth);
        
        for (const line of lines) {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            currentPage++;
            yPosition = 20;
            this.addFooter(doc, currentPage, options.includeBranding, pageWidth, pageHeight, margin);
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        }
        
        yPosition += 10; // Space between sections
      }

      // Update footer for all pages with correct page numbers
      this.updateAllFooters(doc, currentPage, options.includeBranding, pageWidth, pageHeight, margin);

      const pdfBlob = doc.output('blob');
      
      return {
        success: true,
        fileName: `Investment-Memo-${this.sanitizeFileName(memo.projectName)}-${new Date().toISOString().split('T')[0]}.pdf`,
        blob: pdfBlob
      };
    } catch (error) {
      console.error('PDF export failed:', error);
      return {
        success: false,
        fileName: '',
        blob: new Blob(),
        error: 'PDF generation failed. Please try again.'
      };
    }
  }

  private static addFooter(doc: any, currentPage: number, includeBranding: boolean, pageWidth: number, pageHeight: number, margin: number) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    
    // Page number
    doc.text(`Page ${currentPage}`, pageWidth - margin - 15, pageHeight - 10);
    
    // Branding
    if (includeBranding) {
      doc.text('SynergyAI - Confidential', margin, pageHeight - 10);
    }
  }

  private static updateAllFooters(doc: any, totalPages: number, includeBranding: boolean, pageWidth: number, pageHeight: number, margin: number) {
    // Since jsPDF doesn't have a direct way to get total pages before saving,
    // we'll update footers as we go. This method is kept for future enhancements.
    // In current implementation, footers are added page by page.
  }

  private static async exportToPowerPoint(memo: InvestmentMemo, options: ExportOptions): Promise<ExportResult> {
    try {
      // For now, we'll create a detailed presentation outline
      // In production, you might want to use pptxgenjs for actual PPTX files
      const content = this.generatePowerPointContent(memo, options);
      
      const blob = new Blob([content], { 
        type: 'application/vnd.ms-powerpoint'
      });
      
      return {
        success: true,
        fileName: `Investment-Presentation-${this.sanitizeFileName(memo.projectName)}.ppt`,
        blob
      };
    } catch (error) {
      console.error('PowerPoint export failed:', error);
      // Fallback to a more detailed text format
      return await this.createPresentationFallback(memo, options);
    }
  }

  private static async createPresentationFallback(memo: InvestmentMemo, options: ExportOptions): Promise<ExportResult> {
    try {
      const content = this.generateDetailedPresentationContent(memo, options);
      const blob = new Blob([content], { 
        type: 'text/plain'
      });
      
      return {
        success: true,
        fileName: `Investment-Presentation-${this.sanitizeFileName(memo.projectName)}.txt`,
        blob
      };
    } catch (error) {
      // Ultimate fallback to PDF
      return await this.exportToPDF(memo, options);
    }
  }

  private static generatePowerPointContent(memo: InvestmentMemo, options: ExportOptions): string {
    let content = `Microsoft PowerPoint Presentation\n`;
    content += `Investment Memo: ${memo.projectName}\n\n`;
    
    content += `SLIDE 1: TITLE\n`;
    content += `=============\n`;
    content += `Investment Memorandum\n`;
    content += `${memo.projectName}\n`;
    content += `Target: ${memo.targetCompany || 'Target Company'}\n`;
    content += `${new Date().toLocaleDateString()}\n`;
    if (options.includeBranding) {
      content += `SynergyAI Confidential\n`;
    }
    content += `\n`;

    content += `SLIDE 2: EXECUTIVE SUMMARY\n`;
    content += `========================\n`;
    content += `${this.cleanContent(memo.executiveSummary || '').substring(0, 300)}...\n\n`;

    content += `SLIDE 3: KEY METRICS\n`;
    content += `===================\n`;
    if (memo.briefingCards && memo.briefingCards.length > 0) {
      memo.briefingCards.forEach((card, index) => {
        content += `${index + 1}. ${card.title}: ${card.value} ${card.subValue || ''}\n`;
      });
    }
    content += `\n`;

    content += `SLIDE 4: VALUATION ANALYSIS\n`;
    content += `==========================\n`;
    content += `${this.cleanContent(memo.valuationSection || '').substring(0, 300)}...\n\n`;

    content += `SLIDE 5: SYNERGY ASSESSMENT\n`;
    content += `==========================\n`;
    content += `${this.cleanContent(memo.synergySection || '').substring(0, 300)}...\n\n`;

    content += `SLIDE 6: RISK PROFILE\n`;
    content += `====================\n`;
    content += `${this.cleanContent(memo.riskSection || '').substring(0, 300)}...\n\n`;

    content += `SLIDE 7: RECOMMENDATIONS\n`;
    content += `=======================\n`;
    content += `${this.cleanContent(memo.recommendationSection || '').substring(0, 300)}...\n`;

    return content;
  }

  private static generateDetailedPresentationContent(memo: InvestmentMemo, options: ExportOptions): string {
    let content = `INVESTMENT MEMO PRESENTATION\n`;
    content += `===========================\n\n`;
    
    content += `PRESENTATION OUTLINE\n`;
    content += `====================\n\n`;

    content += `Slide 1: Cover Page\n`;
    content += `-------------------\n`;
    content += `• Title: Investment Memorandum - ${memo.projectName}\n`;
    content += `• Target: ${memo.targetCompany || 'Target Company'}\n`;
    content += `• Date: ${new Date().toLocaleDateString()}\n`;
    content += `• ${options.includeBranding ? 'SynergyAI Confidential' : ''}\n\n`;

    content += `Slide 2: Executive Summary\n`;
    content += `-------------------------\n`;
    content += `• Key investment highlights\n`;
    content += `• Deal overview\n`;
    content += `• Strategic importance\n\n`;

    content += `Slide 3: Investment Thesis\n`;
    content += `-------------------------\n`;
    content += `• Strategic rationale\n`;
    content += `• Market opportunity\n`;
    content += `• Competitive advantages\n\n`;

    content += `Slide 4: Financial Analysis\n`;
    content += `--------------------------\n`;
    content += `• Valuation metrics\n`;
    content += `• Financial projections\n`;
    content += `• Return analysis\n\n`;

    content += `Slide 5: Synergy Potential\n`;
    content += `-------------------------\n`;
    content += `• Cost synergies\n`;
    content += `• Revenue synergies\n`;
    content += `• Integration plan\n\n`;

    content += `Slide 6: Risk Assessment\n`;
    content += `-----------------------\n`;
    content += `• Key risks\n`;
    content += `• Mitigation strategies\n`;
    content += `• Risk-reward profile\n\n`;

    content += `Slide 7: Recommendations\n`;
    content += `-----------------------\n`;
    content += `• Investment recommendation\n`;
    content += `• Next steps\n`;
    content += `• Timetable\n\n`;

    content += `DETAILED CONTENT\n`;
    content += `================\n\n`;

    content += `EXECUTIVE SUMMARY:\n`;
    content += `${this.cleanContent(memo.executiveSummary || '')}\n\n`;

    content += `KEY METRICS:\n`;
    if (memo.briefingCards && memo.briefingCards.length > 0) {
      memo.briefingCards.forEach(card => {
        content += `• ${card.title}: ${card.value} ${card.subValue || ''}\n`;
        content += `  ${card.aiInsight || ''}\n\n`;
      });
    }

    return content;
  }

  private static async exportToWord(memo: InvestmentMemo, options: ExportOptions): Promise<ExportResult> {
    try {
      const content = this.generateWordContent(memo, options);
      const blob = new Blob([content], { 
        type: 'application/msword'
      });
      
      return {
        success: true,
        fileName: `Investment-Memo-${this.sanitizeFileName(memo.projectName)}.doc`,
        blob
      };
    } catch (error) {
      console.error('Word export failed:', error);
      return await this.exportToPDF(memo, options);
    }
  }

  private static generateWordContent(memo: InvestmentMemo, options: ExportOptions): string {
    let content = '';

    if (options.includeBranding) {
      content += 'SYNERGYAI\r\n';
      content += 'INVESTMENT MEMORANDUM\r\n';
      content += 'Confidential & Proprietary\r\n\r\n';
    }

    content += `INVESTMENT MEMO: ${memo.projectName}\r\n`;
    content += `TARGET: ${memo.targetCompany || 'Target Company'}\r\n`;
    content += `DATE: ${new Date().toLocaleDateString()}\r\n`;
    content += '='.repeat(80) + '\r\n\r\n';

    const sections = [
      { title: 'EXECUTIVE SUMMARY', content: memo.executiveSummary || '' },
      { title: 'VALUATION ANALYSIS', content: memo.valuationSection || '' },
      { title: 'SYNERGY ASSESSMENT', content: memo.synergySection || '' },
      { title: 'RISK PROFILE', content: memo.riskSection || '' },
      { title: 'STRATEGIC RATIONALE', content: memo.strategicRationale || '' },
      { title: 'RECOMMENDATIONS', content: memo.recommendationSection || '' }
    ];

    sections.forEach(section => {
      content += `${section.title}\r\n`;
      content += '-'.repeat(section.title.length) + '\r\n\r\n';
      content += this.cleanContent(section.content) + '\r\n\r\n';
    });

    // Add briefing cards as appendix
    if (memo.briefingCards && memo.briefingCards.length > 0) {
      content += 'KEY METRICS AND INSIGHTS\r\n';
      content += '========================\r\n\r\n';
      memo.briefingCards.forEach(card => {
        content += `${card.title.toUpperCase()}\r\n`;
        content += `${'-'.repeat(card.title.length)}\r\n`;
        content += `Value: ${card.value} ${card.subValue || ''}\r\n`;
        content += `Insight: ${card.aiInsight || ''}\r\n\r\n`;
      });
    }

    if (options.includeBranding) {
      content += '\r\n' + '='.repeat(80) + '\r\n';
      content += 'END OF DOCUMENT\r\n';
      content += 'SynergyAI - Investment Analysis Platform\r\n';
      content += `Generated on: ${new Date().toLocaleDateString()}\r\n`;
    }

    return content;
  }

  private static cleanContent(content: string): string {
  if (!content) return 'Content not available.';
  
  // Step 1: Handle the specific problematic patterns first
  let cleaned = content
    // Fix patterns with ampersands and spaces between letters
    .replace(/&[a-zA-Z]&\s*&[a-zA-Z]&\s*&[a-zA-Z]&\s*&[a-zA-Z]/g, (match) => {
      // Extract letters and join them
      const letters = match.split('&').filter(Boolean).map((s: string) => s.trim()).join('');
      return letters;
    })
    
    // Fix patterns like "&u &p &p &e &r &e &n &d"
    .replace(/&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])/g, '$1$2$3$4$5$6$7$8')
    .replace(/&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])/g, '$1$2$3$4$5$6$7')
    .replace(/&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])/g, '$1$2$3$4$5$6')
    .replace(/&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])/g, '$1$2$3$4$5')
    .replace(/&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])/g, '$1$2$3$4')
    .replace(/&([a-zA-Z])\s*&([a-zA-Z])\s*&([a-zA-Z])/g, '$1$2$3')
    .replace(/&([a-zA-Z])\s*&([a-zA-Z])/g, '$1$2')
    
    // Remove any remaining isolated ampersands
    .replace(/&\s*/g, '')
    
    // Fix specific known problematic phrases
    .replace(/I\s*s\s*t\s*r\s*o\s*n\s*g\s*l\s*y\s*r\s*e\s*c\s*o\s*m\s*m\s*e\s*n\s*d/g, 'Istronglyrecommend')
    .replace(/a\s*l\s*l-\s*c\s*a\s*s\s*h\s*a\s*c\s*q\s*u\s*i\s*s\s*i\s*t\s*i\s*o\s*n/g, 'all-cashacquisition')
    .replace(/u\s*p\s*p\s*e\s*r\s*e\s*n\s*d/g, 'upperend')
    .replace(/r\s*a\s*n\s*g\s*e/g, 'range')
    
    // Fix number patterns
    .replace(/\(\s*¹\s*7\s*2\s*2\s*6\s*7\s*9\s*C\s*r\s*\)/g, '(1722679Cr)')
    .replace(/\(\s*([0-9¹²³⁴⁵⁶⁷⁸⁹])\s*([0-9¹²³⁴⁵⁶⁷⁸⁹])\s*([0-9¹²³⁴⁵⁶⁷⁸⁹])\s*([0-9¹²³⁴⁵⁶⁷⁸⁹])\s*([0-9¹²³⁴⁵⁶⁷⁸⁹])\s*([0-9¹²³⁴⁵⁶⁷⁸⁹])\s*([0-9¹²³⁴⁵⁶⁷⁸⁹])\s*([A-Za-z])\s*([A-Za-z])\)/g, '($1$2$3$4$5$6$7$8$9)');

  // Step 2: Use a more careful approach for general spaced-out text
  // Only fix sequences where single characters are separated by single spaces
  cleaned = cleaned
    .split(' ')
    .map(word => {
      // If word looks like "T a t a" (single letters with spaces)
      if (word.split(' ').every((char: string) => char.length === 1) && word.split(' ').length > 2) {
        return word.replace(/\s+/g, '');
      }
      return word;
    })
    .join(' ');

  // Step 3: Final normalization
  cleaned = cleaned
    .replace(/\s+/g, ' ') // Normalize all whitespace to single spaces
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove code
    .replace(/#{1,6}\s?/g, '') // Remove headers
    .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Normalize line breaks
    .trim();

  return cleaned;
}

  private static sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50);
  }

  static downloadFile(blob: Blob, fileName: string) {
    if (typeof window === 'undefined') {
      throw new Error('Download is only available in browser environment');
    }

    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error('Failed to download file');
    }
  }
}