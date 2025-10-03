import { useReducer } from "react"

// Dialog state management types
type DialogState<T = Record<string, unknown>> = {
  open: boolean
  data: T | null
}

type DialogAction<T = Record<string, unknown>> =
  | { type: "OPEN"; payload: T }
  | { type: "CLOSE" }

function dialogReducer<T = Record<string, unknown>>(
  state: DialogState<T>,
  action: DialogAction<T>
): DialogState<T> {
  switch (action.type) {
    case "OPEN":
      return {
        open: true,
        data: action.payload,
      }
    case "CLOSE":
      return {
        open: false,
        data: null,
      }
    default:
      return state
  }
}

// Custom hook for managing dialog state
export function useDialogState<T = Record<string, unknown>>(initialState?: T) {
  const [state, dispatch] = useReducer(dialogReducer<T>, {
    open: false,
    data: initialState || null,
  })

  const openDialog = (data: T) => {
    dispatch({ type: "OPEN", payload: data })
  }

  const closeDialog = () => {
    dispatch({ type: "CLOSE" })
  }

  return {
    isOpen: state.open,
    data: state.data,
    openDialog,
    closeDialog,
  }
}

// Multiple dialogs state management
type MultiDialogState = {
  moveDialog: DialogState<{
    id: string
    identifier: string
    containerId?: string | null
  }>
  deleteDialog: DialogState<{
    id: string
    identifier: string
  }>
}

type MultiDialogAction =
  | {
      type: "OPEN_MOVE_DIALOG"
      payload: { id: string; identifier: string; containerId?: string | null }
    }
  | { type: "CLOSE_MOVE_DIALOG" }
  | { type: "OPEN_DELETE_DIALOG"; payload: { id: string; identifier: string } }
  | { type: "CLOSE_DELETE_DIALOG" }

const initialMultiDialogState: MultiDialogState = {
  moveDialog: {
    open: false,
    data: null,
  },
  deleteDialog: {
    open: false,
    data: null,
  },
}

function multiDialogReducer(
  state: MultiDialogState,
  action: MultiDialogAction
): MultiDialogState {
  switch (action.type) {
    case "OPEN_MOVE_DIALOG":
      return {
        ...state,
        moveDialog: {
          open: true,
          data: action.payload,
        },
      }
    case "CLOSE_MOVE_DIALOG":
      return {
        ...state,
        moveDialog: {
          open: false,
          data: null,
        },
      }
    case "OPEN_DELETE_DIALOG":
      return {
        ...state,
        deleteDialog: {
          open: true,
          data: action.payload,
        },
      }
    case "CLOSE_DELETE_DIALOG":
      return {
        ...state,
        deleteDialog: {
          open: false,
          data: null,
        },
      }
    default:
      return state
  }
}

// Custom hook for managing multiple dialogs
export function useMultiDialogState() {
  const [state, dispatch] = useReducer(
    multiDialogReducer,
    initialMultiDialogState
  )

  const openMoveDialog = (payload: {
    id: string
    identifier: string
    containerId?: string | null
  }) => {
    dispatch({ type: "OPEN_MOVE_DIALOG", payload })
  }

  const closeMoveDialog = () => {
    dispatch({ type: "CLOSE_MOVE_DIALOG" })
  }

  const openDeleteDialog = (payload: { id: string; identifier: string }) => {
    dispatch({ type: "OPEN_DELETE_DIALOG", payload })
  }

  const closeDeleteDialog = () => {
    dispatch({ type: "CLOSE_DELETE_DIALOG" })
  }

  return {
    moveDialog: {
      isOpen: state.moveDialog.open,
      data: state.moveDialog.data,
      open: openMoveDialog,
      close: closeMoveDialog,
    },
    deleteDialog: {
      isOpen: state.deleteDialog.open,
      data: state.deleteDialog.data,
      open: openDeleteDialog,
      close: closeDeleteDialog,
    },
  }
}
