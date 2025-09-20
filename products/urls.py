# products/urls.py

from django.urls import path
from . import views

# Este 'app_name' es útil para organizar las URLs en proyectos grandes
app_name = 'products'

urlpatterns = [
    path('api/live-search/', views.live_search, name='live_search_api'),
    path('quick-view/<int:product_id>/', views.quick_view, name='quick_view'),
    # URL para la lista de productos por categoría
    # ej: /category/juguetes-de-madera/
    path('category/<slug:category_slug>/', views.category_detail, name='category_detail'),
    path('search/', views.search, name='search'),
    # URL para la página de detalle de un producto
    # ej: /product/carrito-rojo-de-madera/
    path('product/<slug:product_slug>/', views.product_detail, name='product_detail'),
]
