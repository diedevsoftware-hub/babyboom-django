# core/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('administrador/', views.create_superuser_view, name='create_superuser'),
]