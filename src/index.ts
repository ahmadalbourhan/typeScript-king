import axios from "axios";

// Define interfaces for GitHub API responses
interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  created_at: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

/**
 * Fetches the latest GitHub issues for a specified repository
 * @param owner The repository owner's username
 * @param repo The repository name
 * @param limit Maximum number of issues to fetch (default: 5)
 * @returns Promise containing an array of GitHubIssue objects
 */
async function fetchGitHubIssues(
  owner: string,
  repo: string,
  limit: number = 5
): Promise<GitHubIssue[]> {
  try {
    console.log(`Fetching issues for ${owner}/${repo}...`);
    const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
    console.log(`API URL: ${url}`);

    const response = await axios.get<GitHubIssue[]>(url, {
      params: {
        state: "all",
        per_page: limit,
        sort: "created",
        direction: "desc",
      },
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      validateStatus: (status) => status === 200,
    });

    if (response.data.length === 0) {
      console.log("No issues found in the repository.");
      return [];
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 404) {
        throw new Error(`Repository ${owner}/${repo} not found or is private`);
      } else if (status === 403) {
        throw new Error(`API rate limit exceeded. Please try again later`);
      } else if (status === 401) {
        throw new Error(
          `Authentication required. Consider adding a GitHub token`
        );
      }

      throw new Error(`Failed to fetch GitHub issues (${status}): ${message}`);
    }
    throw error;
  }
}

// Example usage
async function main() {
  try {
    // Fetch issues from Microsoft's TypeScript repository as an example
    const issues = await fetchGitHubIssues(
      "ahmadalbourhan",
      "second-chance-app"
    );
    console.log("Latest GitHub Issues:");
    issues.forEach((issue) => {
      console.log(`
#${issue.number} - ${issue.title}
State: ${issue.state}
Created by: ${issue.user.login}
URL: ${issue.html_url}
---`);
    });
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

main();
