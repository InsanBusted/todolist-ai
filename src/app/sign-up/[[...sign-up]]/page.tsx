import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Todolist AI - SIGN UP"
}


export default function SignUpPage() {
    return (
        <div className="flex h-screen items-center justify-center">
            <SignUp appearance={{ variables: { colorPrimary: "#0F172A" } }} />
        </div>
    )
}