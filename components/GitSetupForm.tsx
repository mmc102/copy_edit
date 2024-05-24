"use client"

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Input } from "@/components/ui/input"



const formSchema = z.object({
    repo_name: z.string().min(3, {
        message: "",
    }),
    repo_owner: z.string().min(3, {
        message: "",
    }),
    token: z.string().min(10, {
        message: "",
    }),
    base_branch: z.string().min(1, {
        message: "",
    }),
})

export default function GitSetupForm() {


    const DEFAULT_VALUES = {
        repo_name: "gimmie_feedback",
        token: "",
        base_branch: "master",
        repo_owner: "mmc102",
    }


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: DEFAULT_VALUES,
    })


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
                {Object.entries(DEFAULT_VALUES).map(([key, value]) => (
                    <FormField
                        key={key}
                        control={form.control}
                        name={key}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{key}</FormLabel>
                                <FormControl>
                                    <Input placeholder={value} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                ))}
                <Button type="submit">Create Git User</Button>
            </form>
        </Form>
    )
}
