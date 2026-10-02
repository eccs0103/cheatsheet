"use strict";

import "adaptive-extender/web";
import { type RefObject, useEffect, useRef } from "react";

//#region Use modal
export function useModal(open: boolean): RefObject<HTMLDialogElement | null> {
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

	return refDialog;
}
//#endregion
