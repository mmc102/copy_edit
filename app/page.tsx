import AuthButton from "../components/AuthButton";
import Header from "@/components/Header";
import ProtectedPage from "./protected/page";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Index() {

    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login")
    }

    const { data: gitUsers, error } = await supabase
        .from('git_user')
        .select('*')
        .eq('user_id', user!.id)


    if (error) {
        console.error(error);
    }

    return (<div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
                llammas :)

                <AuthButton />
            </div>
        </nav>

        <main className="">
            <div className="">

                {<ProtectedPage gitUsers={gitUsers} />}
            </div>
        </main>

        <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
            <a href="http://mattcarroll.net">Made by hew</a>
        </footer>
    </div >

    )
}


