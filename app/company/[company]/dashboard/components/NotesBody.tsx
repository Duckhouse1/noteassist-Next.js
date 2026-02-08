import { NotesContext } from "@/app/Contexts"
import { useContext } from "react"





export function NotesBody() {
    const { notes } = useContext(NotesContext)

    return (
        <>
            <div className="flex flex-col min-h-[60vh] h-full">
                <textarea
                    value={notes}
                    readOnly
                    className="
      flex-1 w-full resize-none
      rounded-lg border border-slate-200
      p-4 text-sm text-slate-900
      outline-none
      focus:ring-4 focus:ring-blue-100
    "
                />
            </div>

        </>
    )
}