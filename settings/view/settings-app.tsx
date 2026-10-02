"use strict";

import "adaptive-extender/web";
import { Enum } from "adaptive-extender/web";
import { type ReactElement, useReducer } from "react";
import { Matching, Scheme } from "../models/settings.js";
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

	const rematch = (value: string): void => {
		content.matching = Enum.Of(Matching).import(value, "matching");
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
					<section className="option">
						<h4 className="title">Word matching</h4>
						<span className="definition description">How the typed words must appear in a question.</span>
						<select id="matching" className="value depth rounded with-padding" value={content.matching} onChange={(event) => rematch(event.currentTarget.value)}>
							<option value={Matching.any}>Any order</option>
							<option value={Matching.order}>Words in order</option>
							<option value={Matching.phrase}>Exact phrase</option>
						</select>
					</section>
					<OptionToggle id="tolerant" title="Typo tolerance" definition="Words of five or more letters still match with one typo." checked={content.tolerant} onToggle={(checked) => { content.tolerant = checked; void update(); }} />
					<OptionToggle id="sensitive" title="Case sensitive" definition="Distinguishes uppercase and lowercase letters." checked={content.sensitive} onToggle={(checked) => { content.sensitive = checked; void update(); }} />
					<OptionToggle id="accents" title="Accent sensitive" definition="Distinguishes letters with accents, such as é and e." checked={content.accents} onToggle={(checked) => { content.accents = checked; void update(); }} />
					<OptionToggle id="incorrect" title="Incorrect answers" definition="Shows the incorrect answers next to the correct ones." checked={content.incorrect} onToggle={(checked) => { content.incorrect = checked; void update(); }} />
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
