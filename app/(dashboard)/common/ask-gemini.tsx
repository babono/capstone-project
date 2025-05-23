import React, { useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Image from "next/image";
import iconDT from "../../../public/ic-dt.svg";
import logoGemini from "../../../public/logo-gemini.svg";
import TypeIt from "typeit-react";
import ReactMarkdown from "react-markdown";

type AskGeminiButtonProps = {
  chartId: string;
};

const AskGeminiButton: React.FC<AskGeminiButtonProps> = ({ chartId }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");

  const handleInterpret = async () => {
    setLoading(true);
    setInsight("");

    try {
      const chartElement = document.getElementById(chartId);

      if (!chartElement) {
        throw new Error("Chart element not found");
      }

      const imageData = await window.Plotly.toImage(chartElement, {
        format: "png",
        width: 800,
        height: 600,
      });

      const base64Image = imageData.split(",")[1];

      const response = await fetch("/api/insightImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chartImage: base64Image,
        }),
      });

      const data = await response.json();
      setInsight(data.response || "No insight available.");
    } catch (error) {
      console.error("Error fetching insight:", error);
      setInsight("Failed to fetch insight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-indigo-50 p-4 rounded-lg border-2 border-dt-primary">
      {loading && (
        <div className="flex justify-center">
          <Image src={iconDT} alt="Loading..." width={40} height={40} className="animate-spin" />
        </div>
      )}
      {insight && (
        <>
          <h3 className="text-xl font-bold text-black">
            Generated Insight
            <span className="pl-2 text-sm font-normal">
              by
              <Image
                src={logoGemini}
                alt="Gemini Logo"
                width={60}
                height={25}
                className="inline-block align-top ml-2"
              />
            </span>
          </h3>
          <TypeIt options={{ speed: 10, cursor: false }}>
            <ReactMarkdown>{insight}</ReactMarkdown>
          </TypeIt>
        </>
      )}
      {!loading && (
        <div className="flex justify-center">
          <button
            onClick={handleInterpret}
            className="bg-dt-primary text-white px-4 py-2 rounded hover:bg-indigo-700 transition flex items-center"
          >
            <AutoAwesomeIcon className="mr-2" /> Ask Gemini for Insight
          </button>
        </div>
      )}
    </div>
  );
};

export default AskGeminiButton;
