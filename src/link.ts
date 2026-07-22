export interface PullRequestReference {
	owner?: string;
	repo: string;
	number: string;
}

export type LinkResult =
	| { status: 'ok'; markdown: string }
	| { status: 'invalid' }
	| { status: 'missing-owner' };

const REFERENCE_PATTERN =
	/^(?:(?<owner>[\w.-]+)\/)?(?<repo>[\w.-]+)#(?<number>\d+)$/;

export function parsePullRequestReference(
	text: string,
): PullRequestReference | null {
	const match = REFERENCE_PATTERN.exec(text.trim());
	if (!match?.groups) {
		return null;
	}
	const { owner, repo, number } = match.groups;
	if (!repo || !number) {
		return null;
	}
	return owner ? { owner, repo, number } : { repo, number };
}

export function normalizeOwner(owner: string): string {
	return owner.trim().replace(/^\/+/, '').replace(/\/+$/, '').trim();
}

export function buildPullRequestLink(
	selection: string,
	defaultOwner: string,
): LinkResult {
	const label = selection.trim();
	const reference = parsePullRequestReference(label);
	if (!reference) {
		return { status: 'invalid' };
	}
	const owner = reference.owner ?? normalizeOwner(defaultOwner);
	if (!owner) {
		return { status: 'missing-owner' };
	}
	const url = `https://github.com/${owner}/${reference.repo}/pull/${reference.number}`;
	return { status: 'ok', markdown: `[${label}](${url})` };
}
