import { Bell } from 'lucide-react'

export function PoliceHeader() {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-background/80">
      <div className="font-semibold">Vigil Alert Hub</div>
      <div className="flex items-center gap-3">
        <Bell className="h-4 w-4" />
      </div>
    </div>
  )
}