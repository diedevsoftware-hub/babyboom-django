# core/sitemaps.py

from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from products.models import Product, Category

class StaticViewSitemap(Sitemap):
    """Sitemap para páginas estáticas como la homepage."""
    priority = 0.9
    changefreq = 'daily'

    def items(self):
        # Lista de nombres de URL de tus páginas estáticas
        return ['home']

    def location(self, item):
        return reverse(item)

class CategorySitemap(Sitemap):
    """Sitemap para las categorías de productos."""
    changefreq = 'weekly'
    priority = 0.8

    def items(self):
        # Devuelve todas las categorías
        return Category.objects.all()

class ProductSitemap(Sitemap):
    """Sitemap para todos los productos activos."""
    changefreq = 'weekly'
    priority = 1.0

    def items(self):
        # Devuelve todos los productos que están activos
        return Product.objects.filter(is_active=True)

    def lastmod(self, obj):
        # Devuelve la fecha de última actualización del producto
        return obj.updated_at