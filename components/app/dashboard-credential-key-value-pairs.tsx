"use client"

import { useState, useEffect } from "react"
import { 
  useCredentialKeyValuePairs, 
  useUpdateCredentialKeyValuePairs 
} from "@/orpc/hooks/use-credentials"
import { handleErrors } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/shared/icons"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface KeyValuePair {
  id?: string
  key: string
  value: string
  createdAt?: Date
  updatedAt?: Date
}

interface CredentialKeyValuePairsProps {
  credentialId: string
}

export function CredentialKeyValuePairs({ credentialId }: CredentialKeyValuePairsProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [localPairs, setLocalPairs] = useState<KeyValuePair[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  const {
    data: keyValuePairs = [],
    isLoading,
    error,
  } = useCredentialKeyValuePairs(credentialId)

  const updateKeyValuePairsMutation = useUpdateCredentialKeyValuePairs()

  // Initialize local pairs when data loads
  useEffect(() => {
    if (keyValuePairs.length > 0) {
      setLocalPairs(keyValuePairs.map(kv => ({
        id: kv.id,
        key: kv.key,
        value: kv.value,
        createdAt: kv.createdAt,
        updatedAt: kv.updatedAt,
      })))
    } else {
      setLocalPairs([])
    }
    setHasChanges(false)
  }, [keyValuePairs])

  const handleAddPair = () => {
    const newPair: KeyValuePair = {
      key: "",
      value: "",
    }
    setLocalPairs([...localPairs, newPair])
    setHasChanges(true)
  }

  const handleRemovePair = (index: number) => {
    const updatedPairs = localPairs.filter((_, i) => i !== index)
    setLocalPairs(updatedPairs)
    setHasChanges(true)
  }

  const handleKeyChange = (index: number, newKey: string) => {
    // Check for duplicate keys
    const trimmedKey = newKey.trim()
    if (trimmedKey) {
      const isDuplicate = localPairs.some(
        (pair, i) => i !== index && pair.key.trim().toLowerCase() === trimmedKey.toLowerCase()
      )
      
      if (isDuplicate) {
        toast("A key with this name already exists. Please use a unique key name.", "error")
        return
      }
    }

    const updatedPairs = localPairs.map((pair, i) =>
      i === index ? { ...pair, key: newKey } : pair
    )
    setLocalPairs(updatedPairs)
    setHasChanges(true)
  }

  const handleValueChange = (index: number, newValue: string) => {
    const updatedPairs = localPairs.map((pair, i) =>
      i === index ? { ...pair, value: newValue } : pair
    )
    setLocalPairs(updatedPairs)
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      // Filter out empty pairs
      const validPairs = localPairs.filter(pair => 
        pair.key.trim() && pair.value.trim()
      )

      await updateKeyValuePairsMutation.mutateAsync({
        credentialId,
        keyValuePairs: validPairs,
      })

      toast("Key-value pairs updated successfully", "success")
      setIsEditing(false)
      setHasChanges(false)
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to update key-value pairs"
      )
      toast(
        details
          ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
          : message,
        "error"
      )
    }
  }

  const handleCancel = () => {
    // Reset to original data
    if (keyValuePairs.length > 0) {
      setLocalPairs(keyValuePairs.map(kv => ({
        id: kv.id,
        key: kv.key,
        value: kv.value,
        createdAt: kv.createdAt,
        updatedAt: kv.updatedAt,
      })))
    } else {
      setLocalPairs([])
    }
    setIsEditing(false)
    setHasChanges(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Icons.spinner className="size-4 animate-spin" />
            <CardTitle>Loading Additional Information...</CardTitle>
          </div>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Data</CardTitle>
          <CardDescription>
            Failed to load additional information. Please try again.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Store sensitive key-value pairs with encrypted values
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {keyValuePairs.length > 0 && (
              <Badge variant="secondary">
                {keyValuePairs.length} pair{keyValuePairs.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Icons.pencil className="mr-2 size-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          // View mode
          <div className="space-y-4">
            {keyValuePairs.length === 0 ? (
              <div className="text-center py-8">
                <Icons.info className="mx-auto size-12 text-muted-foreground" />
                <h3 className="mt-4 text-sm font-medium">No additional information</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add custom key-value pairs to store additional credential information.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsEditing(true)}
                >
                  <Icons.add className="mr-2 size-4" />
                  Add Information
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {keyValuePairs.map((pair, index) => (
                  <div key={pair.id || index} className="flex items-center justify-between py-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{pair.key}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {pair.value}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(pair.value)
                              toast("Value copied to clipboard", "success")
                            }}
                          >
                            <Icons.copy className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy value</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Edit mode
          <div className="space-y-4">
            <div className="space-y-3">
              {localPairs.map((pair, index) => (
                <div key={index} className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label htmlFor={`key-${index}`}>Key</Label>
                    <Input
                      id={`key-${index}`}
                      placeholder="Enter key name"
                      value={pair.key}
                      onChange={(e) => handleKeyChange(index, e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`value-${index}`}>Value</Label>
                    <Input
                      id={`value-${index}`}
                      placeholder="Enter value"
                      value={pair.value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePair(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Icons.trash className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddPair}
              className="w-full"
            >
              <Icons.add className="mr-2 size-4" />
              Add Pair
            </Button>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {hasChanges && "You have unsaved changes"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateKeyValuePairsMutation.isPending}
                >
                  {updateKeyValuePairsMutation.isPending ? (
                    <>
                      <Icons.spinner className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icons.save className="mr-2 size-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
