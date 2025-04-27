from django.urls import path
from .views import ReviewCreateView, ReviewListView, PendingReviewListView, ReviewApproveView, ReviewRejectView


urlpatterns = [
    path('create/', ReviewCreateView.as_view(), name='create-review'),
    path('', ReviewListView.as_view(), name='review-list'),
    path('pending/', PendingReviewListView.as_view(),  name='pending-reviews'),
    path('<int:pk>/approve/', ReviewApproveView.as_view(), name='review-approve'),
    path('<int:pk>/reject/',  ReviewRejectView.as_view(),  name='review-reject'),
]