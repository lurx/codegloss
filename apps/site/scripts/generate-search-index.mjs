#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const docsDir = path.resolve(import.meta.dirname, '../content/docs');
const outPath = path.resolve(import.meta.dirname, '../public/search-index.json');

function walkMdx(dir) {
	const entries = [];
	for (const name of readdirSync(dir)) {
		const full = path.join(dir, name);
		if (statSync(full).isDirectory()) {
			entries.push(...walkMdx(full));
		} else if (name.endsWith('.mdx')) {
			entries.push(full);
		}
	}
	return entries;
}

function extractFrontmatter(content) {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return {};
	const fm = {};
	for (const line of match[1].split('\n')) {
		const colon = line.indexOf(':');
		if (colon > -1) {
			const key = line.slice(0, colon).trim();
			const val = line.slice(colon + 1).trim();
			fm[key] = val;
		}
	}
	return fm;
}

function extractHeadings(content) {
	const headings = [];
	for (const match of content.matchAll(/^#{1,3}\s+(.+)$/gm)) {
		headings.push(match[1]);
	}
	return headings;
}

function stripMarkdown(content) {
	// Remove frontmatter
	let text = content.replace(/^---[\s\S]*?---\n/, '');
	// Remove fenced code blocks
	text = text.replace(/```[\s\S]*?```/g, '');
	text = text.replace(/````[\s\S]*?````/g, '');
	// Remove JSX/HTML tags
	text = text.replace(/<[^>]+>/g, ' ');
	// Remove markdown formatting
	text = text.replace(/[#*_`\[\]()!|>]/g, ' ');
	// Collapse whitespace
	text = text.replace(/\s+/g, ' ').trim();
	return text;
}

const files = walkMdx(docsDir);
const index = [];

for (const file of files) {
	const content = readFileSync(file, 'utf-8');
	const fm = extractFrontmatter(content);
	const relPath = path.relative(docsDir, file);
	const slug = relPath.replace(/\.mdx$/, '');

	index.push({
		title: fm.title || slug,
		slug,
		headings: extractHeadings(content),
		text: stripMarkdown(content).slice(0, 500),
	});
}

writeFileSync(outPath, JSON.stringify(index));
console.log(`[generate-search-index] wrote ${outPath} (${index.length} docs)`);
