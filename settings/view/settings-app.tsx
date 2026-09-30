"use strict";

import "adaptive-extender/web";
import { Enum } from "adaptive-extender/web";
import { type ReactElement, useState } from "react";
import { Scheme } from "../models/settings.js";
import { type SettingsService } from "../services/settings-service.js";
import { OptionToggle } from "./option-toggle.js";

//#region Settings app
export interface SettingsAppProps {
	settings: SettingsService;
}

export function SettingsApp({ settings }: SettingsAppProps): ReactElement {
	const [scheme, setScheme] = useState<Scheme>(() => settings.content.scheme);
	const [incorrect, setIncorrect] = useState<boolean>(() => settings.content.incorrect);
	const [sensitive, setSensitive] = useState<boolean>(() => settings.content.sensitive);
	const [skipping, setSkipping] = useState<boolean>(() => settings.content.skipping);

	const handleScheme = async (value: string): Promise<void> => {
		const { content } = settings;
		content.scheme = Enum.Of(Scheme).import(value, "scheme");
		content.apply();
		setScheme(content.scheme);
		await settings.save();
	};

	const handleIncorrect = async (checked: boolean): Promise<void> => {
		settings.content.incorrect = checked;
		setIncorrect(checked);
		await settings.save();
	};

	const handleSensitive = async (checked: boolean): Promise<void> => {
		settings.content.sensitive = checked;
		setSensitive(checked);
		await settings.save();
	};

	const handleSkipping = async (checked: boolean): Promise<void> => {
		settings.content.skipping = checked;
		setSkipping(checked);
		await settings.save();
	};

	const handleReset = (): void => {
		if (!window.confirm("The settings will be reset to their defaults. Are you sure?")) return;
		settings.reset();
		const { content } = settings;
		content.apply();
		setScheme(content.scheme);
		setIncorrect(content.incorrect);
		setSensitive(content.sensitive);
		setSkipping(content.skipping);
	};

	return (
		<>
			<header className="layer rounded in-top">
				<a id="return" href="../library/" className="with-padding flex alt-center with-gap" title="Return">
					<span className="icon with-padding small-padding">Return</span>
				</a>
			</header>
			<main className="with-padding flex column with-block-gap">
				<section className="layer rounded with-padding flex column">
					<h2>View</h2>
					<section className="option">
						<h4 className="title">Theme</h4>
						<dfn className="definition">Overall appearance and style of the interface.</dfn>
						<select id="scheme" className="value depth rounded with-padding" value={scheme} onChange={(event) => handleScheme(event.currentTarget.value)}>
							<option value={Scheme.system}>System</option>
							<option value={Scheme.light}>Light</option>
							<option value={Scheme.dark}>Dark</option>
						</select>
					</section>
				</section>
				<section className="layer rounded with-padding flex column">
					<h2>Search</h2>
					<OptionToggle id="incorrect" title="Incorrect cases" definition="Controls the display of incorrect cases during searches." checked={incorrect} onToggle={handleIncorrect} />
					<OptionToggle id="sensitive" title="Case sensitive" definition="Management of character case sensitivity in search queries." checked={sensitive} onToggle={handleSensitive} />
					<OptionToggle id="skipping" title="Skip words" definition="Allows skipping any words during searches." checked={skipping} onToggle={handleSkipping} />
				</section>
				<section className="layer rounded with-padding flex column">
					<h2>Advanced</h2>
					<section className="option">
						<h4 className="title">Reset settings</h4>
						<dfn className="definition">Reverting all configurations to their default states.</dfn>
						<button id="reset" type="button" className="value rounded warn-background flex alt-center with-gap" title="Reset settings" onClick={handleReset}>
							<span className="with-padding flex">
								<span className="icon with-padding small-padding">Reset</span>
							</span>
						</button>
					</section>
				</section>
			</main>
		</>
	);
}
//#endregion
