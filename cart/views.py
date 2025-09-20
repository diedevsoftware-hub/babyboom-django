# cart/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from products.models import ProductVariant
from .cart import Cart
from django.http import JsonResponse
from .forms import OrderForm
import urllib.parse
from django.http import JsonResponse


@require_POST
def add_to_cart(request):
    cart = Cart(request)
    variant_id = request.POST.get('variant_id')
    quantity = int(request.POST.get('quantity', 1))
    
    variant = get_object_or_404(ProductVariant, id=variant_id)
    
    cart.add(variant=variant, quantity=quantity, override_quantity=False)
    
    return JsonResponse({'status': 'ok', 'cart_total_items': len(cart)})


def cart_detail(request):
    # No necesitamos pasar el carrito en el contexto, 
    # el context_processor se encarga de eso.
    return render(request, 'cart/cart_detail.html')

@require_POST
def cart_update(request, variant_id):
    """
    Vista para actualizar la cantidad de un producto en el carrito.
    """
    cart = Cart(request)
    variant = get_object_or_404(ProductVariant, id=variant_id)
    quantity = int(request.POST.get('quantity'))

    if quantity > 0:
        cart.add(variant=variant, quantity=quantity, override_quantity=True)
    else:
        # Si la cantidad es 0 o menos, eliminamos el producto
        cart.remove(variant)
    
    return redirect('cart:cart_detail')

def cart_remove(request, variant_id):
    """
    Vista para eliminar un producto del carrito.
    """
    cart = Cart(request)
    variant = get_object_or_404(ProductVariant, id=variant_id)
    cart.remove(variant)
    return redirect('cart:cart_detail')

def checkout(request):
    cart = Cart(request)
    if len(cart) == 0:
        return redirect('products:category_list')

    if request.method == 'POST':
        form = OrderForm(request.POST)
        if form.is_valid():
            
            message_parts = [
                "¡Hola! 👋 Quisiera confirmar mi pedido:",
                "",
                "*--- RESUMEN DEL PEDIDO ---*"
            ]

            for item in cart:
                variant = item['variant']
                product = variant.product # Obtenemos el producto padre para el SKU y la URL
                quantity = item['quantity']
                total_price = item['total_price']

                # 1. Construir la URL absoluta de la imagen (con seguridad)
                image_url = "No disponible"
                first_image = variant.images.first()
                if first_image:
                    image_url = request.build_absolute_uri(first_image.image.url)

                # 2. Construir la URL absoluta de la página del producto
                product_url = request.build_absolute_uri(product.get_absolute_url())

                # 3. Formatear la información del item
                item_details = [
                    f"- {product.name} (Color: {variant.color_name}) x{quantity}",
                    f"  SKU: {product.product_code or 'N/A'}", # Usamos el product_code de tu modelo Product
                    f"  Precio: S/ {total_price}",
                    f"  VER IMAGEN: {image_url}",
                    f"  VER EN LA WEB: {product_url}",
                    "--------------------" # Separador para claridad si hay varios productos
                ]
                message_parts.extend(item_details)
            
            # Agregamos el resto de la información
            message_parts.extend([
                f"\n*TOTAL: S/ {cart.get_total_price()}*",
                "\n*--- MIS DATOS DE ENVÍO ---*",
                f"Nombre: {form.cleaned_data['first_name']} {form.cleaned_data['last_name']}",
                f"Teléfono: {form.cleaned_data['phone_number']}",
                f"Dirección: {form.cleaned_data['address']}"
            ])
            
            notes = form.cleaned_data.get('notes')
            if notes:
                message_parts.append(f"Notas: {notes}")

            # Unimos todas las partes con saltos de línea
            order_details = "\n".join(message_parts)

            cart.clear()

            phone_number = "51988126835"
            encoded_message = urllib.parse.quote(order_details)
            whatsapp_url = f"https://api.whatsapp.com/send?phone={phone_number}&text={encoded_message}"
            
            return redirect(whatsapp_url)
    else:
        form = OrderForm()

    return render(request, 'cart/checkout.html', {'form': form})

def get_cart_data(request):
    """
    Devuelve los datos del carrito en formato JSON, ahora incluyendo el variant_id.
    """
    cart = Cart(request)
    cart_items = []
    for item in cart:
        cart_items.append({
            'variant_id': item['variant'].id, 
            'product_name': item['variant'].product.name,
            'variant_color': item['variant'].color_name,
            'quantity': item['quantity'],
            'price': str(item['price']),
            'total_price': str(item['total_price']),
            'image_url': item['variant'].images.first().image.url if item['variant'].images.first() else '',
        })

    return JsonResponse({
        'items': cart_items,
        'total_price': str(cart.get_total_price()),
        'total_items': len(cart),
    })

@require_POST
def cart_update_api(request):
    cart = Cart(request)
    variant_id = request.POST.get('variant_id')
    
    try:
        # Usamos un bloque try-except para manejar entradas no válidas
        quantity = int(request.POST.get('quantity', 1))
    except (ValueError, TypeError):
        quantity = 1 # Si la cantidad no es un número, por defecto es 1

    variant = get_object_or_404(ProductVariant, id=variant_id)

    item_total_price = 0
    if quantity > 0:
        cart.add(variant=variant, quantity=quantity, override_quantity=True)
        # --- LÓGICA SIMPLIFICADA ---
        # Calculamos el nuevo precio total del item directamente
        item_total_price = variant.final_price * quantity
    else:
        # Si la cantidad es 0 o menos, lo eliminamos
        cart.remove(variant)

    return JsonResponse({
        'status': 'ok',
        'quantity': quantity,
        # Usamos floatformat para asegurar un formato de dos decimales consistente
        'item_total_price': f"{item_total_price:.2f}",
        'subtotal': f"{cart.get_total_price():.2f}",
        'total_items': len(cart)
    })



# === NUEVA VISTA PARA ELIMINAR ITEM (API) ===
@require_POST
def cart_remove_api(request):
    cart = Cart(request)
    variant_id = request.POST.get('variant_id')
    variant = get_object_or_404(ProductVariant, id=variant_id)
    cart.remove(variant)

    # --- INICIO DE LA MEJORA ---
    return JsonResponse({
        'status': 'ok',
        'subtotal': f"{cart.get_total_price():,.2f}",
        'total_items': len(cart)
    })