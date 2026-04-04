import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const owner = 'base44dev';
    const repo = 'getorigins';

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=50`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Origins-App',
        }
      }
    );

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return Response.json(
        { error: `Failed to fetch issues: ${response.statusText}` },
        { status: response.status }
      );
    }

    const issues = await response.json();

    const formatted = issues.map(issue => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      creator: issue.user.login,
      url: issue.html_url,
      labels: issue.labels.map(l => l.name),
    }));

    return Response.json({
      repository: `${owner}/${repo}`,
      open_issues_count: formatted.length,
      issues: formatted,
    });
  } catch (error) {
    console.error('Error fetching GitHub issues:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});