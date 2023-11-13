import { Toaster } from "react-hot-toast"
import FileUpload from "./components/FileUpload"

function App() {
    return (
        <main className="h-screen w-screen text-slate-50">
            <FileUpload />
            <Toaster position="bottom-right" />
        </main>
    )
}

export default App
