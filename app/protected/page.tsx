'use client'

import { useState } from 'react';
import { SelectSearchResultsTable } from '@/components/SelectSearchResultsForm';
import FindReplaceForm from '@/components/FindReplaceForm';
import GitSetupForm from '@/components/GitSetupForm';
import GitUsersCard from '@/components/GitUserCard';
import { GitUser, GrepResult, codeSearch } from '@/utils/git_helpers';


export default function ProtectedPage({ gitUsers }: { gitUsers: GitUser[] }) {


    const [searchResults, setSearchResults] = useState<GrepResult[]>([]);
    const [find, setFind] = useState<string>('');
    const [gitUser, setGitUser] = useState<GitUser>(gitUsers[0]);
    const [replace, setReplace] = useState<string>('');
    const [prUrl, setPRUrl] = useState<string | null>(null);

    const handleFormSubmit = async (find: string, replace: string, gitUser: GitUser) => {
        setFind(find);
        setReplace(replace);

        try {
            const results: GrepResult[] = await codeSearch(gitUser, find);
            setSearchResults(results);
        }
        catch {
            console.log("caught")
        }
    };

    const showTable = !prUrl && searchResults.length > 0

    return (

        <>
            <div className="">
                <main className="flex-1 flex flex-col gap-6 px-20">
                    {gitUsers ? <GitUsersCard setSelectedUser={setGitUser} selectedUser={gitUser} gitUsers={gitUsers} /> : <GitSetupForm />}
                    <FindReplaceForm allowSubmit={gitUser !== null} gitUser={gitUser} onSubmit={handleFormSubmit} />
                    {showTable && <SelectSearchResultsTable find={find} replace={replace} gitUser={gitUser!} data={searchResults} setPRUrl={setPRUrl} />}
                    {prUrl && <DisplayUrl url={prUrl} />}
                </main>
            </div>

        </>
    );
}


function DisplayUrl({ url }: { url: string }) {
    return (
        <div>
            <h1>PR URL</h1>
            <a href={url}>{url}</a>
        </div>

    )
}
