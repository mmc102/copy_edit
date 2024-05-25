"use client"
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
import { GitUser } from '@/utils/git_helpers';

const formSchema = z.object({
    find: z.string().min(2, {
        message: "find must be at least 2 characters.",
    }),
    replace: z.string().min(2, {
        message: "replace must be at least 1 characters.",
    }),
})

interface FormValues {
    find: string;
    replace: string;
}

interface FindReplaceFormProps {
    gitUser: GitUser | null;
    onSubmit: (find: string, replace: string, gitUser: GitUser) => void;
    allowSubmit: boolean;
}

export default function FindReplaceForm({ gitUser, onSubmit, allowSubmit }: FindReplaceFormProps) {
    console.log("im rendering")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            find: "",
            replace: "",
        },
    })

    const handleSubmit = (values: FormValues) => {
        if (gitUser) {
            onSubmit(values.find, values.replace, gitUser);
        }
    };



    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="find"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Find</FormLabel>
                            <FormControl>
                                <Input placeholder="dogs are amazing" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />



                <FormField
                    control={form.control}
                    name="replace"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Replace</FormLabel>
                            <FormControl>
                                <Input placeholder="llamas are amazing" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button disabled={!allowSubmit} type="submit">Search</Button>
            </form>
        </Form>
    )
}
