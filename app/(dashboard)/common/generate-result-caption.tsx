import { GENERATE_RESULT_CAPTIONS } from "@/app/constants";

type GenerateResultCaptionProps = {
  message: GENERATE_RESULT_CAPTIONS;
};

const GenerateResultCaption: React.FC<GenerateResultCaptionProps> = ({ message }) => {
  return (
    <p className="text-gray-500 mt-4 flex items-center justify-center">{message}</p>
  );
};

export default GenerateResultCaption;
