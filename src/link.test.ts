import { describe, expect, it } from 'vitest';
import {
	buildPullRequestLink,
	normalizeOwner,
	parsePullRequestPath,
	parsePullRequestReference,
} from './link';

describe('parsePullRequestReference', () => {
	it('parses repo#123', () => {
		expect(parsePullRequestReference('today#1234')).toEqual({
			repo: 'today',
			number: '1234',
		});
	});

	it('parses owner/repo#123', () => {
		expect(parsePullRequestReference('thequietmind/today#1234')).toEqual({
			owner: 'thequietmind',
			repo: 'today',
			number: '1234',
		});
	});

	it('allows hyphens, underscores, and periods in owner and repo', () => {
		expect(
			parsePullRequestReference('my-org.name/my_repo.js#42'),
		).toEqual({
			owner: 'my-org.name',
			repo: 'my_repo.js',
			number: '42',
		});
	});

	it('trims surrounding whitespace', () => {
		expect(parsePullRequestReference('  today#7  ')).toEqual({
			repo: 'today',
			number: '7',
		});
	});

	it.each([
		'',
		'   ',
		'#123',
		'repo',
		'repo#',
		'repo#abc',
		'owner/repo',
		'owner/repo#abc',
		'https://github.com/owner/repo/pull/123',
		'owner//repo#123',
		'repo#12a',
	])('rejects %j', (input) => {
		expect(parsePullRequestReference(input)).toBeNull();
	});
});

describe('parsePullRequestPath', () => {
	it('parses repo/pull/123', () => {
		expect(parsePullRequestPath('today/pull/123')).toEqual({
			repo: 'today',
			number: '123',
		});
	});

	it('parses owner/repo/pull/123', () => {
		expect(parsePullRequestPath('thequietmind/today/pull/123')).toEqual({
			owner: 'thequietmind',
			repo: 'today',
			number: '123',
		});
	});

	it('parses a repository named pull', () => {
		expect(parsePullRequestPath('pull/pull/123')).toEqual({
			repo: 'pull',
			number: '123',
		});
	});

	it('parses a full pull request URL', () => {
		expect(
			parsePullRequestPath(
				'https://github.com/octocat/hello-world/pull/789',
			),
		).toEqual({
			owner: 'octocat',
			repo: 'hello-world',
			number: '789',
		});
	});

	it.each([
		'http://github.com/octocat/hello-world/pull/789',
		'https://www.github.com/octocat/hello-world/pull/789',
		'HTTPS://GitHub.com/octocat/hello-world/pull/789',
		'https://github.com/octocat/hello-world/pull/789/',
		'https://github.com/octocat/hello-world/pull/789/files',
		'https://github.com/octocat/hello-world/pull/789?diff=split',
		'https://github.com/octocat/hello-world/pull/789#issuecomment-1',
		'https://github.com/octocat/hello-world/pull/789/files?diff=split#r1',
	])('parses URL variant %j', (input) => {
		expect(parsePullRequestPath(input)).toEqual({
			owner: 'octocat',
			repo: 'hello-world',
			number: '789',
		});
	});

	it('trims surrounding whitespace', () => {
		expect(parsePullRequestPath('  today/pull/7  ')).toEqual({
			repo: 'today',
			number: '7',
		});
	});

	it.each([
		'',
		'pull/123',
		'repo#123',
		'owner/repo#123',
		'owner//repo/pull/123',
		'a/b/c/pull/123',
		'repo/pull/',
		'repo/pull/abc',
		'repo/pull/12a',
		'repo/pull/123 extra',
		'https://github.com/owner/repo/issues/123',
		'https://gitlab.com/owner/repo/pull/123',
		'https://github.com/repo/pull/123',
		'github.com/owner/repo/pull/123',
	])('rejects %j', (input) => {
		expect(parsePullRequestPath(input)).toBeNull();
	});
});

describe('normalizeOwner', () => {
	it('trims whitespace and surrounding slashes', () => {
		expect(normalizeOwner(' /thequietmind/ ')).toBe('thequietmind');
		expect(normalizeOwner('thequietmind')).toBe('thequietmind');
	});

	it('reduces slash-only and empty values to an empty string', () => {
		expect(normalizeOwner('/')).toBe('');
		expect(normalizeOwner(' // ')).toBe('');
		expect(normalizeOwner('   ')).toBe('');
	});
});

describe('buildPullRequestLink', () => {
	it('uses the default owner for repo#123', () => {
		expect(buildPullRequestLink('today#123', 'thequietmind')).toEqual({
			status: 'ok',
			markdown: '[today#123](https://github.com/thequietmind/today/pull/123)',
		});
	});

	it('handles hyphenated repos with the default owner', () => {
		expect(buildPullRequestLink('my-repo#456', 'thequietmind')).toEqual({
			status: 'ok',
			markdown:
				'[my-repo#456](https://github.com/thequietmind/my-repo/pull/456)',
		});
	});

	it('lets a fully qualified reference override the default owner', () => {
		expect(
			buildPullRequestLink('octocat/hello-world#789', 'thequietmind'),
		).toEqual({
			status: 'ok',
			markdown:
				'[octocat/hello-world#789](https://github.com/octocat/hello-world/pull/789)',
		});
	});

	it('normalizes the configured default owner before use', () => {
		expect(buildPullRequestLink('today#1', ' /thequietmind/ ')).toEqual({
			status: 'ok',
			markdown: '[today#1](https://github.com/thequietmind/today/pull/1)',
		});
	});

	it('preserves the trimmed selection as the link label', () => {
		expect(buildPullRequestLink('  today#123  ', 'thequietmind')).toEqual({
			status: 'ok',
			markdown: '[today#123](https://github.com/thequietmind/today/pull/123)',
		});
	});

	it('reports a missing owner when no default is configured', () => {
		expect(buildPullRequestLink('today#123', '')).toEqual({
			status: 'missing-owner',
		});
		expect(buildPullRequestLink('today#123', ' / ')).toEqual({
			status: 'missing-owner',
		});
	});

	it('links repo/pull/123 with the default owner', () => {
		expect(buildPullRequestLink('today/pull/123', 'thequietmind')).toEqual({
			status: 'ok',
			markdown:
				'[today#123](https://github.com/thequietmind/today/pull/123)',
		});
	});

	it('links owner/repo/pull/123 and hides the owner by default', () => {
		expect(
			buildPullRequestLink('octocat/hello-world/pull/789', 'thequietmind'),
		).toEqual({
			status: 'ok',
			markdown:
				'[hello-world#789](https://github.com/octocat/hello-world/pull/789)',
		});
	});

	it('links a full pull request URL and hides the owner by default', () => {
		expect(
			buildPullRequestLink(
				'https://github.com/octocat/hello-world/pull/789',
				'thequietmind',
			),
		).toEqual({
			status: 'ok',
			markdown:
				'[hello-world#789](https://github.com/octocat/hello-world/pull/789)',
		});
	});

	it('links a URL without a configured default owner', () => {
		expect(
			buildPullRequestLink(
				'https://github.com/octocat/hello-world/pull/789',
				'',
			),
		).toEqual({
			status: 'ok',
			markdown:
				'[hello-world#789](https://github.com/octocat/hello-world/pull/789)',
		});
	});

	it('canonicalizes URLs with extra path, query, or fragment', () => {
		expect(
			buildPullRequestLink(
				'https://github.com/octocat/hello-world/pull/789/files?diff=split#r1',
				'',
			),
		).toEqual({
			status: 'ok',
			markdown:
				'[hello-world#789](https://github.com/octocat/hello-world/pull/789)',
		});
	});

	it('reports a missing owner for repo/pull/123 without a default', () => {
		expect(buildPullRequestLink('today/pull/123', '')).toEqual({
			status: 'missing-owner',
		});
	});

	it.each([
		'',
		'#123',
		'repo',
		'repo#',
		'repo#abc',
		'owner/repo',
		'owner/repo#abc',
		'https://github.com/owner/repo/issues/123',
		'github.com/owner/repo/pull/123',
	])('reports %j as invalid', (input) => {
		expect(buildPullRequestLink(input, 'thequietmind')).toEqual({
			status: 'invalid',
		});
	});
});

describe('owner label modes', () => {
	it('show mode includes the explicit owner', () => {
		expect(
			buildPullRequestLink(
				'https://github.com/octocat/hello-world/pull/789',
				'thequietmind',
				'show',
			),
		).toEqual({
			status: 'ok',
			markdown:
				'[octocat/hello-world#789](https://github.com/octocat/hello-world/pull/789)',
		});
	});

	it('show mode includes the default owner for repo/pull/123', () => {
		expect(
			buildPullRequestLink('today/pull/123', 'thequietmind', 'show'),
		).toEqual({
			status: 'ok',
			markdown:
				'[thequietmind/today#123](https://github.com/thequietmind/today/pull/123)',
		});
	});

	it('auto mode shows an owner that differs from the default', () => {
		expect(
			buildPullRequestLink(
				'octocat/hello-world/pull/789',
				'thequietmind',
				'auto',
			),
		).toEqual({
			status: 'ok',
			markdown:
				'[octocat/hello-world#789](https://github.com/octocat/hello-world/pull/789)',
		});
	});

	it('auto mode hides an owner matching the default, ignoring case', () => {
		expect(
			buildPullRequestLink(
				'Octocat/hello-world/pull/789',
				'octocat',
				'auto',
			),
		).toEqual({
			status: 'ok',
			markdown:
				'[hello-world#789](https://github.com/Octocat/hello-world/pull/789)',
		});
	});

	it('auto mode shows the owner when no default is configured', () => {
		expect(
			buildPullRequestLink('octocat/hello-world/pull/789', '', 'auto'),
		).toEqual({
			status: 'ok',
			markdown:
				'[octocat/hello-world#789](https://github.com/octocat/hello-world/pull/789)',
		});
	});

	it('auto mode hides the owner for ownerless input', () => {
		expect(
			buildPullRequestLink('today/pull/123', 'thequietmind', 'auto'),
		).toEqual({
			status: 'ok',
			markdown:
				'[today#123](https://github.com/thequietmind/today/pull/123)',
		});
	});

	it.each(['hide', 'auto', 'show'] as const)(
		'%s mode keeps the verbatim label for owner/repo#123',
		(mode) => {
			expect(
				buildPullRequestLink(
					'octocat/hello-world#789',
					'thequietmind',
					mode,
				),
			).toEqual({
				status: 'ok',
				markdown:
					'[octocat/hello-world#789](https://github.com/octocat/hello-world/pull/789)',
			});
		},
	);
});
