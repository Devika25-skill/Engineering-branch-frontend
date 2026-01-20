import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useRecommendationTypeDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSelectType = (type: "first-year" | "direct-second-year") => {
    if (type === "direct-second-year") {
      navigate("/diploma-recommendations/steps");
    } else if (type === "first-year") {
      const activeRoundTab = localStorage.getItem("activeRoundTab");
      const hasCachedData = sessionStorage.getItem("cachedRecommendations");

      if (activeRoundTab && hasCachedData) {
        navigate("/recommendations/results");
      } else {
        navigate("/recommendations");
      }
    }
    closeDialog();
  };

  return {
    isOpen,
    openDialog,
    closeDialog,
    handleSelectType,
  };
};
