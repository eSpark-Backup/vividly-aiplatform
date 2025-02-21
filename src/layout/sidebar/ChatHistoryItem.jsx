import { useState } from "react";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWebSocketContext } from "@/services/WebSocketProvider";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";

const ChatHistoryItem = ({ item, onRename, onDelete, onClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isPartialMessageLoading } = useWebSocketContext();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("cid");

  const handleRename = () => {
    if (title.trim() !== "") {
      onRename(item.id, title);
      setIsEditing(false);
    }
  };

  const isSelected = item.id === conversationId;

  return (
    <div
      onClick={() => !isPartialMessageLoading && onClick(item.id)}
      className={cn(
        "group flex items-center justify-between px-4 gap-4 py-2 border-b border-2 rounded-lg dark:gradient-glass-effect gradient-glass-effect-hover text-white bg-black transition-all duration-200 ease-in-out",
        isSelected && "gradient-glass-effect-selected"
      )}
    >
      <div
        className={cn(
          "flex flex-col",
          isPartialMessageLoading && "cursor-not-allowed"
        )}
      >
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
          <span className="truncate text-sm font-semibold">
            {title.slice(0, 20)}
          </span>
        )}
      </div>

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              "transition-opacity dark:gradient-glass-effect gradient-glass-effect-hover bg-black px-1 rounded-lg",
              menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <Ellipsis
              onClick={() => setMenuOpen(true)}
              className="w-4 h-4 cursor-pointer text-white"
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="dark:bg-zinc-900/95">
          <DropdownMenuItem
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Pencil className="w-4 h-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setMenuOpen(false);
              onDelete(item.id);
            }}
            className="flex items-center gap-2 cursor-pointer text-red-500"
          >
            <Trash className="w-4 h-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatHistoryItem;
