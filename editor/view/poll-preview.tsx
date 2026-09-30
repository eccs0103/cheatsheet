"use strict";

import "adaptive-extender/web";
import { type ReactElement } from "react";
import { type Poll } from "../../library/models/poll.js";

//#region Poll preview
export interface PollPreviewProps {
	poll: Poll;
}

export function PollPreview({ poll }: PollPreviewProps): ReactElement {
	return (
		<article className="poll layer rounded with-padding with-inline-gap">
			<span className="question">{poll.question}</span>
			<ul className="cases">
				{poll.cases.map((item, index) => (
					<li key={index} className="case with-inline-gap">
						<span className={item.correctness ? "highlight" : "alert"}>{item.text}</span>
					</li>
				))}
			</ul>
		</article>
	);
}
//#endregion
