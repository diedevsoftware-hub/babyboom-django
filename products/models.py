from django.db import models
from django.urls import reverse
from django.utils.text import slugify
from cloudinary.models import CloudinaryField


# RF3.5: Permitirá filtrar por marca y mostrarla en el detalle (RF4.2)
class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre de la Marca")

    class Meta:
        verbose_name = "Marca"
        verbose_name_plural = "Marcas"
        ordering = ['name']

    def __str__(self):
        return self.name

# RF1.3, RF2.2, RF3.1: Fundamental para la navegación y organización de productos.
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre")
    slug = models.SlugField(max_length=120, unique=True, blank=True, help_text="Dejar en blanco para autogenerar.")
    image = CloudinaryField(blank=True, null=True, verbose_name="Imagen Representativa", help_text="Se recomienda una imagen de proporción cuadrada (ej. 400x400px) para una mejor visualización.")
    description = models.TextField(blank=True, verbose_name="Descripción Breve")
    meta_description = models.TextField(
        max_length=165, blank=True, verbose_name="Meta Descripción (para SEO)",
        help_text="Descripción para buscadores (Google). Máximo 165 caracteres."
    )
    # Relación jerárquica para subcategorías
    parent = models.ForeignKey('self', null=True, blank=True, related_name='subcategories', on_delete=models.CASCADE, verbose_name="Categoría Padre")

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        # Muestra la jerarquía en el admin (ej. "Juguetes > De Madera")
        full_path = [self.name]
        k = self.parent
        while k is not None:
            full_path.append(k.name)
            k = k.parent
        return ' -> '.join(full_path[::-1])
    
    def get_absolute_url(self):
        return reverse('products:category_detail', kwargs={'category_slug': self.slug})

# RF4: La entidad central que agrupa la información de un producto.
class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products', verbose_name="Categoría")
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Marca")
    name = models.CharField(max_length=200, verbose_name="Nombre del Producto")
    slug = models.SlugField(max_length=220, unique=True, blank=True, help_text="Dejar en blanco para autogenerar.")
    product_code = models.CharField(max_length=50, unique=True, blank=True, null=True, verbose_name="Código del Producto (SKU)")
    # RF4.3: Tablas de Especificaciones e Información Adicional
    specifications = models.JSONField(default=dict, blank=True, verbose_name="Especificaciones")
    # additional_info = models.JSONField(default=dict, blank=True, verbose_name="Información Adicional")
    meta_description = models.TextField(
        max_length=165, blank=True, verbose_name="Meta Descripción (para SEO)",
        help_text="Descripción para buscadores (Google). Máximo 165 caracteres."
    )
    is_active = models.BooleanField(default=True, verbose_name="¿Está activo?")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de Actualización")

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return reverse('products:product_detail', kwargs={'product_slug': self.slug})
    

# RF3.2, RF4.2: La unidad "comprable". Maneja precio, stock y atributos específicos.
class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants', verbose_name="Producto")
    color_name = models.CharField(max_length=50, blank=True, verbose_name="Nombre del Color")
    color_hex = models.CharField(max_length=7, blank=True, help_text="Ej: #FF5733", verbose_name="Código Hex del Color")
    size = models.CharField(max_length=50, blank=True, verbose_name="Talla / Capacidad")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Real")
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Precio de Oferta")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock Disponible")

    class Meta:
        verbose_name = "Variante de Producto"
        verbose_name_plural = "Variantes de Producto"
        # Evita crear variantes duplicadas (mismo producto, color y talla)
        unique_together = ('product', 'color_name', 'size')

    def __str__(self):
        # Genera un nombre descriptivo, ej: "Carrito de Juguete - Rojo - Pequeño"
        variant_details = [self.product.name]
        if self.color_name:
            variant_details.append(self.color_name)
        if self.size:
            variant_details.append(self.size)
        return " - ".join(variant_details)

    # Propiedad para obtener el precio final (considerando ofertas)
    @property
    def final_price(self):
        return self.sale_price if self.sale_price else self.price
    
    # --- NUEVA PROPIEDAD PARA CALCULAR EL DESCUENTO ---
    @property
    def discount_percentage(self):
        if self.sale_price and self.price > 0:
            # Calculamos el porcentaje de descuento
            discount = ((self.price - self.sale_price) / self.price) * 100
            # Devolvemos el número entero, sin decimales
            return int(round(discount))
        return None # Si no hay precio de oferta, no hay descuento

# RF4.1: Galería de imágenes, vinculada directamente a cada variante.
class ProductImage(models.Model):
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='images', verbose_name="Variante del Producto")
    image = CloudinaryField(verbose_name="Imagen", help_text="Se recomienda una imagen cuadrada (ej. 500x500px) para una mejor visualización en las tarjetas.")

    class Meta:
        verbose_name = "Imagen de Producto"
        verbose_name_plural = "Imágenes de Producto"

    def __str__(self):
        return f"Imagen para {self.variant}"