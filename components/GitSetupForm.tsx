"use client"

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";



const formSchema = z.object({
    repo_name: z.string().min(3, {
        message: "",
    }),
    repo_owner: z.string().min(3, {
        message: "",
    }),
    token: z.string().min(10, {
        message: "you must include a valid token",
    }),
    base_branch: z.string().min(1, {
        message: "",
    }),
})

export default function GitSetupForm() {


    const DEFAULT_VALUES = {
        repo_name: {
            value: "gimmie_feedback",
            popoverContent: <p>This is the name of the repository</p>
        },
        token: {
            value: "",
            popoverContent: <TokenInstruction />
        },
        base_branch: {
            value: "main",
            popoverContent: "The base branch of the repository. Normally main or master"
        },
        repo_owner: {
            value: "johndoe",
            popoverContent: "The account that is the owner of the repository."
        },
    };

    const form = useForm({
        defaultValues: Object.fromEntries(
            Object.entries(DEFAULT_VALUES).map(([key, { value }]) => [key, value])
        ),
    });


    async function onSubmit(values: z.infer<typeof formSchema>) {
        const supabase = createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();


        if (!user) {
            return redirect("/login");
        }

        const { data, error } = await supabase
            .from('git_user')
            .insert([
                {
                    repo_name: values.repo_name,
                    repo_owner: values.repo_owner,
                    token: values.token,
                    base_branch: values.base_branch,
                    user_id: user.id,
                },
            ]);

        if (error) {
            console.error('Error inserting data:', error);
        } else {
            console.log('Data inserted successfully:', data);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {Object.entries(DEFAULT_VALUES).map(([key, { value, popoverContent }]) => {
                    return (

                        <FormField
                            key={key}
                            control={form.control}
                            name={key}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex flex-row">
                                        <FormLabel>{key}</FormLabel>
                                        {<Popover>
                                            <PopoverTrigger asChild className="ml-3">
                                                <QuestionMarkCircledIcon />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-1/2">{popoverContent}</PopoverContent>
                                        </Popover>}
                                    </div>
                                    <FormControl>
                                        <Input placeholder={value} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    )
                })}
                <Button type="submit">Create Git User</Button>
            </form>
        </Form>
    )
}

const TokenInstruction = () => (
    <div className="p-4 bg-gray-100 rounded-md">
        <h2 className="text-lg font-bold mb-2">Create a Fine-Grained Personal Access Token</h2>
        <ol className="list-decimal list-inside space-y-2">
            <li>Go to GitHub and log in to your account.</li>
            <li>
                In the upper-right corner of any page, click your profile photo, then click <strong>Settings</strong>.
            </li>
            <li>
                In the left sidebar, click <strong>Developer settings</strong>.
            </li>
            <li>
                In the left sidebar, under <strong>Personal access tokens</strong>, click <strong>Fine-grained tokens</strong>.
            </li>
            <li>
                Click the <strong>Generate new token</strong> button.
            </li>
            <li>
                Give your token a descriptive name, such as <em>Commit Token</em>.
            </li>
            <li>
                Under <strong>Repository access</strong>, select <em>Only select repositories</em> and then choose the repository you want to commit to.
            </li>
            <li>
                Under <strong>Permissions</strong>, set the following permissions:
                <ul className="list-disc list-inside ml-4">
                    <li><strong>Contents:</strong> Read and write</li>
                    <li><strong>Pull requests:</strong> Read and write</li>
                    <li><strong>Issues:</strong> Read and write (if needed)</li>
                    <li><strong>Metadata:</strong> Read and write</li>
                </ul>
            </li>
            <li>
                Click the <strong>Generate token</strong> button at the bottom of the page.
            </li>
            <li>
                Copy your new personal access token.
            </li>
        </ol>
    </div>
);


