"use strict";

import "adaptive-extender/web";

//#region File download
export class FileDownload {
	static save(files: readonly File[]): void {
		for (const file of files) {
			FileDownload.#save(file);
		}
	}

	static #save(file: File): void {
		const url = URL.createObjectURL(file);
		const aDownload = document.createElement("a");
		aDownload.href = url;
		aDownload.download = file.name;
		aDownload.click();
		URL.revokeObjectURL(url);
	}
}
//#endregion
