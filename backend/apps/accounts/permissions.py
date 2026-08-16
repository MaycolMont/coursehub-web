from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsModeradorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol
            in (request.user.Rol.MODERADOR, request.user.Rol.ADMINISTRADOR)
        )


class IsOwnerOrModeradorOrAdmin(BasePermission):
    """Permite editar/eliminar al autor del recurso o a moderadores/admins."""
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(obj, 'usuario_id', None) == user.id:
            return True
        return bool(
            user.rol in (user.Rol.MODERADOR, user.Rol.ADMINISTRADOR)
        )
