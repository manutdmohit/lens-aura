import type { UserRole, Permission, RolePermission } from "@/types/admin"

// Define permissions for each role
const rolePermissions: RolePermission[] = [
  {
    role: "admin",
    permissions: [
      {
        id: "1",
        name: "Manage Users",
        description: "Create, read, update, and delete users",
        resource: "users",
        action: "manage",
      },
      {
        id: "2",
        name: "Manage Products",
        description: "Create, read, update, and delete products",
        resource: "products",
        action: "manage",
      },
      {
        id: "3",
        name: "Manage Orders",
        description: "Create, read, update, and delete orders",
        resource: "orders",
        action: "manage",
      },
      {
        id: "4",
        name: "Manage Content",
        description: "Create, read, update, and delete content",
        resource: "content",
        action: "manage",
      },
      {
        id: "5",
        name: "View Analytics",
        description: "View analytics and reports",
        resource: "analytics",
        action: "read",
      },
      {
        id: "6",
        name: "Manage Settings",
        description: "Manage system settings",
        resource: "settings",
        action: "manage",
      },
    ],
  },
  {
    role: "editor",
    permissions: [
      { id: "7", name: "Read Users", description: "View user information", resource: "users", action: "read" },
      {
        id: "8",
        name: "Manage Products",
        description: "Create, read, update, and delete products",
        resource: "products",
        action: "manage",
      },
      { id: "9", name: "Read Orders", description: "View order information", resource: "orders", action: "read" },
      {
        id: "10",
        name: "Manage Content",
        description: "Create, read, update, and delete content",
        resource: "content",
        action: "manage",
      },
      {
        id: "11",
        name: "View Analytics",
        description: "View analytics and reports",
        resource: "analytics",
        action: "read",
      },
    ],
  },
  {
    role: "viewer",
    permissions: [
      { id: "12", name: "Read Users", description: "View user information", resource: "users", action: "read" },
      {
        id: "13",
        name: "Read Products",
        description: "View product information",
        resource: "products",
        action: "read",
      },
      { id: "14", name: "Read Orders", description: "View order information", resource: "orders", action: "read" },
      { id: "15", name: "Read Content", description: "View content", resource: "content", action: "read" },
      {
        id: "16",
        name: "View Analytics",
        description: "View analytics and reports",
        resource: "analytics",
        action: "read",
      },
    ],
  },
]

// Get permissions for a specific role
export function getPermissionsForRole(role: UserRole): Permission[] {
  const rolePermission = rolePermissions.find((rp) => rp.role === role)
  return rolePermission ? rolePermission.permissions : []
}

// Check if a user has permission to perform an action on a resource
export function hasPermission(
  role: UserRole,
  resource: string,
  action: "create" | "read" | "update" | "delete" | "manage",
): boolean {
  const permissions = getPermissionsForRole(role)

  return permissions.some((permission) => {
    // If the permission is for managing the resource, it includes all actions
    if (permission.resource === resource && permission.action === "manage") {
      return true
    }

    // Otherwise, check for the specific action
    return permission.resource === resource && permission.action === action
  })
}
