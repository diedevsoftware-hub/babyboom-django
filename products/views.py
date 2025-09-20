# products/views.py (VERSIÓN FINAL Y DEPURADA)
import json
from django.shortcuts import render, get_object_or_404
from .models import Category, Product, Brand
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import JsonResponse

def get_variant_data(variant):
    return {
        'id': variant.id, 'color_name': variant.color_name, 'color_hex': variant.color_hex,
        'size': variant.size, 'price': f"{variant.price:,.2f}",
        'sale_price': f"{variant.sale_price:,.2f}" if variant.sale_price else None,
        'stock': variant.stock, 'discount_percentage': variant.discount_percentage,
        'images': [img.image.url for img in variant.images.all()],
        'image_count': variant.images.count()
    }
def category_detail(request, category_slug):
    category = get_object_or_404(Category, slug=category_slug)
    subcategories = category.subcategories.all()
    context = {'category': category}
    if subcategories.exists():
        context['subcategories'] = subcategories
        context['is_parent_category'] = True
    else:
        products_list = Product.objects.filter(category=category, is_active=True).order_by('name')
        selected_brand_id = request.GET.get('brand')
        if selected_brand_id:
            products_list = products_list.filter(brand__id=selected_brand_id)
        brands_in_category = Brand.objects.filter(product__category=category).distinct()
        paginator = Paginator(products_list, 8)
        page_number = request.GET.get('page')
        try:
            products_page = paginator.page(page_number)
        except (PageNotAnInteger, EmptyPage):
            products_page = paginator.page(1)
        
        all_variants_data = {p.id: [get_variant_data(v) for v in p.variants.all().order_by('color_name')] for p in products_page.object_list}
        
        context.update({
            'products': products_page, 'brands': brands_in_category,
            'selected_brand_id': selected_brand_id, 'is_parent_category': False,
            'all_variants_json': json.dumps(all_variants_data)
        })
    return render(request, 'products/category_detail.html', context)
def product_detail(request, product_slug):
    product = get_object_or_404(Product, slug=product_slug, is_active=True)
    variants_data = [get_variant_data(v) for v in product.variants.all().order_by('color_name')]
    context = { 'product': product, 'variants_data_for_template': variants_data }
    return render(request, 'products/product_detail.html', context)
def search(request):
    query = request.GET.get('q')
    products_list = []
    if query:
        products_list = Product.objects.filter(
            Q(name__icontains=query) | Q(product_code__icontains=query) |
            Q(category__name__icontains=query) | Q(brand__name__icontains=query),
            is_active=True
        ).distinct()
    all_variants_data = {p.id: [get_variant_data(v) for v in p.variants.all().order_by('color_name')] for p in products_list}
    context = {
        'query': query, 'products': products_list,
        'all_variants_json': json.dumps(all_variants_data),
    }
    return render(request, 'products/search_results.html', context)

def quick_view(request, product_id):
    product = get_object_or_404(Product, id=product_id, is_active=True)
    variants_data = [get_variant_data(v) for v in product.variants.all().order_by('color_name')]
    context = {
        'product': product,
        'variants_json': variants_data, # Pasa la lista de Python directamente
    }
    return render(request, 'products/partials/_quick_view_content.html', context)

def live_search(request):
    query = request.GET.get('term', '')
    products_data = []
    if len(query) >= 2:
        search_results = Product.objects.filter(
            Q(name__icontains=query) | Q(brand__name__icontains=query),
            is_active=True
        ).distinct()[:5]
        for product in search_results:
            first_variant = product.variants.first()
            image_url = ''
            if first_variant and first_variant.images.first():
                image_url = first_variant.images.first().image.url
            products_data.append({'name': product.name, 'url': product.get_absolute_url(), 'image_url': image_url})
    return JsonResponse({'products': products_data})