// @ts-nocheck
import { Plot } from "@/app/constants";
import AskGeminiButton from "../common/ask-gemini";

const LeadTimeFigure = ({ title, chartId, data, layout }) => {
	return (
		<div className="mt-8">
			<p className="text-l font-semibold">{title}</p>
			<Plot divId={chartId} data={data} layout={layout} style={{ width: "100%", height: "125%" }} />
			<br />
			{chartId && <AskGeminiButton chartId={chartId} />}
		</div>
	);
};

export default LeadTimeFigure;
