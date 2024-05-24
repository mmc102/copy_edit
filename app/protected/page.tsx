import AuthButton from "@/components/AuthButton";
import FindReplaceForm from "@/components/FindReplaceForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import GitSetupForm from "@/components/GitSetupForm";
import GitUserCard from "@/components/GitUserCard";

export default async function ProtectedPage() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();



    if (!user) {
        return redirect("/login");
    }

    const { data: gitUser, error: queryError } = await supabase
        .from('git_user')
        .select('*')
        .eq('user_id', user.id)
        .single();


    return (
        <div className="flex-1 w-full flex flex-col gap-20 items-center">
            <div className="w-full">
                <div className="py-6 font-bold bg-purple-950 text-center">
                </div>
                <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                    <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
                        <AuthButton />
                    </div>
                </nav>
            </div>

            <div className="">
                <main className="flex-1 flex flex-col gap-6">

                    {gitUser ? <GitUserCard gitUser={gitUser} /> : <GitSetupForm />}
                    <FindReplaceForm />
                </main>
            </div>

            <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">

                Copy Edit :)
            </footer>
        </div>
    );
}
