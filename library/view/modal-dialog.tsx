"use strict";

import "adaptive-extender/web";
import { type MouseEvent, type ReactElement, type ReactNode, type RefObject, useEffect, useRef } from "react";

//#region Modal dialog
export interface ModalDialogProps {
	id: string;
	open: boolean;
	onClose(): void;
	children: ReactNode;
}

export function ModalDialog({ id, open, onClose, children }: ModalDialogProps): ReactElement {
	const refDialog: RefObject<HTMLDialogElement | null> = useRef(null);

	useEffect(() => {
		const dialog = refDialog.current;
		if (dialog === null) return;
		if (dialog.open === open) return;
		if (open) {
			dialog.showModal();
			return;
		}
		dialog.close();
	}, [open]);

	const handleClick = (event: MouseEvent<HTMLDialogElement>): void => {
		if (event.target !== event.currentTarget) return;
		onClose();
	};

	return (
		<dialog id={id} ref={refDialog} className="layer rounded with-padding flex column" onClick={handleClick} onClose={onClose}>
			{children}
		</dialog>
	);
}
//#endregion
