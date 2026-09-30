"use strict";

import "adaptive-extender/web";
import { type ReactElement } from "react";
import { type Poll } from "../../library/models/poll.js";
import { type Query } from "../services/query.js";

//#region Poll card
export interface PollCardProps {
	poll: Poll;
	query: Query;
	incorrect: boolean;
}

export function PollCard({ poll, query, incorrect }: PollCardProps): ReactElement {
	const { question } = poll;
	return (
		<article className="poll layer rounded with-padding with-inline-gap" hidden={!query.matches(question)}>
			<span className="question">{query.split(question).map((segment, index) => segment.toElement(index))}</span>
			<ul className="cases">
				{poll.visible(incorrect).map((item, index) => (
					<li key={index} className="case with-inline-gap">
						<span className={item.correctness ? "highlight" : "alert"}>{item.text}</span>
					</li>
				))}
			</ul>
		</article>
	);
}
//#endregion
