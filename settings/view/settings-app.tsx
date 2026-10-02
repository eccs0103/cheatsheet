"use strict";

import "adaptive-extender/web";
import { Enum } from "adaptive-extender/web";
import { type ReactElement, useReducer } from "react";
import { Scheme } from "../models/settings.js";
import { type SettingsService } from "../services/settings-service.js";
import { OptionToggle } from "./option-toggle.js";

//#region Settings app
export interface SettingsAppProps {
	settings: SettingsService;
}

export function SettingsApp({ settings }: SettingsAppProps): ReactElement {
	const [, refresh] = useReducer((version: number) => version + 1, 0);
	const { content } = settings;

	const update = async (): Promise<void> => {
		refresh();
		try {
			await settings.save();
		} catch (reason) {
			window.alert(Error.from(reason).message);
		}
	};

	const rescheme = (value: string): void => {
		content.scheme = Enum.Of(Scheme).import(value, "scheme");
		content.apply();
		void update();
	};

	const reset = (): void => {
		if (!window.confirm("The settings will be reset to their defaults. Are you sure?")) return;
		settings.reset();
		settings.content.apply();
		refresh();
	};

	return (
		<>
			<header className="layer rounded in-top">
				<a id="return" href="../library/" className="with-padding flex alt-center with-gap" title="Return">
					<span className="icon with-padding small-padding">Return</span>
				</a>
				<h3>Settings</h3>
			</header>
			<main className="with-padding flex column with-block-gap">
				<section className="layer rounded with-padding large-padding flex column">
					<h2>View</h2>
					<section className="option">
						<h4 className="title">Theme</h4>
						<span className="definition description">Overall appearance and style of the interface.</span>
						<select id="scheme" className="value depth rounded with-padding" value={content.scheme} onChange={(event) => rescheme(event.currentTarget.value)}>
							<option value={Scheme.system}>System</option>
							<option value={Scheme.light}>Light</option>
							<option value={Scheme.dark}>Dark</option>
						</select>
					</section>
				</section>
				<section className="layer rounded with-padding large-padding flex column">
					<h2>Search</h2>
					<OptionToggle id="incorrect" title="Incorrect cases" definition="Controls the display of incorrect cases during searches." checked={content.incorrect} onToggle={(checked) => { content.incorrect = checked; void update(); }} />
					<OptionToggle id="sensitive" title="Case sensitive" definition="Management of character case sensitivity in search queries." checked={content.sensitive} onToggle={(checked) => { content.sensitive = checked; void update(); }} />
					<OptionToggle id="skipping" title="Skip words" definition="Allows skipping any words during searches." checked={content.skipping} onToggle={(checked) => { content.skipping = checked; void update(); }} />
				</section>
				<section className="layer rounded with-padding large-padding flex column">
					<h2>Advanced</h2>
					<section className="option">
						<h4 className="title">Reset settings</h4>
						<span className="definition description">Reverting all configurations to their default states.</span>
						<button id="reset" type="button" className="value rounded depth alert with-padding flex alt-center with-gap" title="Reset settings" onClick={reset}>
							<span className="icon in-line">Reset</span>
							<span>Reset</span>
						</button>
					</section>
				</section>
			</main>
		</>
	);
}
//#endregion
