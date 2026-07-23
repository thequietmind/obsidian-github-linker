import {
	App,
	PluginSettingTab,
	Setting,
	SettingDefinitionItem,
} from 'obsidian';
import type GitHubPrLinkerPlugin from './main';

export interface GitHubPrLinkerSettings {
	defaultOwner: string;
}

export const DEFAULT_SETTINGS: GitHubPrLinkerSettings = {
	defaultOwner: '',
};

const OWNER_SETTING = {
	name: 'Default GitHub owner',
	desc: 'GitHub username or organization used when the selected reference does not include an owner, e.g. repo#123.',
	placeholder: 'Enter your username',
};

export class GitHubPrLinkerSettingTab extends PluginSettingTab {
	plugin: GitHubPrLinkerPlugin;

	constructor(app: App, plugin: GitHubPrLinkerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: OWNER_SETTING.name,
				desc: OWNER_SETTING.desc,
				control: {
					type: 'text',
					key: 'defaultOwner',
					placeholder: OWNER_SETTING.placeholder,
					defaultValue: DEFAULT_SETTINGS.defaultOwner,
				},
			},
		];
	}

	// Fallback for Obsidian versions older than 1.13.0, which do not
	// support getSettingDefinitions(). Not called on newer versions.
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName(OWNER_SETTING.name)
			.setDesc(OWNER_SETTING.desc)
			.addText((text) =>
				text
					.setPlaceholder(OWNER_SETTING.placeholder)
					.setValue(this.plugin.settings.defaultOwner)
					.onChange(async (value) => {
						this.plugin.settings.defaultOwner = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
