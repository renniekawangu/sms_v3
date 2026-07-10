export function getRoleIdentifier(roleOrId, index = 0) {
  if (roleOrId === undefined || roleOrId === null || roleOrId === '') {
    return undefined;
  }

  if (typeof roleOrId === 'object') {
    const id = roleOrId._id ?? roleOrId.id ?? roleOrId.role_id ?? roleOrId.roleId ?? roleOrId.roleID;
    if (id !== undefined && id !== null && id !== '') {
      return String(id);
    }

    const name = typeof roleOrId.name === 'string' ? roleOrId.name.trim() : '';
    if (name) {
      return `${name}-${index}`;
    }

    return undefined;
  }

  return String(roleOrId);
}

export function getRoleListKey(role, index) {
  const id = getRoleIdentifier(role, index);
  if (id) {
    return id;
  }

  return `role-${index}`;
}
