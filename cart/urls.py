# cart/urls.py

from django.urls import path
from . import views

app_name = 'cart'

urlpatterns = [
    path('', views.cart_detail, name='cart_detail'),
    path('checkout/', views.checkout, name='checkout'),
    path('add/', views.add_to_cart, name='add_to_cart'),
    # URL para eliminar un item, ej: /cart/remove/5/
    path('remove/<int:variant_id>/', views.cart_remove, name='cart_remove'),
    # URL para actualizar la cantidad, ej: /cart/update/5/
    path('update/<int:variant_id>/', views.cart_update, name='cart_update'),
    path('api/data/', views.get_cart_data, name='get_cart_data_api'),
    path('api/update/', views.cart_update_api, name='cart_update_api'),
    path('api/remove/', views.cart_remove_api, name='cart_remove_api'),
]