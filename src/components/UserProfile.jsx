import { Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

export default function UserProfile() {
  return (
    <Card className="dark:gradient-glass-effect bg-black rounded-lg w-full">
      <div className="flex justify-between gap-4 py-4 px-3">
        <div className="flex gap-2">
          <Avatar
            showStatus={true}
            isOnline={true}
            className="h-12 w-12 border-2 border-emerald-500/20">
            <AvatarImage
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DjKiLJsm1as7qtoJXJ9fipBxcz2mlB.png"
              alt="Adam Green"
            />
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="text-md font-semibold text-white">Adam Green</h2>
            <p className="text-xs font-medium text-emerald-500">Premium</p>
          </div>
        </div>
        <button className="rounded-full p-2 hover:bg-white/10 transition-colors">
          <Settings className="h-5 w-5 text-zinc-400" />
        </button>
      </div>
    </Card>
  )
}

