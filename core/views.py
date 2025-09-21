# core/views.py

from django.shortcuts import render
from products.models import Category
from django.http import HttpResponse
from django.contrib.auth import get_user_model

def home(request):
    # RF1.3: Debemos mostrar las cartas de las categorías principales.
    # Filtramos las categorías que no tienen padre (parent=None).
    main_categories = Category.objects.filter(parent=None)

    context = {
        'categories': main_categories
    }
    return render(request, 'core/index.html', context)

def create_superuser_view(request):
    """
    Una vista temporal y secreta para crear un superusuario.
    ¡¡RECUERDA BORRAR ESTA VISTA Y SU URL DESPUÉS DE USARLA!!
    """
    User = get_user_model()
    
    # --- CAMBIA ESTOS DATOS ---
    username = 'seily'
    email = 'seily@gmail.com'
    password = '1234' 
    # -------------------------

    if not User.objects.filter(username=username).exists():
        try:
            User.objects.create_superuser(username=username, email=email, password=password)
            return HttpResponse("<h1>¡Superusuario creado exitosamente!</h1><p>Ya puedes borrar esta vista y su URL.</p>")
        except Exception as e:
            return HttpResponse(f"<h1>Error al crear el superusuario:</h1><p>{e}</p>")
    else:
        return HttpResponse("<h1>El superusuario ya existe.</h1><p>No se ha realizado ninguna acción.</p>")