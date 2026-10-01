"use strict";

import "adaptive-extender/web";
import { type ChangeEvent, type ReactElement } from "react";
import { type Case } from "../../library/models/case.js";

//#region Case editor
export interface CaseEditorProps {
	id: string;
	item: Case;
	onChange(): void;
	onRemove(item: Case): void;
}

export function CaseEditor({ id, item, onChange, onRemove }: CaseEditorProps): ReactElement {
	const handleToggle = (): void => {
		item.toggle();
		onChange();
	};

	const handleText = (event: ChangeEvent<HTMLInputElement>): void => {
		item.text = event.currentTarget.value;
		onChange();
	};

	const handleRemove = (): void => {
		if (!window.confirm("The case cannot be restored. Are you sure?")) return;
		onRemove(item);
	};

	return (
		<>
			<div className="case">
				<input id={id} type="checkbox" hidden checked={item.correctness} onChange={handleToggle} />
				<label htmlFor={id} role="checkbox" className="check flex alt-center" title="Mark as correct">
					<span className="icon in-line">Mark</span>
				</label>
				<input type="text" required placeholder="Case" className="with-padding" value={item.text} onChange={handleText} />
			</div>
			<button type="button" className="remove flex alt-center" title="Delete case" onClick={handleRemove}>
				<span className="icon in-line">Delete case</span>
			</button>
		</>
	);
}
//#endregion
