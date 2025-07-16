
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
        
        // Add logo image
        try {
          const logoPath = '/lovable-uploads/3eef3d0d-75a9-46a2-9c43-12a8251e55b6.png';
          pdf.addImage(logoPath, 'PNG', margin, headerYPos, 40, 20);
        } catch (error) {
          console.error('Error adding logo:', error);
          // Fallback to text if image fails
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(37, 99, 235);
          pdf.text('FutureBridge', margin, headerYPos + 8);
        }
        
        // Report title
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(31, 41, 55);
        pdf.text('College Recommendations Report', margin + 40, headerYPos + 8);
        

        // Header separator line
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.5);
        pdf.line(margin, headerYPos + 25, pageWidth - margin, headerYPos + 25);
        
        return headerYPos + 35; // Return Y position after header
      };
      
      // Add header to first page
      yPosition = addHeader(1);
      
      // User Details Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text('Student Details', margin, yPosition);
      
      yPosition += 8;
      
      // User details box
      const userDetailsHeight = 30;
      pdf.setFillColor(249, 250, 251);
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(margin, yPosition, contentWidth, userDetailsHeight, 'FD');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(55, 65, 81);
      
      yPosition += 8;
      
      // Extract user details from formData
      const userName = formData?.personalInfo?.name || 'Student Name';
      const category = formData?.personalInfo?.category || formData?.academicMarks?.reservationCategory || 'Not specified';
      const branches = formData?.preferences?.engineeringBranches?.slice(0, 3)?.join(', ') || 'Not specified';
      const cetCutoff = formData?.examPercentiles?.CET || formData?.academicMarks?.CET || 'Not specified';
      
      // Display user details
      pdf.text(`Name: ${userName}`, margin + 5, yPosition);
      pdf.text(`Category: ${category}`, margin + 5, yPosition + 6);
      pdf.text(`Preferred Branches: ${branches}`, margin + 5, yPosition + 12);
      pdf.text(`CET Percentile: ${cetCutoff}`, margin + 5, yPosition + 18);
      
      yPosition += 35;
      
      // Category Breakdown Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text('Category Breakdown', margin, yPosition);
      
      yPosition += 8;
      
      // Summary box with background
      const summaryHeight = 32;
      pdf.setFillColor(249, 250, 251);
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(margin, yPosition, contentWidth, summaryHeight, 'FD');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(55, 65, 81);
  
      
      // Category breakdown (only on first page)
      const categoryStats = {
        Dream: recommendations.filter(r => r.category === 'Dream').length,
        Reach: recommendations.filter(r => r.category === 'Reach').length,
        Match: recommendations.filter(r => r.category === 'Match').length,
        Safety: recommendations.filter(r => r.category === 'Safety').length,
      };
      
      yPosition += 8;
      
      // Category stats in a professional table format
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(55, 65, 81);
      
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
      
      yPosition += 35;
      
      // Detailed Recommendations
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
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
      const maxCollegesPerPage = 12;
      
      sortedRecommendations.forEach((rec) => {
        // Check if we need a new page (after header space and max 9 colleges per page)
        if (yPosition > pageHeight - 35 || collegesOnCurrentPage >= maxCollegesPerPage) {
          pdf.addPage();
          yPosition = addHeader(pdf.getNumberOfPages());
          collegesOnCurrentPage = 0;
        }
        
        // Professional college entry layout
        const entryHeight = 20;
        
        // Entry background with subtle border
        pdf.setFillColor(249, 250, 251);
        pdf.setDrawColor(229, 231, 235);
        pdf.rect(margin, yPosition, contentWidth, entryHeight, 'FD');
        
        // Serial number
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text(`${globalIndex}.`, margin + 5, yPosition + 8);
        
        // College name - clean, professional
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(31, 41, 55);
        const collegeName = rec.college.name || 'Unknown College';
        const maxNameWidth = 100;
        const nameLines = pdf.splitTextToSize(collegeName, maxNameWidth);
        pdf.text(nameLines[0], margin + 15, yPosition + 8);
        
        // Course info on second line
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(107, 114, 128);
        const courseText = rec.course_name || 'Course not specified';
        pdf.text(pdf.splitTextToSize(courseText, maxNameWidth)[0], margin + 15, yPosition + 14);
        
        // Location
        pdf.setFontSize(9);
        pdf.setTextColor(107, 114, 128);
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
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(107, 114, 128);
        
        // Left: Company info
        pdf.text('FutureBridge - Powered by SkillJourney | futurebridge.skilljourney.in', margin, pageHeight - 8);
        
        // Right: Page number
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
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
