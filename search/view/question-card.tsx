"use strict";

import "adaptive-extender/web";
import { type ReactElement } from "react";
import { type Question } from "../../library/models/question.js";

//#region Question card
export interface QuestionCardProps {
	number: number;
	question: Question;
	incorrect: boolean;
}

export function QuestionCard({ number, question, incorrect }: QuestionCardProps): ReactElement {
	return (
		<>
			<span className="number description">{number}</span>
			<span className="text">{question.text}</span>
			<ul className="answers flex column with-block-gap small-gap">
				{question.visible(incorrect).map((answer, index) => (
					<li key={index} className={answer.correct ? "answer correct highlight flex alt-center" : "answer incorrect description flex alt-center"}>
						<span className="icon with-padding small-padding">{answer.correct ? "Correct" : "Incorrect"}</span>
						<span className="text">{answer.text}</span>
					</li>
				))}
			</ul>
		</>
	);
}
//#endregion
