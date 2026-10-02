"use strict";

import "adaptive-extender/web";
import { type MouseEvent, type ReactElement } from "react";
import { useModal } from "./use-modal.js";

//#region Share dialog
export interface ShareDialogProps {
	open: boolean;
	onConfirm(): void;
	onClose(): void;
}

export function ShareDialog({ open, onConfirm, onClose }: ShareDialogProps): ReactElement {
	const refDialog = useModal(open);

	const dismiss = (event: MouseEvent<HTMLDialogElement>): void => {
		if (event.target !== event.currentTarget) return;
		onClose();
	};

	return (
		<dialog id="share" ref={refDialog} className="layer rounded flex column" onClick={dismiss} onClose={onClose}>
			<div className="layer with-padding large-padding flex alt-center with-gap">
				<h3>Share sheets</h3>
				<button id="close-share" type="button" className="flex alt-center" title="Close (Esc)" onClick={onClose}>
					<span className="icon with-padding small-padding">Close</span>
				</button>
			</div>
			<div className="flex column with-inline-padding large-padding">
				<section className="option">
					<h4 className="title">Share as text</h4>
					<span className="definition description">Your browser does not allow sharing .json files. Share the sheets as .txt files instead? They can be added back the same way.</span>
					<button id="share-plain" type="button" className="value rounded depth with-padding flex alt-center with-gap" onClick={onConfirm}>
						<span className="icon in-line">Share</span>
						<span>Share as .txt</span>
					</button>
				</section>
			</div>
		</dialog>
	);
}
//#endregion
