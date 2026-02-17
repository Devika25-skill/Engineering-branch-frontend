import { useState } from "react";
import jsPDF from "jspdf";
import { MedicalCollegeRecommendation } from "@/types/medical";
import { useToast } from "@/hooks/use-toast";

export const usePdfDownloadMedical = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async (
    recommendations: MedicalCollegeRecommendation[],
    formData: any,
  ) => {
    setIsGenerating(true);

    // Small delay to ensure UI updates before PDF generation starts
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = 25;

      // Function to add header with logo to each page
      const addHeader = (pageNum: number = 1) => {
        const headerYPos = 10;

        // Add logo image
        try {
          const logoPath =
            "/lovable-uploads/3eef3d0d-75a9-46a2-9c43-12a8251e55b6.png";
          pdf.addImage(logoPath, "PNG", margin, headerYPos, 40, 20);
        } catch (error) {
          console.error("Error adding logo:", error);
          pdf.setFontSize(18);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(37, 99, 235);
          pdf.text("FutureBridge", margin, headerYPos + 8);
        }

        // Report title
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(31, 41, 55);
        pdf.text(
          "Medical College Recommendations Report",
          pageWidth - margin,
          headerYPos + 20,
          { align: "right" },
        );

        // Header separator line
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.5);
        pdf.line(margin, headerYPos + 25, pageWidth - margin, headerYPos + 25);

        return headerYPos + 35;
      };

      // Add header to first page
      yPosition = addHeader(1);

      // Student Details Section
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(31, 41, 55);
      pdf.text("Student Details", margin, yPosition);

      yPosition += 8;

      // Extract user details from localStorage and formData
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userName = userData.name || "Student Name";

      // Map medical form fields correctly
      const category = formData.reservationCategory || "Not specified";
      const neetRank = formData.neetAllIndiaRank || "Not specified";

      // Handle programs - get ALL selected programs
      const programsArray = formData.preferredMedicalPrograms || [];
      const program =
        Array.isArray(programsArray) && programsArray.length > 0
          ? programsArray.includes("ALL")
            ? "All Programs"
            : programsArray.join(", ")
          : "Not specified";

      const gender = formData.gender || "Not specified";

      // Handle cities - get ALL selected cities
      const citiesArray = formData.preferredCities || [];
      const preferredCities =
        Array.isArray(citiesArray) && citiesArray.length > 0
          ? citiesArray.includes("ALL")
            ? "All Cities"
            : citiesArray.join(", ")
          : "Not specified";

      // Get selected state from localStorage
      const selectedState =
        localStorage.getItem("selected_state") || "Not specified";

      // Calculate dynamic height based on content length
      const programLines = pdf.splitTextToSize(
        `Programs: ${program}`,
        contentWidth - 10,
      );
      const citiesLines = pdf.splitTextToSize(
        `Preferred Cities: ${preferredCities}`,
        contentWidth - 10,
      );
      const baseHeight = 36; // For name, category, gender, neet rank, state
      const programHeight = programLines.length * 5;
      const citiesHeight = citiesLines.length * 5;
      const userDetailsHeight = baseHeight + programHeight + citiesHeight;

      pdf.setFillColor(249, 250, 251);
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, yPosition, contentWidth, userDetailsHeight, "FD");

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(55, 65, 81);

      // Display user details with dynamic line height spacing
      const lineHeight = 6;
      let lineY = yPosition + 6;

      pdf.text(`Name: ${userName}`, margin + 5, lineY);
      lineY += lineHeight;

      pdf.text(`Category: ${category}`, margin + 5, lineY);
      lineY += lineHeight;

      // Programs with word wrap
      pdf.text(programLines, margin + 5, lineY);
      lineY += programLines.length * 5;

      pdf.text(`Gender: ${gender}`, margin + 5, lineY);
      lineY += lineHeight;

      pdf.text(`NEET Rank: ${neetRank}`, margin + 5, lineY);
      lineY += lineHeight;

      // Preferred cities with word wrap
      pdf.text(citiesLines, margin + 5, lineY);
      lineY += citiesLines.length * 5;

      pdf.text(`State: ${selectedState}`, margin + 5, lineY);

      yPosition += userDetailsHeight + 8;

      // Category Breakdown Section
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(31, 41, 55);
      pdf.text("Category Breakdown", margin, yPosition);

      yPosition += 8;

      // Summary box with background
      const summaryHeight = 32;
      pdf.setFillColor(249, 250, 251);
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(margin, yPosition, contentWidth, summaryHeight, "FD");

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(55, 65, 81);

      // Category breakdown
      const categoryStats = {
        Dream: recommendations.filter((r) => r.category === "Dream").length,
        Reach: recommendations.filter((r) => r.category === "Reach").length,
        Match: recommendations.filter((r) => r.category === "Match").length,
        Safety: recommendations.filter((r) => r.category === "Safety").length,
      };

      yPosition += 8;

      // Category stats in a professional table format
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(55, 65, 81);

      const categoryData = [
        ["Dream Colleges", categoryStats.Dream.toString()],
        ["Reach Colleges", categoryStats.Reach.toString()],
        ["Match Colleges", categoryStats.Match.toString()],
        ["Safety Colleges", categoryStats.Safety.toString()],
      ];

      categoryData.forEach(([label, count], index) => {
        const rowY = yPosition + index * 5;
        pdf.text(label, margin + 5, rowY);
        pdf.text(count, margin + 80, rowY);
      });

      yPosition += 35;

      // Detailed Recommendations
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(31, 41, 55);
      pdf.text("Medical College Recommendations", margin, yPosition);

      yPosition += 12;

      // Sort recommendations by category order, then by admission_probability ascending,
      // then by abs(closing_rank - neet_rank) smallest first
      const categoryOrder = ["Dream", "Reach", "Match", "Safety"];
      const sortedRecommendations = [...recommendations].sort((a, b) => {
        const categoryA = categoryOrder.indexOf(a.category);
        const categoryB = categoryOrder.indexOf(b.category);

        // First: sort by category order
        if (categoryA !== categoryB) {
          return categoryA - categoryB;
        }

        // Second: sort by admission_probability ascending (lowest first)
        const probA = a.admission_probability || 0;
        const probB = b.admission_probability || 0;
        if (probA !== probB) {
          return probA - probB;
        }

        // Third: sort by abs(closing_rank - neet_rank) smallest first
        const neetRankA = a.neet_rank || 0;
        const neetRankB = b.neet_rank || 0;
        const closingRankA = a.closing_rank || 0;
        const closingRankB = b.closing_rank || 0;
        const diffA = Math.abs(closingRankA - neetRankA);
        const diffB = Math.abs(closingRankB - neetRankB);
        return diffA - diffB;
      });

      let globalIndex = 1;
      let collegesOnCurrentPage = 0;
      const maxCollegesPerPage = 10;

      sortedRecommendations.forEach((rec) => {
        // Check if we need a new page
        if (
          yPosition > pageHeight - 40 ||
          collegesOnCurrentPage >= maxCollegesPerPage
        ) {
          pdf.addPage();
          yPosition = addHeader(pdf.getNumberOfPages());
          collegesOnCurrentPage = 0;
        }

        // Professional college entry layout
        const entryHeight = 28;

        // Entry background with subtle border
        pdf.setFillColor(249, 250, 251);
        pdf.setDrawColor(229, 231, 235);
        pdf.rect(margin, yPosition, contentWidth, entryHeight, "FD");

        // Serial number
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(37, 99, 235);
        pdf.text(`${globalIndex}.`, margin + 5, yPosition + 8);

        // College name
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(31, 41, 55);
        const collegeName = rec.college.college_name || "Unknown College";
        const maxNameWidth = 100;
        const nameLines = pdf.splitTextToSize(collegeName, maxNameWidth);
        pdf.text(nameLines[0], margin + 15, yPosition + 8);

        // Program and College Type on second line
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(107, 114, 128);
        const programText = rec.college.college_type
          ? `${rec.program} • ${rec.college.college_type}`
          : `${rec.program}`;
        pdf.text(programText, margin + 15, yPosition + 14);

        // City and State on third line
        pdf.setFontSize(9);
        pdf.setTextColor(107, 114, 128);
        const cityStateText = rec.college.state
          ? `${rec.college.city}, ${rec.college.state}`
          : rec.college.city;
        pdf.text(cityStateText, margin + 15, yPosition + 20);

        // Closing Rank
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(
          `Closing Rank: ${rec.closing_rank || "N/A"}`,
          margin + 15,
          yPosition + 26,
        );

        // Category badge
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        const categoryColors = {
          Dream: [147, 51, 234],
          Reach: [59, 130, 246],
          Match: [34, 197, 94],
          Safety: [249, 115, 22],
        };
        const catColor = categoryColors[
          rec.category as keyof typeof categoryColors
        ] || [100, 116, 139];
        pdf.setTextColor(catColor[0], catColor[1], catColor[2]);
        pdf.text(rec.category, margin + 125, yPosition + 8);

        // Admission probability
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        const probColor =
          rec.admission_probability >= 80
            ? [34, 197, 94]
            : rec.admission_probability >= 60
              ? [234, 179, 8]
              : [239, 68, 68];
        pdf.setTextColor(probColor[0], probColor[1], probColor[2]);
        pdf.text(
          `${rec.admission_probability || 0}%`,
          margin + 125,
          yPosition + 18,
        );

        yPosition += entryHeight + 2;
        globalIndex++;
        collegesOnCurrentPage++;
      });

      // Add disclaimer and guidance sections
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = addHeader(pdf.getNumberOfPages());
      }

      yPosition += 10;

      // Important Disclaimer Section
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(220, 38, 38);
      pdf.text("Important Disclaimer:", margin, yPosition);

      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(55, 65, 81);
      const disclaimerText =
        "These medical college recommendations are based on previous year's admission data and your provided NEET information. Please verify all details including current cutoffs, fees, seat availability, and admission requirements before submitting your application forms.";
      const disclaimerLines = pdf.splitTextToSize(
        disclaimerText,
        contentWidth - 10,
      );

      // Add background for disclaimer
      const disclaimerHeight = disclaimerLines.length * 4 + 8;
      pdf.setFillColor(254, 242, 242);
      pdf.setDrawColor(254, 202, 202);
      pdf.rect(margin, yPosition - 2, contentWidth, disclaimerHeight, "FD");

      pdf.text(disclaimerLines, margin + 5, yPosition + 4);
      yPosition += disclaimerHeight + 8;

      // Step-by-Step Guide Section
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = addHeader(pdf.getNumberOfPages());
      }

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(31, 41, 55);
      pdf.text("Step-by-Step Guide:", margin, yPosition);

      yPosition += 10;

      const steps = [
        {
          title: "1. Follow the Order, Top to Bottom:",
          content:
            "Simply copy the colleges exactly as they appear on this list, from top to bottom, into your official medical counseling application form.",
        },
        {
          title: "2. Dream & Reach First:",
          content:
            'The colleges at the top of this list are your "Dream" and "Reach" options. While your NEET rank may not match last year\'s closing ranks, placing them first gives you the best opportunity to secure admission if seats open up in subsequent rounds.',
        },
        {
          title: "3. Match & Safety Next:",
          content:
            'The "Match" and "Safety" colleges are strategically positioned to ensure you secure admission to the best possible college that fits your NEET rank and preferences, even if top choices don\'t work out.',
        },
        {
          title: "4. No Guesswork, No Mistakes:",
          content:
            "This optimized sequence eliminates common errors and guesswork, ensuring you leverage every opportunity without missing out on a valuable medical seat.",
        },
      ];

      steps.forEach((step) => {
        if (yPosition > pageHeight - 35) {
          pdf.addPage();
          yPosition = addHeader(pdf.getNumberOfPages());
        }

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(31, 41, 55);
        pdf.text(step.title, margin, yPosition);

        yPosition += 6;

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(55, 65, 81);
        const stepLines = pdf.splitTextToSize(step.content, contentWidth - 10);
        pdf.text(stepLines, margin + 5, yPosition);

        yPosition += stepLines.length * 4 + 8;
      });

      // Confidence message
      if (yPosition > pageHeight - 25) {
        pdf.addPage();
        yPosition = addHeader(pdf.getNumberOfPages());
      }

      const confidenceText =
        "By following this recommended order, you're not just filling a form - you're executing a smart strategy for your medical career. Go ahead, fill your form with confidence!";
      const confidenceLines = pdf.splitTextToSize(
        confidenceText,
        contentWidth - 10,
      );
      const confidenceHeight = confidenceLines.length * 4 + 8;

      pdf.setFillColor(220, 252, 231);
      pdf.setDrawColor(187, 247, 208);
      pdf.rect(margin, yPosition, contentWidth, confidenceHeight, "FD");

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(22, 163, 74);
      pdf.text(confidenceLines, margin + 3, yPosition + 7);

      yPosition += confidenceHeight + 10;

      // Understanding Categories Section
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = addHeader(pdf.getNumberOfPages());
      }

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(31, 41, 55);
      pdf.text("Understanding the Categories:", margin, yPosition);

      yPosition += 10;

      const categories = [
        {
          name: "Dream Colleges",
          chance: "<50% chance",
          color: [147, 51, 234],
          bgColor: [250, 245, 255],
          borderColor: [196, 181, 253],
          description:
            "These are colleges that perfectly align with your preferences but your NEET rank is below their typical closing rank. Challenging but worth including for your highest aspirations.",
        },
        {
          name: "Reach Colleges",
          chance: "50-70% chance",
          color: [234, 88, 12],
          bgColor: [255, 247, 237],
          borderColor: [254, 215, 170],
          description:
            "Ambitious but within grasp. Your NEET rank is close to their closing rank. You have a solid chance with these excellent options.",
        },
        {
          name: "Match Colleges",
          chance: "75-90% chance",
          color: [34, 197, 94],
          bgColor: [240, 253, 244],
          borderColor: [187, 247, 208],
          description:
            "Great fit for your profile. Your NEET rank is comfortably within their range. Very strong likelihood of admission.",
        },
        {
          name: "Safety Colleges",
          chance: ">90% chance",
          color: [59, 130, 246],
          bgColor: [239, 246, 255],
          borderColor: [191, 219, 254],
          description:
            "Highly probable admission. Your NEET rank is well above their closing rank. These provide peace of mind and guaranteed admission.",
        },
      ];

      categories.forEach((category) => {
        if (yPosition > pageHeight - 35) {
          pdf.addPage();
          yPosition = addHeader(pdf.getNumberOfPages());
        }

        const categoryHeight = 25;

        // Category background for entire row
        pdf.setFillColor(
          category.bgColor[0],
          category.bgColor[1],
          category.bgColor[2],
        );
        pdf.setDrawColor(
          category.borderColor[0],
          category.borderColor[1],
          category.borderColor[2],
        );
        pdf.rect(margin, yPosition, contentWidth, categoryHeight, "FD");

        // Category name and chance in left section
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(
          category.color[0],
          category.color[1],
          category.color[2],
        );
        pdf.text(category.name, margin + 5, yPosition + 8);

        pdf.setFontSize(8);
        pdf.text(category.chance, margin + 5, yPosition + 16);

        // Description in right section
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(55, 65, 81);
        const descLines = pdf.splitTextToSize(
          category.description,
          contentWidth - 90,
        );
        pdf.text(descLines, margin + 85, yPosition + 6);

        yPosition += categoryHeight + 3;
      });

      yPosition += 5;

      // Footer with page numbers and branding
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Footer line
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        // Footer content
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(107, 114, 128);
        pdf.text("Generated by FutureBridge", margin, pageHeight - 8);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 8,
          { align: "right" },
        );
      }

      // Save the PDF
      const fileName = `Medical_Recommendations_${userName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Success!",
        description: "Your medical recommendations report has been downloaded.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePDF, isGenerating };
};
