"use strict";

import "adaptive-extender/web";
import { type ReactElement, type RefObject, memo, useEffect, useRef, useState } from "react";
import { type Question } from "../../library/models/question.js";
import { type Keys } from "./keys.js";
import { QuestionEditor } from "./question-editor.js";

//#region Question block
export interface QuestionBlockProps {
	questions: readonly Question[];
	start: number;
	end: number;
	keys: Keys;
	appended: Question | null;
	onChange(): void;
	onRemove(question: Question): void;
}

// A run of questions that mounts once it nears the screen and then stays mounted, so a large sheet opens with only its first block built
export const QuestionBlock = memo(function QuestionBlock({ questions, start, end, keys, appended, onChange, onRemove }: QuestionBlockProps): ReactElement {
	const [revealed, setRevealed] = useState<boolean>(start === 0);
	const refSection: RefObject<HTMLElement | null> = useRef(null);
	const slice = questions.slice(start, end);

	// A question just added at the bottom must be built at once, so it can take the focus
	if (!revealed && appended !== null && slice.includes(appended)) setRevealed(true);

	useEffect(() => {
		const section = refSection.current;
		if (section === null || revealed) return;
		const observer = new IntersectionObserver((entries) => {
			if (!entries.some(entry => entry.isIntersecting)) return;
			setRevealed(true);
		}, { root: section.getClosest(HTMLElement, "main"), rootMargin: "100% 0px" });
		observer.observe(section);
		return () => observer.disconnect();
	}, [revealed]);

	return (
		<section ref={refSection} className="block flex column with-block-gap">
			{revealed && slice.map((question, offset) => <QuestionEditor key={keys.of(question)} number={start + offset + 1} question={question} keys={keys} focused={question === appended} onChange={onChange} onRemove={onRemove} />)}
		</section>
	);
});
//#endregion
