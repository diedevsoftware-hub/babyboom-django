# core/views.py

from django.shortcuts import render
from products.models import Category


def home(request):
    # RF1.3: Debemos mostrar las cartas de las categorías principales.
    # Filtramos las categorías que no tienen padre (parent=None).
    main_categories = Category.objects.filter(parent=None)

    context = {
        'categories': main_categories
    }
    return render(request, 'core/index.html', context)
