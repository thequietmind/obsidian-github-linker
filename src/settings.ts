import {
	App,
	PluginSettingTab,
	Setting,
	SettingDefinitionItem,
} from 'obsidian';
import type { OwnerLabelMode } from './link';
import type GitHubPrLinkerPlugin from './main';

export interface GitHubPrLinkerSettings {
	defaultOwner: string;
	ownerLabelMode: OwnerLabelMode;
}

export const DEFAULT_SETTINGS: GitHubPrLinkerSettings = {
	defaultOwner: '',
	ownerLabelMode: 'hide',
};

const OWNER_SETTING = {
	name: 'Default GitHub owner',
	desc: 'GitHub username or organization used when the selected reference does not include an owner, e.g. repo#123.',
	placeholder: 'Enter your username',
};

const OWNER_LABEL_SETTING = {
	name: 'Owner in link label',
	desc: 'Whether the link label includes the owner when linking repo/pull/123 or a GitHub pull request URL. References like owner/repo#123 always keep your selected text as the label.',
	options: {
		hide: 'Hide owner',
		show: 'Show owner',
		auto: 'Show owner only when it differs from the default owner',
	} satisfies Record<OwnerLabelMode, string>,
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
			{
				name: OWNER_LABEL_SETTING.name,
				desc: OWNER_LABEL_SETTING.desc,
				control: {
					type: 'dropdown',
					key: 'ownerLabelMode',
					options: OWNER_LABEL_SETTING.options,
					defaultValue: DEFAULT_SETTINGS.ownerLabelMode,
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

		new Setting(containerEl)
			.setName(OWNER_LABEL_SETTING.name)
			.setDesc(OWNER_LABEL_SETTING.desc)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(OWNER_LABEL_SETTING.options)
					.setValue(this.plugin.settings.ownerLabelMode)
					.onChange(async (value) => {
						this.plugin.settings.ownerLabelMode =
							value as OwnerLabelMode;
						await this.plugin.saveSettings();
					}),
			);
	}
}
