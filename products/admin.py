# products/admin.py

from django.contrib import admin
from .models import Brand, Category, Product, ProductVariant, ProductImage
import nested_admin

# --- Personalización para el modelo Category ---
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'slug')
    search_fields = ('name',)
    list_filter = ('parent',)
    fields = ('name', 'slug', 'parent', 'image', 'description', 'meta_description')
    # Autocompleta el 'slug' a partir del 'name' en tiempo real
    prepopulated_fields = {'slug': ('name',)}

# --- Personalización para el modelo Brand ---
@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


# --- Clases Inline anidadas ---

# Usamos NestedTabularInline en lugar de admin.TabularInline
class ProductImageInline(nested_admin.NestedTabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        from django.utils.html import format_html
        if obj.image:
            return format_html('<img src="{}" width="100" />', obj.image.url)
        return "(Sin imagen)"
    image_preview.short_description = 'Vista Previa'

# Usamos NestedTabularInline aquí también
class ProductVariantInline(nested_admin.NestedTabularInline):
    model = ProductVariant
    extra = 1
    # ¡Ahora sí podemos anidar el inline de imágenes aquí!
    inlines = [ProductImageInline]


# --- Personalización principal para Product ---

# Usamos NestedModelAdmin en lugar de admin.ModelAdmin
@admin.register(Product)
class ProductAdmin(nested_admin.NestedModelAdmin):
    list_display = ('name', 'category', 'brand', 'is_active')
    list_filter = ('is_active', 'category', 'brand')
    search_fields = ('name', 'product_code')
    prepopulated_fields = {'slug': ('name',)}

    list_editable = ('is_active',)
    # El inline principal sigue siendo el de variantes
    inlines = [ProductVariantInline]

# Nota: No registramos ProductVariant y ProductImage de forma independiente
# porque ya son manejables a través de los Inlines del Producto.
# Si quieres poder editarlos también por separado, descomenta las siguientes líneas:
# @admin.register(ProductVariant)
# class ProductVariantAdmin(admin.ModelAdmin):
#     list_display = ('__str__', 'price', 'stock')

# @admin.register(ProductImage)
# class ProductImageAdmin(admin.ModelAdmin):
#     list_display = ('__str__', 'variant')