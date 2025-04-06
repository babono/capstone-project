import React from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Image from "next/image";
import iconDT from "../../../public/ic-dt.svg";
import logoGemini from "../../../public/logo-gemini.svg";
import TypeIt from "typeit-react";
import ReactMarkdown from "react-markdown";

type AskGeminiButtonProps = {
  loading: boolean;
  insight: string;
  onAskGemini: () => void;
};

const AskGeminiButton: React.FC<AskGeminiButtonProps> = ({
  loading,
  insight,
  onAskGemini,
}) => {
  return (
    <div className="mt-4 bg-indigo-50 p-4 rounded-lg border-2 border-dt-primary">
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
      <div className="flex justify-center">
        <button
          onClick={onAskGemini}
          className="bg-dt-primary text-white px-4 py-2 rounded mt-2 hover:bg-indigo-700 transition flex items-center"
        >
          <AutoAwesomeIcon className="mr-2" /> Ask Gemini for Insight
        </button>
      </div>
    </div>
  );
};

export default AskGeminiButton;
