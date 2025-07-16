
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
      let yPosition = 30;
      
      // Add FutureBridge Logo and Header
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(41, 98, 255); // Primary blue
      pdf.text('SJ Future Bridge', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 8;
      pdf.setFontSize(14);
      pdf.setTextColor(100, 116, 139); // Slate-500
      pdf.text('College Recommendations Report', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 5;
      pdf.setFontSize(10);
      pdf.setTextColor(148, 163, 184); // Slate-400
      pdf.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Executive Summary Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59); // Slate-800
      pdf.text('Executive Summary', margin, yPosition);
      
      yPosition += 10;
      
      // Summary box with background
      const summaryHeight = 35;
      pdf.setFillColor(248, 250, 252); // Slate-50
      pdf.rect(margin, yPosition - 5, contentWidth, summaryHeight, 'F');
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85); // Slate-700
      
      const summaryLines = [
        `Total Colleges Found: ${recommendations.length}`,
        `CET Percentile: ${formData?.cetPercentile || 'N/A'}%`,
        `Category: ${formData?.reservationCategory || 'General'}`,
        `Budget Range: Up to ₹${formData?.maxBudget?.toLocaleString('en-IN') || 'No limit'}`
      ];
      
      summaryLines.forEach((line, index) => {
        pdf.text(line, margin + 5, yPosition + 5 + (index * 6));
      });
      
      yPosition += summaryHeight + 15;
      
      // Category breakdown
      const categoryStats = {
        Dream: recommendations.filter(r => r.category === 'Dream').length,
        Reach: recommendations.filter(r => r.category === 'Reach').length,
        Match: recommendations.filter(r => r.category === 'Match').length,
        Safety: recommendations.filter(r => r.category === 'Safety').length,
      };
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Category Breakdown', margin, yPosition);
      
      yPosition += 10;
      
      // Category stats in a grid
      const categoryColors = {
        Dream: [147, 51, 234], // Purple
        Reach: [59, 130, 246],  // Blue
        Match: [34, 197, 94],   // Green
        Safety: [249, 115, 22]  // Orange
      };
      
      let xPos = margin;
      Object.entries(categoryStats).forEach(([category, count]) => {
        const color = categoryColors[category as keyof typeof categoryColors];
        
        // Category pill
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.roundedRect(xPos, yPosition - 2, 35, 8, 2, 2, 'F');
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text(`${category}: ${count}`, xPos + 17.5, yPosition + 2.5, { align: 'center' });
        
        xPos += 45;
      });
      
      yPosition += 20;
      
      // Detailed Recommendations
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Detailed Recommendations', margin, yPosition);
      
      yPosition += 15;
      
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
      let currentCategory = '';
      
      sortedRecommendations.forEach((rec) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 90) {
          pdf.addPage();
          yPosition = 30;
        }
        
        // Category header (only when category changes)
        if (currentCategory !== rec.category) {
          currentCategory = rec.category;
          
          const color = categoryColors[rec.category as keyof typeof categoryColors];
          
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(color[0], color[1], color[2]);
          pdf.text(`${rec.category} Colleges`, margin, yPosition);
          
          yPosition += 12;
        }
        
        // Calculate dynamic card height based on content
        const collegeName = rec.college.name || 'Unknown College';
        const maxNameWidth = contentWidth - 120;
        const nameLines = pdf.splitTextToSize(collegeName, maxNameWidth);
        const cardHeight = Math.max(50, 35 + (nameLines.length * 6));
        
        // College card background
        pdf.setFillColor(249, 250, 251); // Gray-50
        pdf.setDrawColor(226, 232, 240); // Gray-200
        pdf.rect(margin, yPosition - 3, contentWidth, cardHeight, 'FD');
        
        // College number circle
        pdf.setFillColor(59, 130, 246); // Blue-600
        pdf.circle(margin + 10, yPosition + 8, 7, 'F');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text(globalIndex.toString(), margin + 10, yPosition + 11, { align: 'center' });
        
        // College name with proper text wrapping
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59);
        
        let nameY = yPosition + 8;
        nameLines.forEach((line: string, index: number) => {
          if (index === 0) {
            pdf.text(line, margin + 22, nameY);
          } else {
            pdf.text(line, margin + 22, nameY + (index * 5));
          }
        });
        
        // Course info with proper formatting
        const courseStartY = nameY + (nameLines.length * 5) + 3;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        
        const courseText = `Course: ${rec.course_name || 'Not specified'}`;
        const courseLines = pdf.splitTextToSize(courseText, maxNameWidth);
        courseLines.forEach((line: string, index: number) => {
          pdf.text(line, margin + 22, courseStartY + (index * 4));
        });
        
        // Location with proper formatting
        const locationY = courseStartY + (courseLines.length * 4) + 2;
        const locationText = `📍 ${rec.college.city || 'Location not specified'}`;
        pdf.text(locationText, margin + 22, locationY);
        
        // Right side metrics with better spacing
        const rightX = pageWidth - margin - 65;
        
        // Admission probability with better formatting
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        const probColor = rec.admission_probability >= 80 ? [34, 197, 94] : 
                         rec.admission_probability >= 60 ? [234, 179, 8] : [239, 68, 68];
        pdf.setTextColor(probColor[0], probColor[1], probColor[2]);
        pdf.text(`${rec.admission_probability || 0}%`, rightX, yPosition + 12);
        
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text('Admission Chance', rightX, yPosition + 18);
        
        // Fees with proper Indian formatting
        if (rec.college.fees) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(51, 65, 85);
          const formattedFees = `₹${rec.college.fees.toLocaleString('en-IN')}`;
          pdf.text(formattedFees, rightX, yPosition + 28);
          
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139);
          pdf.text('Annual Fees', rightX, yPosition + 34);
        }
        
        // Cutoff percentile with proper formatting
        if (rec.cutoff_percentile) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(67, 56, 202);
          const cutoffText = `Cutoff: ${rec.cutoff_percentile}%ile`;
          pdf.text(cutoffText, margin + 22, locationY + 6);
        }
        
        yPosition += cardHeight + 10;
        globalIndex++;
      });
      
      // Footer with page numbers and branding
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer line
        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
        
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        
        // Left: Company info
        pdf.text('SJ Future Bridge - Your Path to Success', margin, pageHeight - 12);
        
        // Right: Page number
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
        
        // Center: Website
        pdf.text('www.sjfuturebridge.com', pageWidth / 2, pageHeight - 12, { align: 'center' });
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
