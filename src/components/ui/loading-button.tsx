import { Loader2 } from "lucide-react"
import { Button, ButtonProps } from "./button"

type LoadingButtonProps = {
    loading: boolean
}  & ButtonProps


export default function LoadingButton({
    children,
    loading,
    ...props
}: LoadingButtonProps) {
    return (
        <Button {...props} disabled={props.disabled || loading}>
            {loading && <Loader2 className="MR-2 H-4 W-4 animate-spin" />}
            {children}
        </Button>
    )
}