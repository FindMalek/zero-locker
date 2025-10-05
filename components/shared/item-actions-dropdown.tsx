import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  useDuplicateCredential,
  useUpdateCredential,
} from "@/orpc/hooks/use-credentials"

import { useMultiDialogState } from "@/hooks/use-dialog-state"
import { useToast } from "@/hooks/use-toast"

import { DashboardQrCodeDialog } from "@/components/app/dashboard-qr-code-dialog"
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

interface CredentialActionsProps {
  credentialId: string
  credentialIdentifier: string
  containerId?: string | null
  variant?: "dropdown" | "context"
  children?: React.ReactNode
}

interface MenuItemsConfig {
  MenuItem: typeof DropdownMenuItem | typeof ContextMenuItem
  MenuSeparator: typeof DropdownMenuSeparator | typeof ContextMenuSeparator
  iconSize: string
  stopPropagation: boolean
  actions: {
    onEdit?: () => void
    onShare?: () => void
    onDuplicate?: () => void
    onMove?: () => void
    onArchive?: () => void
    onDelete?: () => void
  }
}

function renderMenuItems({
  MenuItem,
  MenuSeparator,
  iconSize,
  stopPropagation,
  actions,
}: MenuItemsConfig) {
  const handleClick = (action?: () => void) => {
    if (stopPropagation) {
      return (e: React.MouseEvent) => {
        e.stopPropagation()
        action?.()
      }
    }
    return action
  }

  const hasMainActions =
    actions.onEdit ||
    actions.onShare ||
    actions.onDuplicate ||
    actions.onMove ||
    actions.onArchive

  return (
    <>
      {actions.onEdit && (
        <MenuItem onClick={handleClick(actions.onEdit)}>
          <Icons.pencil className={`mr-2 ${iconSize}`} />
          Edit
          <MenuShortcut>E</MenuShortcut>
        </MenuItem>
      )}
      {actions.onShare && (
        <MenuItem onClick={handleClick(actions.onShare)}>
          <Icons.share className={`mr-2 ${iconSize}`} />
          Share
          <MenuShortcut>S</MenuShortcut>
        </MenuItem>
      )}
      {actions.onDuplicate && (
        <MenuItem onClick={handleClick(actions.onDuplicate)}>
          <Icons.copy className={`mr-2 ${iconSize}`} />
          Duplicate
          <MenuShortcut>D</MenuShortcut>
        </MenuItem>
      )}
      {actions.onMove && (
        <MenuItem onClick={handleClick(actions.onMove)}>
          <Icons.move className={`mr-2 ${iconSize}`} />
          Move
          <MenuShortcut>M</MenuShortcut>
        </MenuItem>
      )}
      {actions.onArchive && (
        <MenuItem onClick={handleClick(actions.onArchive)}>
          <Icons.archive className={`mr-2 ${iconSize}`} />
          Archive
          <MenuShortcut>A</MenuShortcut>
        </MenuItem>
      )}
      {hasMainActions && actions.onDelete && <MenuSeparator />}
      {actions.onDelete && (
        <MenuItem variant="destructive" onClick={handleClick(actions.onDelete)}>
          <Icons.trash className={`mr-2 ${iconSize}`} />
          Delete
          <MenuShortcut variant="destructive">X</MenuShortcut>
        </MenuItem>
      )}
    </>
  )
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
  const menuItems = renderMenuItems({
    MenuItem: DropdownMenuItem,
    MenuSeparator: DropdownMenuSeparator,
    iconSize: "size-3",
    stopPropagation: false,
    actions: {
      onEdit,
      onShare,
      onDuplicate,
      onMove,
      onArchive,
      onDelete,
    },
  })

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="size-8 p-0">
            <Icons.more className="size-3" />
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

export function CredentialActionsDropdown({
  credentialId,
  credentialIdentifier,
  containerId,
  variant = "dropdown",
}: CredentialActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const updateCredentialMutation = useUpdateCredential()
  const duplicateCredentialMutation = useDuplicateCredential()
  const dialogs = useMultiDialogState()
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false)

  const handleEdit = () => {
    router.push(`/dashboard/accounts/${credentialId}`)
  }

  const handleShare = () => {
    setQrCodeDialogOpen(true)
  }

  const handleDuplicate = async () => {
    try {
      const duplicatedCredential =
        await duplicateCredentialMutation.mutateAsync({
          id: credentialId,
        })

      toast(
        `"${duplicatedCredential.identifier}" has been created successfully.`,
        "success"
      )

      router.push(`/dashboard/accounts/${duplicatedCredential.id}`)
    } catch (error) {
      console.log(error)
      toast("Failed to duplicate credential. Please try again later.", "error")
    }
  }

  const handleMove = () => {
    dialogs.moveDialog.open({
      id: credentialId,
      identifier: credentialIdentifier,
      containerId,
    })
  }

  const handleArchive = async () => {
    try {
      await updateCredentialMutation.mutateAsync({
        id: credentialId,
        status: "SUSPENDED",
      })

      toast("The credential has been archived successfully.", "success")
    } catch (error) {
      console.log(error)
      toast("Failed to archive credential. Please try again later.", "error")
    }
  }

  const handleDelete = () => {
    dialogs.deleteDialog.open({
      id: credentialId,
      identifier: credentialIdentifier,
    })
  }

  const menuItems = renderMenuItems({
    MenuItem: DropdownMenuItem,
    MenuSeparator: DropdownMenuSeparator,
    iconSize: "size-3",
    stopPropagation: false,
    actions: {
      onEdit: handleEdit,
      onShare: handleShare,
      onDuplicate: handleDuplicate,
      onMove: handleMove,
      onArchive: handleArchive,
      onDelete: handleDelete,
    },
  })

  if (variant === "dropdown") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="size-8 p-0">
              <Icons.more className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {menuItems}
          </DropdownMenuContent>
        </DropdownMenu>

        <DashboardQrCodeDialog
          open={qrCodeDialogOpen}
          onOpenChange={setQrCodeDialogOpen}
          credentialId={credentialId}
        />
      </>
    )
  }

  return null
}

export function CredentialActionsContextMenu({
  credentialId,
  credentialIdentifier,
  containerId,
  children,
}: CredentialActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const updateCredentialMutation = useUpdateCredential()
  const duplicateCredentialMutation = useDuplicateCredential()
  const dialogs = useMultiDialogState()
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false)

  const handleEdit = () => {
    router.push(`/dashboard/accounts/${credentialId}`)
  }

  const handleShare = () => {
    setQrCodeDialogOpen(true)
  }

  const handleDuplicate = async () => {
    try {
      const duplicatedCredential =
        await duplicateCredentialMutation.mutateAsync({
          id: credentialId,
        })

      toast(
        `"${duplicatedCredential.identifier}" has been created successfully.`,
        "success"
      )

      router.push(`/dashboard/accounts/${duplicatedCredential.id}`)
    } catch (error) {
      console.log(error)
      toast("Failed to duplicate credential. Please try again later.", "error")
    }
  }

  const handleMove = () => {
    dialogs.moveDialog.open({
      id: credentialId,
      identifier: credentialIdentifier,
      containerId,
    })
  }

  const handleArchive = async () => {
    try {
      await updateCredentialMutation.mutateAsync({
        id: credentialId,
        status: "SUSPENDED",
      })

      toast("The credential has been archived successfully.", "success")
    } catch (error) {
      console.log(error)
      toast("Failed to archive credential. Please try again later.", "error")
    }
  }

  const handleDelete = () => {
    dialogs.deleteDialog.open({
      id: credentialId,
      identifier: credentialIdentifier,
    })
  }

  const contextMenuItems = renderMenuItems({
    MenuItem: ContextMenuItem,
    MenuSeparator: ContextMenuSeparator,
    iconSize: "size-4",
    stopPropagation: true,
    actions: {
      onEdit: handleEdit,
      onShare: handleShare,
      onDuplicate: handleDuplicate,
      onMove: handleMove,
      onArchive: handleArchive,
      onDelete: handleDelete,
    },
  })

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          {contextMenuItems}
        </ContextMenuContent>
      </ContextMenu>

      <DashboardQrCodeDialog
        open={qrCodeDialogOpen}
        onOpenChange={setQrCodeDialogOpen}
        credentialId={credentialId}
      />
    </>
  )
}
