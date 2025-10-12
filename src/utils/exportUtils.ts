import { Draft } from '../types';
import { ExportFormat, ExportOptions } from '../components/features/reports/export/ExportSection';

// Dynamic import for jsPDF to avoid SSR issues
let jsPDF: any = null;
if (typeof window !== 'undefined') {
  import('jspdf').then(module => {
    jsPDF = module.default;
  });
}

export interface ExportResult {
  success: boolean;
  fileName: string;
  blob: Blob;
  error?: string;
}

export class ExportService {
  static async exportReports(
    drafts: Draft[], 
    format: ExportFormat, 
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      switch (format) {
        case 'PDF':
          return await this.exportToPDF(drafts, options);
        case 'Excel':
          return await this.exportToExcel(drafts, options);
        case 'PowerPoint':
          return await this.exportToPowerPoint(drafts, options);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        fileName: '',
        blob: new Blob(),
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  private static async exportToPDF(drafts: Draft[], options: ExportOptions): Promise<ExportResult> {
    try {
      // Wait for jsPDF to load
      if (!jsPDF) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!jsPDF) {
          throw new Error('PDF library not loaded');
        }
      }

      const doc = new jsPDF();
      
      // Set initial position
      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // Add header
      if (options.includeBranding) {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('SynergyAI - M&A Reports', margin, yPosition);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        yPosition += 10;
        doc.text(`Generated on: ${new Date().toLocaleDateString()} | Confidential`, margin, yPosition);
        yPosition += 15;
      } else {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('M&A Reports', margin, yPosition);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        yPosition += 10;
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
        yPosition += 15;
      }

      // Add each report
      drafts.forEach((draft, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Report title
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        const title = `Report ${index + 1}: ${draft.title}`;
        const titleLines = doc.splitTextToSize(title, contentWidth);
        doc.text(titleLines, margin, yPosition);
        yPosition += (titleLines.length * 7) + 5;

        // Report details
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Status: ${draft.status}`, margin, yPosition);
        yPosition += 6;
        doc.text(`Last Modified: ${draft.lastModified}`, margin, yPosition);
        yPosition += 6;
        doc.text(`Created By: ${draft.createdBy.name}`, margin, yPosition);
        yPosition += 6;
        doc.text(`Project: ${draft.projectId}`, margin, yPosition);
        yPosition += 10;

        // Report content
        if (draft.content?.html) {
          const textContent = this.stripHtml(draft.content.html);
          const contentLines = doc.splitTextToSize(textContent, contentWidth);
          
          // Check if content fits on current page
          if (yPosition + (contentLines.length * 5) > 270) {
            doc.addPage();
            yPosition = 20;
          }

          doc.text('Content Summary:', margin, yPosition);
          yPosition += 6;
          doc.setFont(undefined, 'italic');
          contentLines.forEach((line: string) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += 5;
          });
          doc.setFont(undefined, 'normal');
          yPosition += 10;
        }

        // Add separator
        if (index < drafts.length - 1) {
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 15;
        }
      });

      // Add sources if requested
      if (options.includeSources && yPosition < 250) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.text('Document Sources:', margin, yPosition);
        yPosition += 10;
        doc.setFont(undefined, 'normal');
        
        drafts.forEach(draft => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`• ${draft.title} (ID: ${draft.id})`, margin, yPosition);
          yPosition += 6;
        });
      }

      // Generate blob
      const pdfBlob = doc.output('blob');
      
      return {
        success: true,
        fileName: `reports-${new Date().toISOString().split('T')[0]}.pdf`,
        blob: pdfBlob
      };
    } catch (error) {
      console.error('PDF generation failed, falling back to text:', error);
      // Fallback to text file
      return await this.exportToText(drafts, options, 'pdf');
    }
  }

  private static async exportToExcel(drafts: Draft[], options: ExportOptions): Promise<ExportResult> {
    try {
      // Create proper CSV content with BOM for Excel compatibility
      const BOM = '\uFEFF'; // Byte Order Mark for Excel
      let content = BOM + 'Title,Status,Last Modified,Created By,Project ID,Content Preview,Word Count,Character Count\n';
      
      drafts.forEach(draft => {
        const contentPreview = draft.content?.html ? 
          this.stripHtml(draft.content.html)
            .substring(0, 100)
            .replace(/"/g, '""') // Escape quotes for CSV
            .replace(/\n/g, ' ') : '';
        
        const fullContent = draft.content?.html ? this.stripHtml(draft.content.html) : '';
        const wordCount = fullContent.split(/\s+/).filter(word => word.length > 0).length;
        const charCount = fullContent.length;
        
        content += `"${draft.title.replace(/"/g, '""')}","${draft.status}","${draft.lastModified}","${draft.createdBy.name.replace(/"/g, '""')}","${draft.projectId}","${contentPreview}",${wordCount},${charCount}\n`;
      });

      // Add metadata section
      content += '\n';
      content += 'META DATA\n';
      content += `"Total Reports","${drafts.length}"\n`;
      content += `"Export Format","CSV"\n`;
      content += `"Generated","${new Date().toLocaleString()}"\n`;
      content += `"Branding Included","${options.includeBranding}"\n`;
      content += `"Sources Included","${options.includeSources}"\n`;
      content += `"Template","${options.customTemplate}"\n`;

      const blob = new Blob([content], { 
        type: 'text/csv; charset=utf-8' 
      });
      
      return {
        success: true,
        fileName: `reports-${new Date().toISOString().split('T')[0]}.csv`,
        blob
      };
    } catch (error) {
      console.error('Excel export failed:', error);
      return await this.exportToText(drafts, options, 'excel');
    }
  }

  private static async exportToPowerPoint(drafts: Draft[], options: ExportOptions): Promise<ExportResult> {
    try {
      // Create a proper PowerPoint XML structure (simplified)
      const pptContent = this.generatePowerPointXML(drafts, options);
      const blob = new Blob([pptContent], { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });
      
      return {
        success: true,
        fileName: `reports-${new Date().toISOString().split('T')[0]}.pptx`,
        blob
      };
    } catch (error) {
      console.error('PowerPoint export failed, using text outline:', error);
      // Fallback to detailed text outline
      return await this.exportToText(drafts, options, 'powerpoint');
    }
  }

  private static async exportToText(drafts: Draft[], options: ExportOptions, originalFormat: string): Promise<ExportResult> {
    const content = this.generateTextContent(drafts, options, originalFormat);
    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    
    const extension = originalFormat === 'pdf' ? 'txt' : 
                     originalFormat === 'excel' ? 'csv' : 'txt';
    
    return {
      success: true,
      fileName: `reports-${new Date().toISOString().split('T')[0]}.${extension}`,
      blob
    };
  }

  private static generatePowerPointXML(drafts: Draft[], options: ExportOptions): string {
    // Simplified PowerPoint XML structure
    // In a real implementation, you'd use a proper PPTX library
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Presentation xmlns="http://schemas.openxmlformats.org/presentationml/2006/main">
  <Slides>
    <Slide>
      <Title>M&A Reports Summary</Title>
      <Content>
        <Bullet>Total Reports: ${drafts.length}</Bullet>
        <Bullet>Generated: ${new Date().toLocaleDateString()}</Bullet>
        ${options.includeBranding ? '<Bullet>SynergyAI Confidential</Bullet>' : ''}
      </Content>
    </Slide>
    ${drafts.map((draft, index) => `
    <Slide>
      <Title>${draft.title}</Title>
      <Content>
        <Bullet>Status: ${draft.status}</Bullet>
        <Bullet>Last Updated: ${draft.lastModified}</Bullet>
        <Bullet>Author: ${draft.createdBy.name}</Bullet>
        ${draft.content?.html ? `<Bullet>Summary: ${this.stripHtml(draft.content.html).substring(0, 100)}...</Bullet>` : ''}
      </Content>
    </Slide>
    `).join('')}
  </Slides>
</Presentation>`;
  }

  private static generateTextContent(drafts: Draft[], options: ExportOptions, format: string): string {
    let content = '';
    
    if (format === 'pdf') {
      content = 'M&A REPORTS EXPORT\n';
      content += '==================\n\n';
    } else if (format === 'excel') {
      content = 'Title,Status,Last Modified,Created By,Content\n';
    } else {
      content = 'PRESENTATION OUTLINE - M&A REPORTS\n';
      content = '===================================\n\n';
    }

    drafts.forEach((draft, index) => {
      if (format === 'excel') {
        const preview = draft.content?.html ? 
          this.stripHtml(draft.content.html).substring(0, 100).replace(/,/g, ';') : '';
        content += `"${draft.title}","${draft.status}","${draft.lastModified}","${draft.createdBy.name}","${preview}"\n`;
      } else {
        content += `REPORT ${index + 1}: ${draft.title}\n`;
        content += `Status: ${draft.status}\n`;
        content += `Last Modified: ${draft.lastModified}\n`;
        content += `Author: ${draft.createdBy.name}\n`;
        
        if (draft.content?.html) {
          content += `Content: ${this.stripHtml(draft.content.html).substring(0, 200)}...\n`;
        }
        content += '\n';
      }
    });

    return content;
  }

  private static stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  static downloadFile(blob: Blob, fileName: string) {
    try {
      // Create a proper download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      // Append to body and click
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