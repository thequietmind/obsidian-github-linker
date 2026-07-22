import { describe, expect, it } from 'vitest';
import {
	buildPullRequestLink,
	normalizeOwner,
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

	it.each([
		'',
		'#123',
		'repo',
		'repo#',
		'repo#abc',
		'owner/repo',
		'owner/repo#abc',
		'https://github.com/owner/repo/pull/123',
	])('reports %j as invalid', (input) => {
		expect(buildPullRequestLink(input, 'thequietmind')).toEqual({
			status: 'invalid',
		});
	});
});
