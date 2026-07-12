import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Shield, ShieldOff, User as UserIcon, UserPlus, FileDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  listUsersWithRoles,
  grantRole,
  revokeRole,
  adminCreateUser,
  listPreapprovedRoles,
  addPreapprovedRole,
  removePreapprovedRole,
} from "@/lib/cms.functions";
import { getMyRoles } from "@/lib/admin.functions";
import { exportRowsToPdf } from "@/lib/pdf-export";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersAdmin,
});

const ROLES = ["super_admin", "admin", "content_manager"] as const;
type RoleV = (typeof ROLES)[number];

const ROLE_LABEL: Record<RoleV, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  content_manager: "Content Manager",
};

function UsersAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<Record<string, RoleV>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [preEmail, setPreEmail] = useState("");
  const [preRole, setPreRole] = useState<RoleV>("content_manager");

  const { data: me } = useQuery({ queryKey: ["my-roles"], queryFn: () => getMyRoles() });
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listUsersWithRoles(),
  });
  const isSuper = me?.isSuperAdmin ?? false;
  const { data: preapproved = [], isLoading: preLoading } = useQuery({
    queryKey: ["preapproved-roles"],
    queryFn: () => listPreapprovedRoles(),
    enabled: isSuper,
  });

  const grant = useMutation({
    mutationFn: (v: { user_id: string; role: RoleV }) => grantRole({ data: v }),
    onSuccess: () => { toast.success("Role granted"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const revoke = useMutation({
    mutationFn: (v: { user_id: string; role: RoleV }) => revokeRole({ data: v }),
    onSuccess: () => { toast.success("Role revoked"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const preAdd = useMutation({
    mutationFn: (v: { email: string; role: RoleV }) => addPreapprovedRole({ data: v }),
    onSuccess: () => {
      toast.success("Pre-approved role added");
      setPreEmail("");
      qc.invalidateQueries({ queryKey: ["preapproved-roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const preRemove = useMutation({
    mutationFn: (id: string) => removePreapprovedRole({ data: { id } }),
    onSuccess: () => {
      toast.success("Pre-approved role removed");
      qc.invalidateQueries({ queryKey: ["preapproved-roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = (data ?? []).filter((u) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (u.email ?? "").toLowerCase().includes(q) || (u.full_name ?? "").toLowerCase().includes(q);
  });

  const exportPdf = () => {
    exportRowsToPdf({
      title: "Users & Roles",
      subtitle: `${items.length} users`,
      filename: `users-${new Date().toISOString().slice(0, 10)}.pdf`,
      columns: [
        { header: "Name", accessor: (u) => u.full_name ?? "—" },
        { header: "Email", accessor: (u) => u.email ?? "" },
        { header: "Roles", accessor: (u) => u.roles.map((r) => ROLE_LABEL[r as RoleV] ?? r).join(", ") || "—" },
        { header: "Joined", accessor: (u) => new Date(u.created_at).toLocaleDateString() },
      ],
      rows: items,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Users & Roles</h1>
          <p className="text-sm text-muted-foreground">
            {isSuper
              ? "Add users, then grant or revoke roles."
              : "Only Super Admins can add users or grant roles."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportPdf} disabled={items.length === 0}>
            <FileDown className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          {isSuper && (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><UserPlus className="mr-2 h-4 w-4" /> Add user</Button>
              </DialogTrigger>
              <AddUserDialog onClose={() => setAddOpen(false)} onCreated={() => qc.invalidateQueries({ queryKey: ["admin-users"] })} />
            </Dialog>
          )}
        </div>
      </div>

      <Card className="p-3">
        <Input placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>

      {isSuper && (
        <Card className="p-4 space-y-3">
          <div>
            <h2 className="font-medium">Pre-approve role by email (before signup)</h2>
            <p className="text-xs text-muted-foreground">
              Assign roles to an email in advance. When that email completes signup (Google or email), role is auto-applied.
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-[1fr_220px_auto]">
            <Input
              type="email"
              value={preEmail}
              onChange={(e) => setPreEmail(e.target.value)}
              placeholder="future.user@example.com"
            />
            <Select value={preRole} onValueChange={(v: RoleV) => setPreRole(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              onClick={() => preAdd.mutate({ email: preEmail.trim(), role: preRole })}
              disabled={preAdd.isPending || !preEmail.trim()}
            >
              Add pre-approval
            </Button>
          </div>

          <div className="rounded-md border">
            {preLoading ? (
              <div className="p-3 text-sm text-muted-foreground">Loading pre-approved roles...</div>
            ) : preapproved.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">No pre-approved roles yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preapproved.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{ROLE_LABEL[p.role as RoleV] ?? p.role}</TableCell>
                      <TableCell>
                        <Badge variant={p.used_at ? "secondary" : "default"}>
                          {p.used_at ? "Used" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!!p.used_at || preRemove.isPending}
                          onClick={() => preRemove.mutate(p.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No users match.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Joined</TableHead>
                {isSuper && <TableHead className="text-right">Grant role</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((u) => {
                const pendingRole = pending[u.id] ?? "content_manager";
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <UserIcon className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="font-medium">{u.full_name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.length === 0 && <span className="text-xs text-muted-foreground">No roles</span>}
                        {u.roles.map((r) => (
                          <Badge key={r} variant={r === "super_admin" ? "default" : "secondary"} className="gap-1">
                            <Shield className="h-3 w-3" /> {ROLE_LABEL[r as RoleV] ?? r}
                            {isSuper && (
                              <button
                                type="button"
                                onClick={() =>
                                  window.confirm(`Revoke ${ROLE_LABEL[r as RoleV] ?? r} from ${u.email}?`) &&
                                  revoke.mutate({ user_id: u.id, role: r as RoleV })
                                }
                                aria-label="Revoke"
                                className="ml-1 opacity-70 hover:opacity-100"
                              >
                                <ShieldOff className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    {isSuper && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Select
                            value={pendingRole}
                            onValueChange={(v: RoleV) => setPending((p) => ({ ...p, [u.id]: v }))}
                          >
                            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {ROLES.filter((r) => !u.roles.includes(r)).map((r) => (
                                <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            disabled={u.roles.includes(pendingRole)}
                            onClick={() => grant.mutate({ user_id: u.id, role: pendingRole })}
                          >
                            Grant
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function AddUserDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleV | "none">("none");
  const [sendInvite, setSendInvite] = useState(false);

  const create = useMutation({
    mutationFn: () =>
      adminCreateUser({
        data: {
          email: email.trim(),
          full_name: fullName.trim() || null,
          password: sendInvite ? null : password,
          role: role === "none" ? null : role,
          send_invite: sendInvite,
        },
      }),
    onSuccess: () => {
      toast.success(sendInvite ? "Invite sent" : "User created");
      onCreated();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Add user</DialogTitle>
        <DialogDescription>Create an account or send an email invite.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="grid gap-1.5">
          <Label>Email *</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@example.com" />
        </div>
        <div className="grid gap-1.5">
          <Label>Full name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={sendInvite} onCheckedChange={setSendInvite} id="invite" />
          <Label htmlFor="invite" className="cursor-pointer">Send email invite (user sets their own password)</Label>
        </div>
        {!sendInvite && (
          <div className="grid gap-1.5">
            <Label>Temporary password *</Label>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min. 8 characters" />
            <p className="text-xs text-muted-foreground">Share with the user privately; they can change it later.</p>
          </div>
        )}
        <div className="grid gap-1.5">
          <Label>Assign role</Label>
          <Select value={role} onValueChange={(v: RoleV | "none") => setRole(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— No role —</SelectItem>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => create.mutate()}
          disabled={create.isPending || !email || (!sendInvite && password.length < 8)}
        >
          {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {sendInvite ? "Send invite" : "Create user"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
