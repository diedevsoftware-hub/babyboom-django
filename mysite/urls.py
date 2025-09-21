# mysite/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static # Importante para los archivos de medios
from django.contrib.sitemaps.views import sitemap
from core.sitemaps import StaticViewSitemap, CategorySitemap, ProductSitemap

sitemaps = {
    'static': StaticViewSitemap,
    'categories': CategorySitemap,
    'products': ProductSitemap,
}

urlpatterns = [
    path('admin/', admin.site.urls),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('cart/', include('cart.urls')),
    path('', include('products.urls')),
    # --- IMPORTANTE: La URL de core debe ir al final ---
    # Para que las rutas de productos como '/bicicletas/' no sean interceptadas primero.
    path('', include('core.urls')),
]

# --- CORRECCIÓN FINAL PARA IMÁGENES EN RENDER ---
# Esta línea ahora se ejecuta siempre.
# En desarrollo, el servidor de Django la usa.
# En producción (Render), WhiteNoise la intercepta y sirve los archivos de forma segura.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)