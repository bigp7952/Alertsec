import { useEffect, useMemo, useState } from 'react'
import apiService, { type User } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Search, MapPin, Briefcase, RefreshCw, Crown, UserCheck } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Utilisateurs() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [role, setRole] = useState<string>('tous')
  const [unite, setUnite] = useState<string>('tous')
  const [selected, setSelected] = useState<User | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getAgents()
      setUsers(data)
    } catch (e: any) {
      setError(e?.message || 'Erreur chargement utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const stats = useMemo(() => {
    const total = users.length
    const byRole = users.reduce<Record<string, number>>((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1
      return acc
    }, {})
    const unites = Array.from(new Set(users.map(u => u.unite))).filter(Boolean)
    return { total, byRole, unites }
  }, [users])

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = `${u.prenom} ${u.nom} ${u.grade} ${u.unite}`.toLowerCase().includes(searchTerm.toLowerCase())
      const matchRole = role === 'tous' || u.role === role
      const matchUnite = unite === 'tous' || u.unite === unite
      return matchSearch && matchRole && matchUnite
    })
  }, [users, searchTerm, role, unite])

  // Harmonisation aux couleurs du site (primary/secondary/success/warning)
  const roleColor = (r: string) => {
    switch (r) {
      case 'admin': return 'from-primary/15 to-primary/0 border-primary/30'
      case 'superviseur': return 'from-secondary/15 to-secondary/0 border-secondary/30'
      case 'agent': return 'from-success/15 to-success/0 border-success/30'
      case 'operateur': return 'from-accent/15 to-accent/0 border-accent/30'
      default: return 'from-muted/20 to-muted/0 border-border'
    }
  }

  const roleBadge = (r: string) => {
    switch (r) {
      case 'admin': return <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Admin</Badge>
      case 'superviseur': return <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80">Superviseur</Badge>
      case 'agent': return <Badge className="bg-success text-success-foreground hover:bg-success/90">Agent</Badge>
      case 'operateur': return <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">Opérateur</Badge>
      default: return <Badge variant="secondary">{r}</Badge>
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header coloré */}
      {/* Header style Signalements */}
      <div className="rounded-lg p-4 bg-card border border-border flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight"><Users className="h-5 w-5"/> Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">Gestion et consultation des forces opérationnelles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Rafraîchir
          </Button>
          <AddAgentButton onCreated={(a) => setUsers(prev => [a, ...prev])} />
        </div>
      </div>

      {/* Statistiques */}
      {/* Stats compactes comme Signalements */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-foreground flex items-center gap-2"><UserCheck className="h-4 w-4"/> Total</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground leading-none">{stats.total}</CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-foreground flex items-center gap-2"><Crown className="h-4 w-4"/> Par rôle</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(stats.byRole).map(([r, n]) => (
              <span key={r} className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-white/60 border text-xs">
                {roleBadge(r)}
                <span className="text-muted-foreground">{n}</span>
              </span>
            ))}
            {Object.keys(stats.byRole).length === 0 && <span className="text-sm text-muted-foreground">—</span>}
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-foreground">Unités</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {stats.unites.map(u => (<Badge key={u} variant="outline">{u}</Badge>))}
            {stats.unites.length === 0 && <span className="text-sm text-muted-foreground">—</span>}
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      {/* Barre de filtres alignée */}
      <Card className="border-border">
        <CardContent className="p-4 grid gap-3 md:grid-cols-3 items-center">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher nom, grade, unité..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue placeholder="Rôle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les rôles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superviseur">Superviseur</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="operateur">Opérateur</SelectItem>
            </SelectContent>
          </Select>
          <Select value={unite} onValueChange={setUnite}>
            <SelectTrigger><SelectValue placeholder="Unité" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Toutes les unités</SelectItem>
              {stats.unites.map(u => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Liste */}
      {loading ? (
        <div className="p-6 text-sm">Chargement…</div>
      ) : error ? (
        <div className="p-6 text-sm text-red-500">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(u => (
            <Card key={u.id} className={`hover:shadow transition-shadow border-l-4 ${'bg-card border-border '}` + (u.role === 'admin' ? 'border-l-primary' : u.role === 'superviseur' ? 'border-l-secondary' : u.role === 'agent' ? 'border-l-success' : 'border-l-accent')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Logo size="sm" className="h-4 w-4" /> {u.prenom} {u.nom}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4"/> {u.grade} · {u.role}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4"/> {u.unite} · {u.secteur}</div>
                <div className="pt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelected(u)}>Détails</Button>
                  <Button size="sm" variant="destructive" onClick={async () => { await apiService.deleteAgent(u.id as number); setUsers(prev => prev.filter(x => x.id !== u.id)) }}>Supprimer</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">Aucun utilisateur trouvé avec ces filtres.</div>
          )}
        </div>
      )}
      {/* Dialog Détail/Edition */}
      <UserDialog 
        user={selected} 
        open={!!selected} 
        onClose={() => setSelected(null)} 
        onSaved={(updated) => setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))} 
      />
    </div>
  )
}
function AddAgentButton({ onCreated }: { onCreated: (u: User) => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ role: 'agent' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    try {
      setSaving(true)
      setError(null)
      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE_URL || 'http://172.20.10.4:8000/api'}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          matricule: form.matricule,
          prenom: form.prenom,
          nom: form.nom,
          email: form.email,
          telephone: form.telephone,
          adresse: form.adresse,
          grade: form.grade,
          unite: form.unite,
          secteur: form.secteur,
          password: form.password,
        })
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Erreur création')
      onCreated(data.data)
      setOpen(false)
      setForm({})
    } catch (e: any) {
      setError(e?.message || 'Erreur création')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>Ajouter un agent</Button>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nouvel agent</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Matricule</label>
              <Input value={form.matricule || ''} onChange={e => setForm({ ...form, matricule: e.target.value })} placeholder="POL123" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <Input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="agent@alertsec.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Prénom</label>
              <Input value={form.prenom || ''} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Amadou" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nom</label>
              <Input value={form.nom || ''} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Diop" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Téléphone</label>
              <Input value={form.telephone || ''} onChange={e => setForm({ ...form, telephone: e.target.value })} placeholder="+221 ..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Unité</label>
              <Input value={form.unite || ''} onChange={e => setForm({ ...form, unite: e.target.value })} placeholder="Brigade Mobile" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Secteur</label>
              <Input value={form.secteur || ''} onChange={e => setForm({ ...form, secteur: e.target.value })} placeholder="Centre-Ville" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Grade</label>
              <Input value={form.grade || ''} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="Agent Principal" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Adresse</label>
            <Input value={form.adresse || ''} onChange={e => setForm({ ...form, adresse: e.target.value })} placeholder="Adresse complète" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Mot de passe</label>
            <Input type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={create} disabled={saving}>{saving ? 'Création…' : 'Créer'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Dialog détail/CRUD
function UserDialog({ user, open, onClose, onSaved }: { user: User | null; open: boolean; onClose: () => void; onSaved: (u: User) => void }) {
  const [form, setForm] = useState<Partial<User>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) setForm(user)
  }, [user])

  const save = async () => {
    if (!user) return
    try {
      setSaving(true)
      setError(null)
      const updated = await apiService.updateAgent(user.id as number, {
        prenom: form.prenom,
        nom: form.nom,
        grade: form.grade,
        unite: form.unite,
        secteur: form.secteur,
        charge_travail: form.charge_travail,
        experience: form.experience,
      })
      onSaved(updated)
      onClose()
    } catch (e: any) {
      setError(e?.message || 'Erreur sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Profil utilisateur</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Input value={form.prenom || ''} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Prénom" />
              <Input value={form.nom || ''} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Nom" />
            </div>
            <Input value={form.grade || ''} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="Grade" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={form.unite || ''} onChange={e => setForm({ ...form, unite: e.target.value })} placeholder="Unité" />
              <Input value={form.secteur || ''} onChange={e => setForm({ ...form, secteur: e.target.value })} placeholder="Secteur" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" />
              <Input value={form.telephone || ''} onChange={e => setForm({ ...form, telephone: e.target.value })} placeholder="Téléphone" />
            </div>
            <Input value={form.adresse || ''} onChange={e => setForm({ ...form, adresse: e.target.value })} placeholder="Adresse" />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" value={Number(form.experience || 0)} onChange={e => setForm({ ...form, experience: Number(e.target.value) })} placeholder="Expérience" />
              <Input type="number" value={Number(form.charge_travail || 0)} onChange={e => setForm({ ...form, charge_travail: Number(e.target.value) })} placeholder="Charge travail" />
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Annuler</Button>
              <Button onClick={save} disabled={saving}>{saving ? 'Sauvegarde…' : 'Enregistrer'}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}