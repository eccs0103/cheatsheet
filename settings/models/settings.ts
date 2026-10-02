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
	accents: boolean;
	tolerant: boolean;
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

	@Field(Boolean, { name: "accents" })
	accents: boolean;

	@Field(Boolean, { name: "tolerant" })
	tolerant: boolean;

	constructor();
	constructor(scheme: Scheme, incorrect: boolean, sensitive: boolean, skipping: boolean, accents: boolean, tolerant: boolean);
	constructor(scheme?: Scheme, incorrect?: boolean, sensitive?: boolean, skipping?: boolean, accents?: boolean, tolerant?: boolean) {
		if (scheme === undefined || incorrect === undefined || sensitive === undefined || skipping === undefined || accents === undefined || tolerant === undefined) {
			super();
			return;
		}

		super();
		this.scheme = scheme;
		this.incorrect = incorrect;
		this.sensitive = sensitive;
		this.skipping = skipping;
		this.accents = accents;
		this.tolerant = tolerant;
	}

	static get default(): Settings {
		return new Settings(Scheme.system, true, false, true, false, true);
	}

	apply(): void {
		const metaScheme = document.head.getElement(HTMLMetaElement, "meta[name=\"color-scheme\"]");
		metaScheme.content = this.scheme;
	}
}
//#endregion
