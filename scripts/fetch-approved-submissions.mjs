import { writeFile } from 'node:fs/promises';

const repo = process.env.WHILEOOPS_REPO || 'LobsterAgents/whileoops';
const outputPath = new URL('../src/data/generated/submissions.json', import.meta.url);
const apiUrl = `https://api.github.com/repos/${repo}/issues?state=open&labels=approved&per_page=100`;

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

const response = await fetch(apiUrl, { headers });

if (!response.ok) {
  throw new Error(`GitHub approved submission fetch failed: ${response.status} ${response.statusText}`);
}

const issues = await response.json();

const submissions = issues
  .filter((issue) => !issue.pull_request)
  .map((issue) => {
    const fields = parseIssueBody(issue.body || '');
    return {
      number: issue.number,
      title: cleanTitle(issue.title),
      url: issue.html_url,
      author: issue.user?.login || 'unknown',
      createdAt: issue.created_at,
      submissionType: fields['Submission type'] || 'Submission',
      category: fields.Category || 'Other',
      body: fields['What happened or why does this belong here?'] || '',
      referenceUrl: normalizeEmpty(fields['Reference URL']),
      imageUrl: extractImageUrl(fields['Screenshots or images']),
      severity: fields.Severity || 'Funny',
      tool: normalizeEmpty(fields['Tool or agent involved']),
    };
  })
  .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

await writeFile(outputPath, `${JSON.stringify(submissions, null, 2)}\n`);
console.log(`Wrote ${submissions.length} approved submission(s) to ${outputPath.pathname}`);

function parseIssueBody(body) {
  const fields = {};
  const headingPattern = /^### (.+)$/gm;
  const matches = [...body.matchAll(headingPattern)];

  matches.forEach((match, index) => {
    const key = match[1].trim();
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? body.length;
    fields[key] = body.slice(start, end).trim();
  });

  return fields;
}

function cleanTitle(title) {
  return title.replace(/^\[FAIL\]:\s*/i, '').trim();
}

function normalizeEmpty(value) {
  if (!value || value === '_No response_' || value.toUpperCase() === 'N/A') {
    return null;
  }

  return value;
}

function extractImageUrl(value) {
  const normalized = normalizeEmpty(value);
  if (!normalized) return null;

  const srcMatch = normalized.match(/src="([^"]+)"/);
  if (srcMatch) return srcMatch[1];

  const markdownMatch = normalized.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (markdownMatch) return markdownMatch[1];

  const urlMatch = normalized.match(/https?:\/\/\S+/);
  return urlMatch?.[0] || null;
}
