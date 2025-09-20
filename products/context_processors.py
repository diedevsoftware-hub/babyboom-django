# products/context_processors.py
from .models import Category

def main_categories_context(request):
    # Obtenemos solo las categorías principales (las que no tienen padre)
    main_categories = Category.objects.filter(parent=None)
    return {
        'main_categories': main_categories
    }