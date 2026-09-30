"use strict";

import "adaptive-extender/web";

//#region DOM builder
export class DOMBuilder {
	static newRow(parent: Element): HTMLLabelElement {
		const liRow = parent.appendChild(document.createElement("li"));
		const labelRow = liRow.appendChild(document.createElement("label"));
		labelRow.classList.add("note", "layer", "rounded");
		return labelRow;
	}

	static newCheckbox(parent: Element, value: string): HTMLInputElement {
		const inputCheckbox = parent.appendChild(document.createElement("input"));
		inputCheckbox.type = "checkbox";
		inputCheckbox.hidden = true;
		inputCheckbox.value = value;
		return inputCheckbox;
	}

	static newLink(parent: Element, href: string): HTMLAnchorElement {
		const aLink = parent.appendChild(document.createElement("a"));
		aLink.classList.add("sheet");
		aLink.role = "button";
		aLink.href = href;
		return aLink;
	}

	static newPicture(parent: Element): HTMLElement {
		const spanPicture = parent.appendChild(document.createElement("span"));
		spanPicture.classList.add("sheet-icon", "with-padding");
		return spanPicture;
	}

	static newIcon(parent: Element): HTMLElement {
		const spanIcon = parent.appendChild(document.createElement("span"));
		spanIcon.classList.add("icon", "with-padding", "small-padding");
		return spanIcon;
	}

	static newTitle(parent: Element, text: string): HTMLElement {
		const spanTitle = parent.appendChild(document.createElement("span"));
		spanTitle.classList.add("sheet-title");
		spanTitle.textContent = text;
		return spanTitle;
	}

	static newTime(parent: Element, date: Readonly<Date>): HTMLTimeElement {
		const timeDate = parent.appendChild(document.createElement("time"));
		timeDate.classList.add("sheet-date");
		timeDate.dateTime = date.toISOString();
		timeDate.textContent = date.toLocaleString();
		return timeDate;
	}

	static newDownload(file: File): void {
		const url = URL.createObjectURL(file);
		const aDownload = document.createElement("a");
		aDownload.href = url;
		aDownload.download = file.name;
		aDownload.click();
		URL.revokeObjectURL(url);
	}
}
//#endregion
