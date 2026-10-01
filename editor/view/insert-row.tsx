"use strict";

import "adaptive-extender/web";
import { type ReactElement, type SubmitEvent, useState } from "react";

//#region Insert row
export interface InsertRowProps {
	placeholder: string;
	title: string;
	small: boolean;
	onInsert(text: string): void;
}

export function InsertRow({ placeholder, title, small, onInsert }: InsertRowProps): ReactElement {
	const [text, setText] = useState<string>(String.empty);
	const blank = String.isWhitespace(text);

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
		event.preventDefault();
		if (blank) return;
		onInsert(text.trim());
		setText(String.empty);
	};

	return (
		<form className="insert contents" onSubmit={handleSubmit}>
			<input type="text" placeholder={placeholder} className="depth rounded with-padding" value={text} onChange={(event) => setText(event.currentTarget.value)} />
			<button type="submit" className="add flex alt-center" title={title} disabled={blank}>
				<span className={small ? "icon in-line" : "icon with-padding small-padding"}>{title}</span>
			</button>
		</form>
	);
}
//#endregion
