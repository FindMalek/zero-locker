import { Icons } from "@/components/shared/icons"
import { MenuShortcut } from "@/components/shared/menu-shortcut"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ItemActionsProps {
  onEdit?: () => void
  onShare?: () => void
  onDuplicate?: () => void
  onMove?: () => void
  onArchive?: () => void
  onDelete?: () => void
  variant?: "dropdown" | "context"
  children?: React.ReactNode
}

export function ItemActionsDropdown({
  onEdit,
  onShare,
  onDuplicate,
  onMove,
  onArchive,
  onDelete,
  variant = "dropdown",
}: ItemActionsProps) {
  const menuItems = (
    <>
      <DropdownMenuItem onClick={onEdit}>
        <Icons.pencil className="mr-2 h-3 w-3" />
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
    </>
  )

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Icons.more className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {menuItems}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return null
}

export function ItemActionsContextMenu({
  onEdit,
  onShare,
  onDuplicate,
  onMove,
  onArchive,
  onDelete,
  children,
}: ItemActionsProps) {
  const contextMenuItems = (
    <>
      <ContextMenuItem
        onClick={(e) => {
          e.stopPropagation()
          onEdit?.()
        }}
      >
        <Icons.pencil className="mr-2 h-4 w-4" />
        Edit
        <MenuShortcut>E</MenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem
        onClick={(e) => {
          e.stopPropagation()
          onShare?.()
        }}
      >
        <Icons.share className="mr-2 h-4 w-4" />
        Share
        <MenuShortcut>S</MenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem
        onClick={(e) => {
          e.stopPropagation()
          onDuplicate?.()
        }}
      >
        <Icons.copy className="mr-2 h-4 w-4" />
        Duplicate
        <MenuShortcut>D</MenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem
        onClick={(e) => {
          e.stopPropagation()
          onMove?.()
        }}
      >
        <Icons.move className="mr-2 h-4 w-4" />
        Move
        <MenuShortcut>M</MenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem
        onClick={(e) => {
          e.stopPropagation()
          onArchive?.()
        }}
      >
        <Icons.archive className="mr-2 h-4 w-4" />
        Archive
        <MenuShortcut>A</MenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        variant="destructive"
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.()
        }}
      >
        <Icons.trash className="mr-2 h-4 w-4" />
        Delete
        <MenuShortcut variant="destructive">X</MenuShortcut>
      </ContextMenuItem>
    </>
  )

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {contextMenuItems}
      </ContextMenuContent>
    </ContextMenu>
  )
}
