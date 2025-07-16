
import { useState } from 'react';
import jsPDF from 'jspdf';
import { CollegeRecommendation } from '@/services/cutoffService';
import { useToast } from '@/hooks/use-toast';

export const usePdfDownload = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async (recommendations: CollegeRecommendation[], formData: any) => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      let yPosition = 25;
      
      // Function to add header with logo to each page
      const addHeader = (pageNum: number = 1) => {
        // Reset position for header
        const headerYPos = 15;
        
        // Add logo - using a simple blue rectangle as placeholder
        pdf.setFillColor(41, 98, 255); // Primary blue
        pdf.rect(margin, headerYPos, 20, 12, 'F'); // Logo placeholder
        
        // Company name next to logo
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(41, 98, 255);
        pdf.text('SJ Future Bridge', margin + 25, headerYPos + 8);
        
        // Report title
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text('College Recommendations Report', margin + 25, headerYPos + 14);
        
        // Date on the right
        pdf.setFontSize(10);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, headerYPos + 8, { align: 'right' });
        
        // Header separator line
        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, headerYPos + 18, pageWidth - margin, headerYPos + 18);
        
        return headerYPos + 25; // Return Y position after header
      };
      
      // Add header to first page
      yPosition = addHeader(1);
      
      // Executive Summary Section (only on first page)
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Executive Summary', margin, yPosition);
      
      yPosition += 8;
      
      // Summary box with background
      const summaryHeight = 32;
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(margin, yPosition, contentWidth, summaryHeight, 'FD');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      
      const summaryLines = [
        `Total Colleges Found: ${recommendations.length}`,
        `CET Percentile: ${formData?.cetPercentile || 'N/A'}%`,
        `Category: ${formData?.reservationCategory || 'General'}`,
        `Budget Range: Up to ₹${formData?.maxBudget?.toLocaleString('en-IN') || 'No limit'}`
      ];
      
      summaryLines.forEach((line, index) => {
        pdf.text(line, margin + 5, yPosition + 8 + (index * 5));
      });
      
      yPosition += summaryHeight + 15;
      
      // Category breakdown (only on first page)
      const categoryStats = {
        Dream: recommendations.filter(r => r.category === 'Dream').length,
        Reach: recommendations.filter(r => r.category === 'Reach').length,
        Match: recommendations.filter(r => r.category === 'Match').length,
        Safety: recommendations.filter(r => r.category === 'Safety').length,
      };
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Category Breakdown', margin, yPosition);
      
      yPosition += 8;
      
      // Category stats in a professional table format
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      
      const categoryData = [
        ['Dream Colleges', categoryStats.Dream.toString()],
        ['Reach Colleges', categoryStats.Reach.toString()],
        ['Match Colleges', categoryStats.Match.toString()],
        ['Safety Colleges', categoryStats.Safety.toString()]
      ];
      
      categoryData.forEach(([label, count], index) => {
        const rowY = yPosition + (index * 5);
        pdf.text(label, margin + 5, rowY);
        pdf.text(count, margin + 80, rowY);
      });
      
      yPosition += 25;
      
      // Detailed Recommendations
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('College Recommendations', margin, yPosition);
      
      yPosition += 12;
      
      // Sort recommendations by category order and maintain continuous numbering
      const categoryOrder = ['Dream', 'Reach', 'Match', 'Safety'];
      const sortedRecommendations = recommendations.sort((a, b) => {
        const categoryA = categoryOrder.indexOf(a.category);
        const categoryB = categoryOrder.indexOf(b.category);
        
        if (categoryA !== categoryB) {
          return categoryA - categoryB;
        }
        
        return (b.cutoff_percentile || 0) - (a.cutoff_percentile || 0);
      });
      
      let globalIndex = 1;
      let collegesOnCurrentPage = 0;
      const maxCollegesPerPage = 9;
      
      sortedRecommendations.forEach((rec) => {
        // Check if we need a new page (after header space and max 9 colleges per page)
        if (yPosition > pageHeight - 35 || collegesOnCurrentPage >= maxCollegesPerPage) {
          pdf.addPage();
          yPosition = addHeader(pdf.getNumberOfPages());
          collegesOnCurrentPage = 0;
        }
        
        // Professional college entry layout
        const entryHeight = 24;
        
        // Entry background with subtle border
        pdf.setFillColor(249, 250, 251);
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(margin, yPosition, contentWidth, entryHeight, 'FD');
        
        // Serial number
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(59, 130, 246);
        pdf.text(`${globalIndex}.`, margin + 5, yPosition + 8);
        
        // College name - clean, professional
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59);
        const collegeName = rec.college.name || 'Unknown College';
        const maxNameWidth = 100;
        const nameLines = pdf.splitTextToSize(collegeName, maxNameWidth);
        pdf.text(nameLines[0], margin + 15, yPosition + 8);
        
        // Course info on second line
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        const courseText = rec.course_name || 'Course not specified';
        pdf.text(courseText, margin + 15, yPosition + 14);
        
        // Location
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        const location = rec.college.city || 'Location not specified';
        pdf.text(location, margin + 15, yPosition + 19);
        
        // Category badge
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        const categoryColors = {
          'Dream': [147, 51, 234],
          'Reach': [59, 130, 246], 
          'Match': [34, 197, 94],
          'Safety': [249, 115, 22]
        };
        const catColor = categoryColors[rec.category as keyof typeof categoryColors] || [100, 116, 139];
        pdf.setTextColor(catColor[0], catColor[1], catColor[2]);
        pdf.text(rec.category, margin + 125, yPosition + 8);
        
        // Admission probability
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const probColor = rec.admission_probability >= 80 ? [34, 197, 94] : 
                         rec.admission_probability >= 60 ? [234, 179, 8] : [239, 68, 68];
        pdf.setTextColor(probColor[0], probColor[1], probColor[2]);
        pdf.text(`${rec.admission_probability || 0}%`, margin + 125, yPosition + 16);
        
        // Fees
        if (rec.college.fees) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(51, 65, 85);
          const formattedFees = `₹${rec.college.fees.toLocaleString('en-IN')}`;
          pdf.text(formattedFees, margin + 125, yPosition + 21);
        }
        
        // Cutoff percentile on the right
        if (rec.cutoff_percentile) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(67, 56, 202);
          pdf.text(`${rec.cutoff_percentile}%ile`, pageWidth - margin - 25, yPosition + 12);
        }
        
        yPosition += entryHeight + 2;
        globalIndex++;
        collegesOnCurrentPage++;
      });
      
      // Footer with page numbers and branding
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer line
        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        
        // Left: Company info
        pdf.text('SJ Future Bridge - Your Path to Success', margin, pageHeight - 8);
        
        // Right: Page number
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
        
        // Center: Website
        pdf.text('www.sjfuturebridge.com', pageWidth / 2, pageHeight - 8, { align: 'center' });
      }
      
      // Save the PDF
      const fileName = `College_Recommendations_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "PDF Downloaded Successfully!",
        description: "Your professional college recommendations report has been generated.",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePDF,
    isGenerating
  };
};
