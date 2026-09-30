"use strict";

import "adaptive-extender/web";
import { type ReactElement } from "react";

//#region Option toggle
export interface OptionToggleProps {
	id: string;
	title: string;
	definition: string;
	checked: boolean;
	onToggle(checked: boolean): void;
}

export function OptionToggle({ id, title, definition, checked, onToggle }: OptionToggleProps): ReactElement {
	return (
		<section className="option">
			<h4 className="title">{title}</h4>
			<dfn className="definition">{definition}</dfn>
			<input id={id} type="checkbox" hidden checked={checked} onChange={(event) => onToggle(event.currentTarget.checked)} />
			<label htmlFor={id} role="checkbox" className="value toggle depth">
				<span className="knob layer"></span>
			</label>
		</section>
	);
}
//#endregion
