
import { toast } from "sonner"
import axios from 'axios';

export type GitUser = {
    username: string;
    repo_owner: string;
    repo_name: string;
    token: string;
    base_branch: string;
}

export interface Change {
    file_content: string;
    filepath: string;
    blob_sha?: string;
}

export interface GrepResult {
    line_number: number;
    line_content: string;
    filename: string;
    content: string;
}

const seconds = Date.now()



async function createBlobs(gitUser: GitUser, changes: Change[]): Promise<Change[]> {
    const url = `https://api.github.com/repos/${gitUser.repo_owner}/${gitUser.repo_name}/git/blobs`;
    const headers = {
        'Authorization': `token ${gitUser.token}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    const blobShas: Change[] = [];

    for (const change of changes) {
        const payload = {
            content: change.file_content,
            encoding: 'utf-8'
        };

        try {
            const response = await axios.post(url, payload, { headers });
            if (response.status === 201) {
                const sha = response.data.sha;
                blobShas.push({ ...change, blob_sha: sha });
            } else {
                toast(`Failed to create blob for ${change.filepath}.`);
                toast(`Response: ${response.status}`);
                toast(`Message: ${response.data}`);
            }
        } catch (error) {
            toast(`Failed to create blob for ${change.filepath}.`);
            toast(`Error: ${error.message}`);
        }
    }

    return blobShas;
}

async function getTreeSha(gitUser: GitUser, commitSha: string): Promise<string | null> {
    const url = `https://api.github.com/repos/${gitUser.repo_owner}/${gitUser.repo_name}/git/commits/${commitSha}`;
    const headers = {
        'Authorization': `token ${gitUser.token}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    try {
        const response = await axios.get(url, { headers });
        if (response.status === 200) {
            return response.data.tree.sha;
        } else {
            toast(`Failed to get the tree SHA for the commit '${commitSha}'.`);
            toast(`Response: ${response.status}`);
            toast(`Message: ${response.data}`);
            return null;
        }
    } catch (error) {
        toast(`Failed to get the tree SHA for the commit '${commitSha}'.`);
        toast(`Error: ${error.message}`);
        return null;
    }
}



export async function codeSearch(gitUser: GitUser, find: string): Promise<GrepResult[]> {
    toast("Searching the repo :) ")
    const query = `${find} repo:${gitUser.repo_owner}/${gitUser.repo_name}`;
    const url = `https://api.github.com/search/code?q=${query}`;
    const headers = {
        'Authorization': `token ${gitUser.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
    };

    const response = await axios.get(url, { headers });
    const filesToPull: string[] = [];
    if (response.status === 200) {
        const payload = response.data;
        for (const item of payload.items) {
            filesToPull.push(item.path);
        }
    } else {
        toast(`Failed to search code. Response: ${response.status}`);
        toast(`Message: ${response.data}`);
    }

    const contentLookup: { [key: string]: string } = {};
    for (const filepath of new Set(filesToPull)) {
        try {
            const content = await fetchFileContentFromGithub(gitUser, filepath);
            contentLookup[filepath] = content;
        } catch (error) {
            toast(`Failed to fetch content for ${filepath}. Error: ${error.message}`);
        }
    }

    const results: GrepResult[] = [];
    for (const [filename, content] of Object.entries(contentLookup)) {
        const corpus = content.split('\n');
        corpus.forEach((line, lineNum) => {
            if (line.includes(find)) {
                results.push({ line_number: lineNum, line_content: line, filename, content });
            }
        });
    }

    return results;
}



async function fetchFileContentFromGithub(gitUser: GitUser, filepath: string): Promise<string> {
    const url = `https://api.github.com/repos/${gitUser.repo_owner}/${gitUser.repo_name}/contents/${filepath}`;
    const headers = {
        'Authorization': `token ${gitUser.token}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    try {
        const response = await axios.get(url, { headers });
        if (response.status === 200) {
            const content = response.data.content;
            return Buffer.from(content, 'base64').toString('utf-8');
        } else {
            toast(`Failed to fetch file content for ${filepath}.`);
            toast(`Response: ${response.status}`);
            toast(`Message: ${response.data}`);
            return '';
        }
    } catch (error) {
        toast(`Failed to fetch file content for ${filepath}.`);
        toast(`Error: ${error.message}`);
        return '';
    }
}


async function createTree(gitUser: GitUser, baseTreeSha: string, changes: Change[]): Promise<string | null> {
    const url = `https://api.github.com/repos/${gitUser.repo_owner}/${gitUser.repo_name}/git/trees`;
    const headers = {
        'Authorization': `token ${gitUser.token}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    const payload = {
        base_tree: baseTreeSha,
        tree: changes.map(change => ({
            path: change.filepath,
            mode: '100644',
            type: 'blob',
            sha: change.blob_sha
        }))
    };

    try {
        const response = await axios.post(url, payload, { headers });
        if (response.status === 201) {
            return response.data.sha;
        } else {
            toast('Failed to create tree.');
            toast(`Response: ${response.status}`);
            toast(`Message: ${response.data}`);
            return null;
        }
    } catch (error) {
        toast('Failed to create tree.');
        toast(`Error: ${error.message}`);
        return null;
    }
}


async function createCommit(gitUser: GitUser, changes: Change[]): Promise<boolean> {
    toast("Create commit initiated");

    if (!await branchExists(gitUser, createBranchName(gitUser))) {
        toast(`The head branch '${createBranchName(gitUser)}' does not exist. Creating the branch.`);
        if (!await createBranch(gitUser)) {
            return false;
        }
    }

    const latestCommitSha = await getLatestCommitSha(gitUser);
    if (!latestCommitSha) {
        return false;
    }

    const baseTreeSha = await getTreeSha(gitUser, latestCommitSha);
    if (!baseTreeSha) {
        return false;
    }

    const updatedChanges = await createBlobs(gitUser, changes);
    if (!updatedChanges || updatedChanges.length === 0) {
        return false;
    }

    const treeSha = await createTree(gitUser, baseTreeSha, updatedChanges);
    if (!treeSha) {
        return false;
    }

    const url = `https://api.github.com/repos/${gitUser.repo_owner}/${gitUser.repo_name}/git/commits`;
    const headers = {
        'Authorization': `token ${gitUser.token}`,
        'Accept': 'application/vnd.github.v3+json'
    };
    const payload = {
        message: 'Update copy',
        tree: treeSha,
        parents: [latestCommitSha]
    };

    try {
        const response = await axios.post(url, payload, { headers });
        if (response.status === 201) {
            const commitSha = response.data.sha;
            await updateRef(gitUser, commitSha);
            toast('Commit created successfully.');
            return true;
        } else {
            toast('Failed to create commit.');
            toast(`Response: ${response.status}`);
            toast(`Message: ${response.data}`);
            return false;
        }
    } catch (error) {
        toast('Failed to create commit.');
        toast(`Error: ${error.message}`);
        return false;
    }
}


async function updateRef(gitUser: GitUser, commitSha: string): Promise<void> {
    const url = `https://api.github.com/repos/${gitUser.repo_owner}/${gitUser.repo_name}/git/refs/heads/${createBranchName(gitUser)}`;
    const headers = {
        'Authorization': `token ${gitUser.token}`,
        'Accept': 'application/vnd.github.v3+json'
    };
    const payload = {
        sha: commitSha,
        force: true
    };

    try {
        const response = await axios.patch(url, payload, { headers });
        if (response.status === 200) {
            toast(`Branch '${createBranchName(gitUser)}' updated to new commit.`);
        } else {
            toast('Failed to update branch reference.');
            toast(`Response: ${response.status}`);
            toast(`Message: ${response.data}`);
        }
    } catch (error) {
        toast('Failed to update branch reference.');
        toast(`Error: ${error.message}`);
    }
}


async function getLatestCommitSha(gitUser: GitUser): Promise<string | null> {
    const url = `https://api.github.com/repos/${gitUser.repo_owner}/${gitUser.repo_name}/git/refs/heads/${gitUser.base_branch}`;
    const headers = {
        'Authorization': `token ${gitUser.token}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    try {
        const response = await axios.get(url, { headers });
        if (response.status === 200) {
            const hash = response.data.object.sha;
            toast(`latest hash: ${hash}`);
            return hash;
        } else {
            toast(`Failed to get the latest commit SHA for the base branch '${gitUser.base_branch}'.`);
            toast(`Response: ${response.status}`);
            toast(`Message: ${response.data}`);
            return null;
        }
    } catch (error) {
        toast(`Failed to get the latest commit SHA for the base branch '${gitUser.base_branch}'.`);
        toast(`Error: ${error.message}`);
        return null;
    }
}



async function createBranch(gitUser: GitUser): Promise<boolean> {
    const sha = await getLatestCommitSha(gitUser);
    if (!sha) {
        return false;
    }

    const url = `https://api.github.com/repos/${gitUser.repo_owner}/${gitUser.repo_name}/git/refs`;
    const headers = {
        'Authorization': `token ${gitUser.token}`,
        'Accept': 'application/vnd.github.v3+json'
    };
    const payload = {
        ref: `refs/heads/${createBranchName(gitUser)}`,
        sha: sha
    };

    try {
        const response = await axios.post(url, payload, { headers });
        if (response.status === 201) {
            toast(`Branch '${createBranchName(gitUser)}' created successfully.`);
            return true;
        } else {
            toast(`Failed to create branch '${createBranchName(gitUser)}'.`);
            toast(`Response: ${response.status}`);
            toast(`Message: ${response.data}`);
            return false;
        }
    } catch (error) {
        toast(`Failed to create branch '${createBranchName(gitUser)}'.`);
        toast(`Error: ${error.message}`);
        return false;
    }
}


async function branchExists(gitUser: GitUser, branchName: string): Promise<boolean> {
    const url = `https://api.github.com/repos/${gitUser.repo_owner}/${gitUser.repo_name}/branches/${branchName}`;
    const headers = {
        'Authorization': `token ${gitUser.token}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    try {
        const response = await axios.get(url, { headers });
        return response.status === 200;
    } catch (error) {
        toast(`Failed to check if branch '${branchName}' exists.`);
        toast(`Error: ${error.message}`);
        return false;
    }
}


async function createPullRequest(gitUser: GitUser): Promise<string | null> {
    if (!await branchExists(gitUser, createBranchName(gitUser))) {
        toast(`The head branch '${createBranchName(gitUser)}' does not exist. Creating the branch.`);
        if (!await createBranch(gitUser)) {
            return null;
        }
    }

    if (!await branchExists(gitUser, gitUser.base_branch)) {
        toast(`The base branch '${gitUser.base_branch}' does not exist in the repository.`);
        return null;
    }

    const url = `https://api.github.com/repos/${gitUser.repo_owner}/${gitUser.repo_name}/pulls`;
    const headers = {
        'Authorization': `token ${gitUser.token}`,
        'Accept': 'application/vnd.github.v3+json'
    };
    const payload = {
        title: 'Updating the Copy',
        body: 'A small change to the copy, made with love by CopyEdit',
        head: createBranchName(gitUser),
        base: gitUser.base_branch
    };

    try {
        const response = await axios.post(url, payload, { headers });
        if (response.status === 201) {
            toast('Pull request created successfully.');
            const pullRequestUrl = response.data.html_url;
            toast(`Pull request URL: ${pullRequestUrl}`);
            return pullRequestUrl;
        } else {
            toast('Failed to create pull request.');
            toast(`Response: ${response.status}`);
            toast(`Message: ${response.data}`);
            return null;
        }
    } catch (error) {
        toast('Failed to create pull request.');
        toast(`Error: ${error.message}`);
        return null;
    }
}


function makeChanges(find: string, replace: string, filterResults: GrepResult[]): Change[] {
    const appliedChanges: Change[] = [];

    for (const result of filterResults) {
        const lines = result.content.split('\n');
        const originalLine = lines[result.line_number];
        const newLine = originalLine.replace(find, replace);
        lines[result.line_number] = newLine;

        const updatedContent = lines.join('\n');
        appliedChanges.push({ filepath: result.filename, file_content: updatedContent });
    }

    return appliedChanges;
}

export function createBranchName(gitUser: GitUser): string {
    return `copyedit_${seconds}`
}

export async function commitAndPr(
    gitUser: GitUser,
    find: string,
    replace: string,
    filteredResult: GrepResult[]
): Promise<string | null> {
    const requestedChanges = makeChanges(find, replace, filteredResult);

    const commitSuccess = await createCommit(gitUser, requestedChanges);
    if (commitSuccess && requestedChanges.length > 0) {
        const url = await createPullRequest(gitUser);
        return url;
    } else {
        toast('No changes requested or commit failed.');
        return null;
    }
}

