export interface PullRequestReference {
	owner?: string;
	repo: string;
	number: string;
}

export type LinkResult =
	| { status: 'ok'; markdown: string }
	| { status: 'invalid' }
	| { status: 'missing-owner' };

export type OwnerLabelMode = 'hide' | 'auto' | 'show';

const REFERENCE_PATTERN =
	/^(?:(?<owner>[\w.-]+)\/)?(?<repo>[\w.-]+)#(?<number>\d+)$/;
const URL_PATTERN =
	/^https?:\/\/(?:www\.)?github\.com\/(?<owner>[\w.-]+)\/(?<repo>[\w.-]+)\/pull\/(?<number>\d+)(?:[/?#]\S*)?$/i;
const PATH_PATTERN =
	/^(?:(?<owner>[\w.-]+)\/)?(?<repo>[\w.-]+)\/pull\/(?<number>\d+)$/;

function referenceFromMatch(
	match: RegExpExecArray | null,
): PullRequestReference | null {
	if (!match?.groups) {
		return null;
	}
	const { owner, repo, number } = match.groups;
	if (!repo || !number) {
		return null;
	}
	return owner ? { owner, repo, number } : { repo, number };
}

export function parsePullRequestReference(
	text: string,
): PullRequestReference | null {
	return referenceFromMatch(REFERENCE_PATTERN.exec(text.trim()));
}

export function parsePullRequestPath(
	text: string,
): PullRequestReference | null {
	const trimmed = text.trim();
	return (
		referenceFromMatch(URL_PATTERN.exec(trimmed)) ??
		referenceFromMatch(PATH_PATTERN.exec(trimmed))
	);
}

export function normalizeOwner(owner: string): string {
	return owner.trim().replace(/^\/+/, '').replace(/\/+$/, '').trim();
}

function formatPathLabel(
	reference: PullRequestReference,
	resolvedOwner: string,
	defaultOwner: string,
	mode: OwnerLabelMode,
): string {
	const short = `${reference.repo}#${reference.number}`;
	if (mode === 'show') {
		return `${resolvedOwner}/${short}`;
	}
	if (
		mode === 'auto' &&
		reference.owner &&
		reference.owner.toLowerCase() !==
			normalizeOwner(defaultOwner).toLowerCase()
	) {
		return `${reference.owner}/${short}`;
	}
	return short;
}

export function buildPullRequestLink(
	selection: string,
	defaultOwner: string,
	ownerLabelMode: OwnerLabelMode = 'hide',
): LinkResult {
	const trimmed = selection.trim();
	const reference = parsePullRequestReference(trimmed);
	const pathReference = reference ? null : parsePullRequestPath(trimmed);
	const parsed = reference ?? pathReference;
	if (!parsed) {
		return { status: 'invalid' };
	}
	const owner = parsed.owner ?? normalizeOwner(defaultOwner);
	if (!owner) {
		return { status: 'missing-owner' };
	}
	const label = reference
		? trimmed
		: formatPathLabel(parsed, owner, defaultOwner, ownerLabelMode);
	const url = `https://github.com/${owner}/${parsed.repo}/pull/${parsed.number}`;
	return { status: 'ok', markdown: `[${label}](${url})` };
}
