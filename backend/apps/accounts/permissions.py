from rest_framework.permissions import BasePermission


class IsModeradorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol
            in (request.user.Rol.MODERADOR, request.user.Rol.ADMINISTRADOR)
        )
