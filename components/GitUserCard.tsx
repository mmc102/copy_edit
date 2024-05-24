import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"



export default function GitUserCard({ gitUser }: any) {

    return (
        <HoverCard>
            <HoverCardTrigger>{gitUser.repo_name}</HoverCardTrigger>
            <HoverCardContent>
                <h1>{gitUser.repo_name}</h1>
                <h1>{gitUser.repo_owner}</h1>
                <h1>{gitUser.base_branch}</h1>
            </HoverCardContent>
        </HoverCard>


    );
}
