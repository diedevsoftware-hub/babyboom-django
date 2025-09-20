# cart/cart.py

from decimal import Decimal
from django.conf import settings
from products.models import ProductVariant

class Cart:
    def __init__(self, request):
        """
        Inicializa el carrito.
        """
        self.session = request.session
        cart = self.session.get(settings.CART_SESSION_ID)
        if not cart:
            # Guarda un carrito vacío en la sesión
            cart = self.session[settings.CART_SESSION_ID] = {}
        self.cart = cart

    def add(self, variant, quantity=1, override_quantity=False):
        """
        Añade un producto al carrito o actualiza su cantidad,
        respetando siempre el stock disponible.
        """
        variant_id = str(variant.id)
        
        # Si el producto no está en el carrito, lo inicializamos
        if variant_id not in self.cart:
            self.cart[variant_id] = {
                'quantity': 0,
                'price': str(variant.final_price) 
                # Asegúrate de que tu inicialización coincida con la que ya tienes
            }

        # --- INICIO DE LA LÓGICA CORREGIDA ---
        
        # 1. Calculamos cuál sería la nueva cantidad total
        if override_quantity:
            # Si estamos sobreescribiendo (ej: desde la página del carrito), la nueva cantidad es simplemente la que se envía.
            new_quantity = quantity
        else:
            # Si estamos añadiendo (ej: desde la página de producto), sumamos a lo que ya hay.
            current_quantity_in_cart = self.cart[variant_id]['quantity']
            new_quantity = current_quantity_in_cart + quantity

        # 2. Comparamos la nueva cantidad con el stock disponible
        if new_quantity > variant.stock:
            # Si la nueva cantidad supera el stock, la ajustamos al máximo stock disponible.
            # Esto evita que se añadan más de 5 en total.
            self.cart[variant_id]['quantity'] = variant.stock
        else:
            # Si no supera el stock, la establecemos sin problemas.
            self.cart[variant_id]['quantity'] = new_quantity
        
        # --- FIN DE LA LÓGICA CORREGIDA ---

        self.save()

    def save(self):
        # Marca la sesión como "modificada" para asegurarte de que se guarde
        self.session.modified = True
    
    def remove(self, variant):
        """
        Elimina un producto del carrito.
        """
        variant_id = str(variant.id)
        if variant_id in self.cart:
            del self.cart[variant_id]
            self.save()

    def __iter__(self):
        """
        Itera sobre los items en el carrito y obtiene los productos
        de la base de datos.
        """
        variant_ids = self.cart.keys()
        # Obtiene los objetos de las variantes y los añade al carrito
        variants = ProductVariant.objects.filter(id__in=variant_ids)
        cart = self.cart.copy()
        for variant in variants:
            cart[str(variant.id)]['variant'] = variant
        
        for item in cart.values():
            item['price'] = Decimal(item['price'])
            item['total_price'] = item['price'] * item['quantity']
            yield item

    def __len__(self):
        """
        Cuenta todos los items en el carrito.
        """
        return sum(item['quantity'] for item in self.cart.values())

    def get_total_price(self):
        return sum(Decimal(item['price']) * item['quantity'] for item in self.cart.values())

    def clear(self):
        # Elimina el carrito de la sesión
        del self.session[settings.CART_SESSION_ID]
        self.save()