


import { useState } from "react";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getLastMessage } from "@/lib/utils";


const ChatHistoryItem = ({ item, onRename, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(item.title);
    const [menuOpen, setMenuOpen] = useState(false);
  
    const handleRename = () => {
      if (title.trim() !== "") {
        onRename(item.id, title);
        setIsEditing(false);
      }
    };
  
    return (
      <div className="group flex items-center justify-between px-4 gap-4 py-2 rounded-lg dark:gradient-glass-effect gradient-glass-effect-hover text-white bg-black">
        <div className="flex flex-col">
          {isEditing ? (
            <Input
              className="w-full py-0 h-5 text-sm"
              variant="basic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
            />
          ) : (
            <span className="truncate text-sm font-semibold">{title}</span>
          )}
          {/* <span className="text-xs text-gray-400 truncate">{item.last_message}</span> */}
        </div>
  
        <DropdownMenu onOpenChange={(open) => setMenuOpen(open)}>
          <DropdownMenuTrigger asChild>
            <div
              className={`transition-opacity dark:gradient-glass-effect gradient-glass-effect-hover bg-black px-1 rounded-lg ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            >
              <Ellipsis className="w-4 h-4 cursor-pointer text-white" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dark:bg-zinc-900/95">
            <DropdownMenuItem onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(item.id)} className="flex items-center gap-2 text-red-500">
              <Trash className="w-4 h-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };
  

export default ChatHistoryItem;