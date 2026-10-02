"use strict";

import "adaptive-extender/web";
import { type ReactElement } from "react";
import { type Poll } from "../../library/models/poll.js";
import { type Query } from "../services/query.js";

//#region Poll card
export interface PollCardProps {
	number: number;
	poll: Poll;
	query: Query;
	incorrect: boolean;
	hidden: boolean;
}

export function PollCard({ number, poll, query, incorrect, hidden }: PollCardProps): ReactElement {
	const { question } = poll;
	return (
		<article className="poll layer rounded with-padding" hidden={hidden}>
			<span className="number description">{number}</span>
			<span className="question">{query.split(question).map((segment, index) => segment.toElement(index))}</span>
			<ul className="cases flex column with-block-gap small-gap">
				{poll.visible(incorrect).map((item, index) => (
					<li key={index} className={item.correctness ? "case correct highlight flex alt-center" : "case incorrect description flex alt-center"}>
						<span className="icon with-padding small-padding">{item.correctness ? "Correct" : "Incorrect"}</span>
						<span className="text">{item.text}</span>
					</li>
				))}
			</ul>
		</article>
	);
}
//#endregion
