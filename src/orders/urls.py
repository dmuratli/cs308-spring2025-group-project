from django.urls import path
from .views import PlaceOrderView

urlpatterns = [
    path("place/", PlaceOrderView.as_view(), name="place-order"),
]