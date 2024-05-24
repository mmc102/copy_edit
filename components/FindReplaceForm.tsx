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

const formSchema = z.object({
    find: z.string().min(2, {
        message: "find must be at least 2 characters.",
    }),
    replace: z.string().min(2, {
        message: "replace must be at least 1 characters.",
    }),
})

export default function FindReplaceForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            find: "",
            replace: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {

        console.log(values)
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <Button type="submit">Search</Button>
            </form>
        </Form>
    )
}
