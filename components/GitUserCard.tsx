import { GitUser } from "@/utils/git_helpers";
import { useState } from 'react'

import {
    Card,
    CardContent,
    CardFooter,
    CardDescription,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "./ui/button";
import GitSetupForm from "./GitSetupForm";




interface GitUserCardProps {
    gitUsers: GitUser[],
    selectedUser: GitUser,
    setSelectedUser: (user: GitUser) => void
}

export default function GitUsersCards({ gitUsers, selectedUser, setSelectedUser }: GitUserCardProps) {
    const [showCreate, setShowCreate] = useState<boolean>(false)

    return (
        <div className="flex flex-row items-center justify-center">
            {gitUsers.map((gitUser, index) => (
                <GitUserCard
                    selected={gitUser === selectedUser}
                    key={index}
                    gitUser={gitUser}
                    setSelected={setSelectedUser}
                />
            ))}
            {showCreate ? (
                <GitSetupForm />
            ) : (
                <Button
                    className="m-4 flex items-center justify-center"
                    onClick={() => setShowCreate(true)}
                >
                    +
                </Button>
            )}
        </div>

    );
}


function GitUserCard({ gitUser, selected, setSelected }: { gitUser: GitUser, selected: boolean, setSelected: Function }) {

    return (
        <Card className={`m-4 ${selected ? 'border-green-500' : ''}`}>
            <CardContent>
                <div className="">
                    <div className="py-4">
                        <CardDescription>repo</CardDescription>
                        <CardTitle>{gitUser.repo_name}</CardTitle>
                    </div>
                    <div className="py-4">
                        <CardDescription>repo owner</CardDescription>
                        <CardTitle>{gitUser.repo_owner}</CardTitle>
                    </div>
                    <div className="py-4">
                        <CardDescription>base branch</CardDescription>
                        <CardTitle>{gitUser.base_branch}</CardTitle>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4">
                <Button disabled={selected} onClick={() => { setSelected(gitUser) }}>Activate</Button>
            </CardFooter>
        </Card >
    )



}


