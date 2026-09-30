"use strict";

import "adaptive-extender/web";
import { Model, Field, Enum } from "adaptive-extender/web";

//#region Scheme
export enum Scheme {
	system = "system",
	light = "light",
	dark = "dark",
}
//#endregion
//#region Settings
export interface SettingsScheme {
	scheme: Scheme;
	incorrect: boolean;
	sensitive: boolean;
	skipping: boolean;
}

export class Settings extends Model {
	@Field(Enum.Of(Scheme), { name: "scheme" })
	scheme: Scheme = Scheme.system;

	@Field(Boolean, { name: "incorrect" })
	incorrect: boolean = false;

	@Field(Boolean, { name: "sensitive" })
	sensitive: boolean = false;

	@Field(Boolean, { name: "skipping" })
	skipping: boolean = false;

	apply(): void {
		const metaScheme = document.head.getElement(HTMLMetaElement, "meta[name=\"color-scheme\"]");
		metaScheme.content = this.scheme;
	}
}
//#endregion
