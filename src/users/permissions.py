from rest_framework.permissions import BasePermission, IsAdminUser

class IsCustomer(BasePermission):
    """
    Allows access only to users in the 'customer' group.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name="customer").exists()

class IsProductManager(BasePermission):
    """
    Allows access only to users in the 'product manager' group.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name="product manager").exists()

class IsSalesManager(BasePermission):
    """
    Allows access only to users in the 'sales manager' group.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name="sales manager").exists()
    
class IsProductManagerOrSalesManager(BasePermission):
    """
    Allows access if the user is in either the 'product manager'
    group or the 'sales manager' group.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated and
            (user.groups.filter(name="product manager").exists() or
             user.groups.filter(name="sales manager").exists())
        )