import { Editor, Notice, Plugin } from 'obsidian';
import { buildPullRequestLink } from './link';
import {
	DEFAULT_SETTINGS,
	GitHubPrLinkerSettings,
	GitHubPrLinkerSettingTab,
} from './settings';

export default class GitHubPrLinkerPlugin extends Plugin {
	settings!: GitHubPrLinkerSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new GitHubPrLinkerSettingTab(this.app, this));

		this.addCommand({
			id: 'link-pull-request',
			name: 'Link GitHub pull request',
			editorCallback: (editor: Editor) => this.linkPullRequest(editor),
		});
	}

	private linkPullRequest(editor: Editor) {
		const selection = editor.getSelection().trim();
		if (!selection) {
			new Notice(
				'Select a GitHub pull request reference such as repo#123.',
			);
			return;
		}

		const result = buildPullRequestLink(
			selection,
			this.settings.defaultOwner,
			this.settings.ownerLabelMode,
		);
		if (result.status === 'invalid') {
			new Notice(
				'Selection is not a GitHub pull request reference such as repo#123, owner/repo#123, repo/pull/123, or a github.com pull request URL.',
			);
			return;
		}
		if (result.status === 'missing-owner') {
			new Notice(
				'Configure a default GitHub owner or include the owner, e.g. owner/repo#123 or owner/repo/pull/123.',
			);
			return;
		}

		editor.replaceSelection(result.markdown);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<GitHubPrLinkerSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
