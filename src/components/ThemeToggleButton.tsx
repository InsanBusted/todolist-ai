import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export default function ThemeToggleButton(){
    const {theme,setTheme} = useTheme

    return (
        <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={()=>{
            if (theme === "dark") {
                setTheme("light")
            } else {
                setTheme("dark")
            }
        }}
        >
            <Sun></Sun>
        </Button>
    )

}