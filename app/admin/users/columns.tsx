"use client"

import React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { User } from "@/db/schema"
import { UserEditDialog } from "@/components/user-edit-dialog"
import { UserDeleteDialog } from "@/components/user-delete-dialog"
import { UserStatusDialog } from "@/components/user-status-dialog"

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          用户名
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          邮箱
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "membershipLevel",
    header: "会员等级",
    cell: ({ row }) => {
      const level = row.getValue("membershipLevel") as string
      const levelMap = {
        free: { label: "免费", variant: "secondary" as const },
        premium: { label: "高级", variant: "default" as const },
        vip: { label: "VIP", variant: "destructive" as const },
      }
      const levelInfo = levelMap[level as keyof typeof levelMap] || levelMap.free
      
      return (
        <Badge variant={levelInfo.variant}>
          {levelInfo.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status === "active" ? "活跃" : "禁用"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          注册时间
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return date.toLocaleDateString("zh-CN")
    },
  },
  {
    accessorKey: "lastLoginAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          最后登录
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("lastLoginAt") as Date | null
      return date ? date.toLocaleDateString("zh-CN") : "从未登录"
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      const [editOpen, setEditOpen] = React.useState(false)
      const [deleteOpen, setDeleteOpen] = React.useState(false)
      const [statusOpen, setStatusOpen] = React.useState(false)

      const handleSuccess = () => {
        // 这里可以添加刷新数据的逻辑
        window.location.reload()
      }

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">打开菜单</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                编辑用户
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusOpen(true)}>
                {user.status === "active" ? "禁用用户" : "启用用户"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setDeleteOpen(true)}
              >
                删除用户
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <UserEditDialog
            user={user}
            open={editOpen}
            onOpenChange={setEditOpen}
            onSuccess={handleSuccess}
          />

          <UserStatusDialog
            user={user}
            open={statusOpen}
            onOpenChange={setStatusOpen}
            onSuccess={handleSuccess}
          />

          <UserDeleteDialog
            user={user}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onSuccess={handleSuccess}
          />
        </>
      )
    },
  },
]
