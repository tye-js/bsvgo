"use client"

import { useState } from 'react'
import { User } from '@/db/schema'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface UserStatusDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UserStatusDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserStatusDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const isActive = user?.status === 'active'
  const newStatus = isActive ? 'disabled' : 'active'
  const actionText = isActive ? '禁用' : '启用'

  async function handleStatusChange() {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `${actionText}用户失败`)
      }

      toast({
        title: '成功',
        description: `用户已${actionText}`,
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : `${actionText}用户失败`,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认{actionText}用户</AlertDialogTitle>
          <AlertDialogDescription>
            您确定要{actionText}用户 <strong>{user?.name}</strong> 吗？
            <br />
            {isActive 
              ? '禁用后，该用户将无法登录系统。' 
              : '启用后，该用户将可以正常登录系统。'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleStatusChange}
            disabled={isLoading}
            className={isActive ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            {isLoading ? `${actionText}中...` : `确认${actionText}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
