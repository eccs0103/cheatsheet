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
	scheme: Scheme;

	@Field(Boolean, { name: "incorrect" })
	incorrect: boolean;

	@Field(Boolean, { name: "sensitive" })
	sensitive: boolean;

	@Field(Boolean, { name: "skipping" })
	skipping: boolean;

	constructor();
	constructor(scheme: Scheme, incorrect: boolean, sensitive: boolean, skipping: boolean);
	constructor(scheme?: Scheme, incorrect?: boolean, sensitive?: boolean, skipping?: boolean) {
		if (scheme === undefined || incorrect === undefined || sensitive === undefined || skipping === undefined) {
			super();
			return;
		}

		super();
		this.scheme = scheme;
		this.incorrect = incorrect;
		this.sensitive = sensitive;
		this.skipping = skipping;
	}

	apply(): void {
		const metaScheme = document.head.getElement(HTMLMetaElement, "meta[name=\"color-scheme\"]");
		metaScheme.content = this.scheme;
	}
}
//#endregion
