from django.urls import path
from .views import ReviewCreateView

urlpatterns = [
    path('create/', ReviewCreateView.as_view(), name='create-review'),
]















