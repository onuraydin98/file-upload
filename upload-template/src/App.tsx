import { Toaster } from "react-hot-toast"
import FileUpload from "./components/FileUpload"

function App() {
    return (
        <main className="h-screen w-screen">
            <FileUpload />
            <Toaster />
        </main>
    )
}

export default App
