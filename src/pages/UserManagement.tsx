import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldCheck,
  Loader2,
  Users,
  Building2,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppRole, roleConfig, rolesRequiring2FA, UserProfile } from "@/types/roles";
import { z } from "zod";
import { format } from "date-fns";

interface UserWithRoles extends UserProfile {
  roles: AppRole[];
}

const createUserSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid corporate email"),
  mobile_number: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roles: z.array(z.string()).min(1, "Please select at least one role"),
});

const UserManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    mobile_number: "",
    department: "",
    position: "",
    password: "",
    roles: [] as string[],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: allRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => ({
        ...profile,
        roles: (allRoles || [])
          .filter((r) => r.user_id === profile.user_id)
          .map((r) => r.role as AppRole),
      }));

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    try {
      createUserSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          errors[error.path[0] as string] = error.message;
        });
        setFormErrors(errors);
        return;
      }
    }

    setFormLoading(true);

    try {
      // Create user via Supabase Auth Admin API
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            mobile_number: formData.mobile_number,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast({
            title: "User Already Exists",
            description: "A user with this email already exists.",
            variant: "destructive",
          });
        } else {
          throw authError;
        }
        return;
      }

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // Update profile with additional fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          department: formData.department || null,
          position: formData.position || null,
        })
        .eq('user_id', authData.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      // Assign roles
      const roleInserts = formData.roles.map((role) => ({
        user_id: authData.user!.id,
        role: role as AppRole,
        assigned_by: user?.id,
      }));

      const { error: rolesError } = await supabase
        .from('user_roles')
        .insert(roleInserts);

      if (rolesError) throw rolesError;

      toast({
        title: "User Created",
        description: `${formData.full_name} has been successfully added.`,
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateRoles = async () => {
    if (!selectedUser) return;
    
    setFormLoading(true);

    try {
      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.user_id);

      if (deleteError) throw deleteError;

      // Insert new roles
      if (formData.roles.length > 0) {
        const roleInserts = formData.roles.map((role) => ({
          user_id: selectedUser.user_id,
          role: role as AppRole,
          assigned_by: user?.id,
        }));

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(roleInserts);

        if (insertError) throw insertError;
      }

      toast({
        title: "Roles Updated",
        description: `Roles for ${selectedUser.full_name} have been updated.`,
      });

      setIsEditDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Error updating roles:', err);
      toast({
        title: "Error",
        description: "Failed to update roles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (userProfile: UserWithRoles) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !userProfile.is_active })
        .eq('id', userProfile.id);

      if (error) throw error;

      toast({
        title: userProfile.is_active ? "User Deactivated" : "User Activated",
        description: `${userProfile.full_name} has been ${userProfile.is_active ? 'deactivated' : 'activated'}.`,
      });

      fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      mobile_number: "",
      department: "",
      position: "",
      password: "",
      roles: [],
    });
    setFormErrors({});
    setSelectedUser(null);
  };

  const openEditDialog = (userProfile: UserWithRoles) => {
    setSelectedUser(userProfile);
    setFormData({
      ...formData,
      roles: userProfile.roles,
    });
    setIsEditDialogOpen(true);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || u.roles.includes(roleFilter as AppRole);
    
    return matchesSearch && matchesRole;
  });

  const bankRoles: AppRole[] = ['initiator', 'approver', 'auditor'];
  const platformRoles: AppRole[] = ['super_admin', 'system_admin', 'operation'];

  return (
    <DashboardLayout title="User Management" subtitle="Manage users, roles, and access permissions">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.roles.some(r => bankRoles.includes(r))).length}
                </p>
                <p className="text-sm text-muted-foreground">Bank Users</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.is_2fa_enabled).length}
                </p>
                <p className="text-sm text-muted-foreground">2FA Enabled</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="---bank---" disabled className="font-semibold text-muted-foreground">
                  Bank Roles
                </SelectItem>
                {bankRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleConfig[role].label}
                  </SelectItem>
                ))}
                <SelectItem value="---platform---" disabled className="font-semibold text-muted-foreground">
                  Platform Roles
                </SelectItem>
                {platformRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleConfig[role].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" onClick={() => resetForm()}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the platform. Admins should be created through this controlled onboarding.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="John Doe"
                      className={formErrors.full_name ? 'border-destructive' : ''}
                    />
                    {formErrors.full_name && (
                      <p className="text-sm text-destructive">{formErrors.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Corporate Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@bank.ae"
                      className={formErrors.email ? 'border-destructive' : ''}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-destructive">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile_number">Mobile Number</Label>
                    <Input
                      id="mobile_number"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      placeholder="+971 50 123 4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Initial Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className={formErrors.password ? 'border-destructive' : ''}
                    />
                    {formErrors.password && (
                      <p className="text-sm text-destructive">{formErrors.password}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Treasury"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Senior Manager"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Assign Roles *</Label>
                  {formErrors.roles && (
                    <p className="text-sm text-destructive">{formErrors.roles}</p>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Bank Roles</p>
                      <div className="space-y-2">
                        {bankRoles.map((role) => (
                          <div key={role} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <Checkbox
                              id={`role-${role}`}
                              checked={formData.roles.includes(role)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({ ...formData, roles: [...formData.roles, role] });
                                } else {
                                  setFormData({ ...formData, roles: formData.roles.filter(r => r !== role) });
                                }
                              }}
                            />
                            <div className="flex-1">
                              <label htmlFor={`role-${role}`} className="font-medium cursor-pointer flex items-center gap-2">
                                {roleConfig[role].label}
                                {rolesRequiring2FA.includes(role) && (
                                  <Badge variant="outline" className="text-xs">2FA Required</Badge>
                                )}
                              </label>
                              <p className="text-sm text-muted-foreground">{roleConfig[role].description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Platform Roles</p>
                      <div className="space-y-2">
                        {platformRoles.map((role) => (
                          <div key={role} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <Checkbox
                              id={`role-${role}`}
                              checked={formData.roles.includes(role)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({ ...formData, roles: [...formData.roles, role] });
                                } else {
                                  setFormData({ ...formData, roles: formData.roles.filter(r => r !== role) });
                                }
                              }}
                            />
                            <div className="flex-1">
                              <label htmlFor={`role-${role}`} className="font-medium cursor-pointer flex items-center gap-2">
                                {roleConfig[role].label}
                                {rolesRequiring2FA.includes(role) && (
                                  <Badge variant="outline" className="text-xs">2FA Required</Badge>
                                )}
                              </label>
                              <p className="text-sm text-muted-foreground">{roleConfig[role].description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gold" disabled={formLoading}>
                    {formLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg">No users found</h3>
              <p className="text-muted-foreground">
                {searchQuery || roleFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first user"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden sm:table-cell">Roles</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden lg:table-cell">2FA</TableHead>
                    <TableHead className="hidden lg:table-cell">Status</TableHead>
                    <TableHead className="hidden xl:table-cell">Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userProfile) => (
                    <TableRow key={userProfile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {userProfile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">{userProfile.full_name}</p>
                            <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {userProfile.roles.slice(0, 2).map((role) => (
                            <Badge 
                              key={role} 
                              variant={roleConfig[role].category === 'platform' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {roleConfig[role].label}
                            </Badge>
                          ))}
                          {userProfile.roles.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{userProfile.roles.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {userProfile.department || '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {userProfile.is_2fa_enabled ? (
                          <Badge variant="outline" className="text-success border-success">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Disabled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={userProfile.is_active ? "outline" : "destructive"}>
                          {userProfile.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-muted-foreground">
                        {format(new Date(userProfile.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(userProfile)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Roles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(userProfile)}>
                              {userProfile.is_active ? (
                                <>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>

        {/* Edit Roles Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User Roles</DialogTitle>
              <DialogDescription>
                Update roles for {selectedUser?.full_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Bank Roles</p>
                <div className="space-y-2">
                  {bankRoles.map((role) => (
                    <div key={role} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={`edit-role-${role}`}
                        checked={formData.roles.includes(role)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, roles: [...formData.roles, role] });
                          } else {
                            setFormData({ ...formData, roles: formData.roles.filter(r => r !== role) });
                          }
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor={`edit-role-${role}`} className="font-medium cursor-pointer flex items-center gap-2">
                          {roleConfig[role].label}
                          {rolesRequiring2FA.includes(role) && (
                            <Badge variant="outline" className="text-xs">2FA Required</Badge>
                          )}
                        </label>
                        <p className="text-sm text-muted-foreground">{roleConfig[role].description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Platform Roles</p>
                <div className="space-y-2">
                  {platformRoles.map((role) => (
                    <div key={role} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={`edit-role-${role}`}
                        checked={formData.roles.includes(role)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, roles: [...formData.roles, role] });
                          } else {
                            setFormData({ ...formData, roles: formData.roles.filter(r => r !== role) });
                          }
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor={`edit-role-${role}`} className="font-medium cursor-pointer flex items-center gap-2">
                          {roleConfig[role].label}
                          {rolesRequiring2FA.includes(role) && (
                            <Badge variant="outline" className="text-xs">2FA Required</Badge>
                          )}
                        </label>
                        <p className="text-sm text-muted-foreground">{roleConfig[role].description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRoles} variant="gold" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
