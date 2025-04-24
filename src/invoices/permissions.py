from rest_framework.permissions import BasePermission

class IsSalesManager(BasePermission):
    """
    Allow only users whose `role` field is 'sales_manager'
    (adapt if you store roles differently).
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated
                    and request.user.role == "sales_manager")
