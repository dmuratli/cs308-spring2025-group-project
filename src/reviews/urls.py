from django.urls import path
from .views import ReviewCreateView, ReviewListView


urlpatterns = [
    path('create/', ReviewCreateView.as_view(), name='create-review'),
    path('', ReviewListView.as_view(), name='review-list'),  # bu önemli!
]















