
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Recommendations = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to steps immediately
    const data=sessionStorage.getItem("cachedRecommendations")
    if(data){
      navigate('/recommendations/results', { replace: true });
    }
    else{
      navigate('/recommendations/steps', { replace: true });
    }
  }, [navigate]);

  return null;
};

export default Recommendations;
