import { Icons } from "@/components/shared/icons"
import { MenuShortcut } from "@/components/shared/menu-shortcut"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ItemActionsDropdownProps {
  onEdit?: () => void
  onShare?: () => void
  onDuplicate?: () => void
  onMove?: () => void
  onArchive?: () => void
  onDelete?: () => void
}

export function ItemActionsDropdown({
  onEdit,
  onShare,
  onDuplicate,
  onMove,
  onArchive,
  onDelete,
}: ItemActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Icons.more className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onEdit}>
          <Icons.edit className="mr-2 h-3 w-3" />
          Edit
          <MenuShortcut>E</MenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShare}>
          <Icons.share className="mr-2 h-3 w-3" />
          Share
          <MenuShortcut>S</MenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Icons.copy className="mr-2 h-3 w-3" />
          Duplicate
          <MenuShortcut>D</MenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onMove}>
          <Icons.move className="mr-2 h-3 w-3" />
          Move
          <MenuShortcut>M</MenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArchive}>
          <Icons.archive className="mr-2 h-3 w-3" />
          Archive
          <MenuShortcut>A</MenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Icons.trash className="mr-2 h-3 w-3" />
          Delete
          <MenuShortcut variant="destructive">X</MenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
