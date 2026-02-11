import { useState } from "react";
import jsPDF from "jspdf";
import { CollegeRecommendation } from "@/services/cutoffService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

export const usePdfDownload = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const generatePDF = async (
    recommendations: CollegeRecommendation[],
    formData: any,
    preferenceOverrides?: { branches?: string[]; cities?: string[] },
  ) => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = 25;

      // Function to add header with logo to each page
      const addHeader = (pageNum: number = 1) => {
        // Reset position for header
        const headerYPos = 10;

        // Add logo image
        try {
          const logoPath =
            "/lovable-uploads/3eef3d0d-75a9-46a2-9c43-12a8251e55b6.png";
          pdf.addImage(logoPath, "PNG", margin, headerYPos, 40, 20);
        } catch (error) {
          console.error("Error adding logo:", error);
          // Fallback to text if image fails
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
          "College Recommendations Report",
          pageWidth - margin,
          headerYPos + 20,
          { align: "right" },
        );

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
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(31, 41, 55);
      pdf.text("Student Details", margin, yPosition);

      yPosition += 8;

      // User details box
      const userDetailsHeight = 35;
      pdf.setFillColor(249, 250, 251);
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(margin, yPosition, contentWidth, userDetailsHeight, "FD");

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(55, 65, 81);

      yPosition += 8;

      // Extract user details from localStorage
      const sessionData = JSON.parse(
        sessionStorage.getItem("recommendationFormData") || "{}",
      );
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userName = userData.name || "Student Name";

      // Fetch state info
      const isKarnataka =
        localStorage.getItem("selected_state") === "Karnataka";

      // Get persistent config from local storage (fallback)
      let storedConfig = null;
      try {
        const configStr = localStorage.getItem("engineering_user_config");
        if (configStr) storedConfig = JSON.parse(configStr);
      } catch (e) {
        console.error("Error parsing engineering_user_config", e);
      }

      let category =
        sessionData.reservationCategory ||
        formData?.reservationCategory ||
        storedConfig?.reservationCategory || // Correct path from API response
        storedConfig?.category ||
        "Not specified";

      let cetCutoff =
        sessionData.cetPercentile ||
        formData?.cetPercentile ||
        formData?.cet_percentile;

      // If cetCutoff is missing, try to get it from stored config
      if (!cetCutoff || cetCutoff === "Not specified") {
        if (isKarnataka) {
          cetCutoff =
            storedConfig?.academic_credentials?.examPercentiles?.CET_Rank ||
            storedConfig?.cet_rank;
        } else {
          cetCutoff =
            storedConfig?.academic_credentials?.examPercentiles?.CET ||
            storedConfig?.cet_percentile;
        }
      }

      // If still not specified, try to get from first recommendation
      if (
        (category === "Not specified" ||
          !cetCutoff ||
          cetCutoff === "Not specified") &&
        recommendations &&
        recommendations.length > 0
      ) {
        if (category === "Not specified") {
          category = recommendations[0].reservation_category || "Not specified";
        }
        if (!cetCutoff || cetCutoff === "Not specified") {
          cetCutoff = recommendations[0].cet_percentile || "Not specified";
        }
      }

      if (!cetCutoff) cetCutoff = "Not specified";

      if (
        (category === "Not specified" || cetCutoff === "Not specified") &&
        user?.email &&
        !isKarnataka
      ) {
        try {
          const capDetails = await apiService.fetchAICapDetails(
            user.accessToken,
            user.email,
          );
          if (capDetails.success && capDetails.data) {
            const data = capDetails.data;
            // Handle both flattened and nested structure if necessary, though fetchAICapDetails usually returns nested
            const credentialData = data.academic_credentials || data;

            if (credentialData.reservationCategory)
              category = credentialData.reservationCategory;

            const cet =
              credentialData.examPercentiles?.CET ||
              credentialData.examPercentiles?.cet_percentile;
            if (cet) cetCutoff = cet;

            // Map preferences
            const apiBranches =
              credentialData.preferences?.engineeringBranches || [];
            const apiCities = credentialData.preferences?.preferredCities || [];

            // Persist for future use to avoid repeated calls
            const updatedSession = {
              ...sessionData,
              reservationCategory: category,
              cetPercentile: cetCutoff,
              preferredStreams:
                apiBranches.length > 0
                  ? apiBranches
                  : sessionData.preferredStreams,
              preferredCities:
                apiCities.length > 0 ? apiCities : sessionData.preferredCities,
            };
            sessionStorage.setItem(
              "recommendationFormData",
              JSON.stringify(updatedSession),
            );
          }
        } catch (e) {
          console.error("Failed to fetch specific details for PDF", e);
        }
      }

      const branches =
        preferenceOverrides?.branches && preferenceOverrides.branches.length > 0
          ? preferenceOverrides.branches.slice(0, 3).join(", ")
          : sessionData.preferredStreams?.length > 0
            ? sessionData.preferredStreams.slice(0, 3).join(", ")
            : storedConfig?.academic_credentials?.preferences
                  ?.engineeringBranches?.length > 0
              ? storedConfig.academic_credentials.preferences.engineeringBranches
                  .slice(0, 3)
                  .join(", ")
              : "Not specified";

      const locations =
        preferenceOverrides?.cities && preferenceOverrides.cities.length > 0
          ? preferenceOverrides.cities.slice(0, 3).join(", ")
          : sessionData.preferredCities?.length > 0
            ? sessionData.preferredCities.slice(0, 3).join(", ")
            : storedConfig?.academic_credentials?.preferences?.preferredCities
                  ?.length > 0
              ? storedConfig.academic_credentials.preferences.preferredCities
                  .slice(0, 3)
                  .join(", ")
              : "Not specified";
      ("Not specified");

      // Display user details
      pdf.text(`Name: ${userName}`, margin + 5, yPosition);
      pdf.text(`Category: ${category}`, margin + 5, yPosition + 6);
      pdf.text(`Preferred Branches: ${branches}`, margin + 5, yPosition + 12);
      pdf.text(`Preferred Locations: ${locations}`, margin + 5, yPosition + 18);
      pdf.text(
        `${isKarnataka ? "CET Rank" : "CET Percentile"}: ${cetCutoff}`,
        margin + 5,
        yPosition + 24,
      );

      yPosition += 35;

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

      // Category breakdown (only on first page)
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
      pdf.text("College Recommendations", margin, yPosition);

      yPosition += 12;

      // Sort recommendations by category order and maintain continuous numbering
      const categoryOrder = ["Dream", "Reach", "Match", "Safety"];
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
        if (
          yPosition > pageHeight - 35 ||
          collegesOnCurrentPage >= maxCollegesPerPage
        ) {
          pdf.addPage();
          yPosition = addHeader(pdf.getNumberOfPages());
          collegesOnCurrentPage = 0;
        }

        // Professional college entry layout
        const entryHeight = 20;

        // Entry background with subtle border
        pdf.setFillColor(249, 250, 251);
        pdf.setDrawColor(229, 231, 235);
        pdf.rect(margin, yPosition, contentWidth, entryHeight, "FD");

        // Serial number
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(37, 99, 235);
        pdf.text(`${globalIndex}.`, margin + 5, yPosition + 8);

        // College name - clean, professional
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(31, 41, 55);
        const collegeName = rec.college.name || "Unknown College";
        const maxNameWidth = 100;
        const nameLines = pdf.splitTextToSize(collegeName, maxNameWidth);
        pdf.text(nameLines[0], margin + 15, yPosition + 8);

        // Course info on second line
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(107, 114, 128);
        const courseText = rec.course_name || "Course not specified";
        const choiceCode = (rec as any).choice_code
          ? ` (${(rec as any).choice_code})`
          : "";
        pdf.text(
          pdf.splitTextToSize(courseText + choiceCode, maxNameWidth)[0],
          margin + 15,
          yPosition + 14,
        );

        // Location
        pdf.setFontSize(9);
        pdf.setTextColor(107, 114, 128);
        const location = rec.college.city || "Location not specified";
        pdf.text(location, margin + 15, yPosition + 19);

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
          yPosition + 16,
        );

        // Cutoff percentile on the right
        if (rec.cutoff_percentile) {
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(67, 56, 202);
          pdf.text(
            `${rec.cutoff_percentile}${isKarnataka ? " Rank" : "%ile"}`,
            pageWidth - margin - 25,
            yPosition + 12,
          );
        }

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
        "These college recommendations are based on previous year's Round 1 cutoffs and your provided information. Please verify all details including current cutoffs, fees, course availability, and admission requirements directly with the respective institutions before submitting your application forms.";
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
            "Simply copy the colleges and branches exactly as they appear on this list, from top to bottom, into your official CAP application form.",
        },
        {
          title: "2. Dream & Reach First:",
          content:
            'The colleges at the top of this list are your "Dream" and "Reach" options. While your score may not match the last year cut-offs of these colleges, placing them first gives you the best opportunity to get into your most desired or highest-ranked institutions in case a position opens up in subsequent rounds.',
        },
        {
          title: "3. Match & Safety Next:",
          content:
            'The "Match" and "Safety" colleges are next. These are also sequenced based on your chances to get into the best college out of these. These options are strategically placed to ensure that even if you don\'t make it into top choices in Dream or Reach, you\'ll secure admission to the best possible college that fits your profile.',
        },
        {
          title: "4. No Guesswork, No Mistakes:",
          content:
            "This optimized sequence eliminates common errors and guesswork, ensuring you leverage every opportunity without missing out on a valuable seat.",
        },
      ];

      steps.forEach((step, index) => {
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
        "By following this recommended order, you're not just filling a form -you're executing a smart strategy for your engineering future. Go ahead, fill your form with confidence!";
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
            "These are colleges that perfectly align with your preferences but your percentile is below their typical cut-off. Challenging but worth including for your highest aspirations.",
        },
        {
          name: "Reach Colleges",
          chance: "50-70% chance",
          color: [234, 88, 12],
          bgColor: [255, 247, 237],
          borderColor: [254, 215, 170],
          description:
            "Ambitious but within grasp. Your percentile is close to their cut-off. You have a solid chance with these excellent options.",
        },
        {
          name: "Match Colleges",
          chance: "75-90% chance",
          color: [34, 197, 94],
          bgColor: [240, 253, 244],
          borderColor: [187, 247, 208],
          description:
            "Great fit for your profile. Your percentile is comfortably within their range. Very strong likelihood of admission.",
        },
        {
          name: "Safety Colleges",
          chance: ">90% chance",
          color: [59, 130, 246],
          bgColor: [239, 246, 255],
          borderColor: [191, 219, 254],
          description:
            "Highly probable admission. Your percentile is well above their cut-off. These provide peace of mind and guaranteed admission.",
        },
      ];

      categories.forEach((category, index) => {
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

        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(107, 114, 128);

        // Left: Company info
        pdf.text(
          "FutureBridge - Powered by SkillJourney | futurebridge.skilljourney.in",
          margin,
          pageHeight - 8,
        );

        // Right: Page number
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 8,
          { align: "right" },
        );
      }

      // Save the PDF
      const fileName = `College_Recommendations_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Downloaded Successfully!",
        description:
          "Your professional college recommendations report has been generated.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePDF,
    isGenerating,
  };
};
