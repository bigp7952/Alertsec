import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  Users, 
  MessageSquare, 
  Check, 
  ArrowRight 
} from "lucide-react"
import { Logo } from '@/components/ui/logo'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Dashboard", url: "/", icon: Check },
  { title: "Tous les signalements", url: "/signalements", icon: MessageSquare },
  { title: "Cas graves", url: "/cas-graves", icon: Check },
  { title: "Utilisateurs", url: "/utilisateurs", icon: Users },
  { title: "Feedbacks", url: "/feedbacks", icon: ArrowRight },
]

export function PoliceSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "hover:bg-sidebar-accent/50"

  return (
    <Sidebar
      className={collapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Logo Section */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            {!collapsed && (
              <div>
                <h2 className="font-bold text-lg text-sidebar-foreground">AlertSec</h2>
                <p className="text-sm text-sidebar-foreground/70">Forces de l'ordre</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}