import { App, PluginSettingTab, Setting } from 'obsidian';
import type GitHubPrLinkerPlugin from './main';

export interface GitHubPrLinkerSettings {
	defaultOwner: string;
}

export const DEFAULT_SETTINGS: GitHubPrLinkerSettings = {
	defaultOwner: '',
};

export class GitHubPrLinkerSettingTab extends PluginSettingTab {
	plugin: GitHubPrLinkerPlugin;

	constructor(app: App, plugin: GitHubPrLinkerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Default GitHub owner')
			.setDesc(
				'GitHub username or organization used when the selected reference does not include an owner, e.g. repo#123.',
			)
			.addText((text) =>
				text
					.setPlaceholder('Enter your username')
					.setValue(this.plugin.settings.defaultOwner)
					.onChange(async (value) => {
						this.plugin.settings.defaultOwner = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
