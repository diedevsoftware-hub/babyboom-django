# cart/forms.py
from django import forms

class OrderForm(forms.Form):
    first_name = forms.CharField(label='Nombres', max_length=100)
    last_name = forms.CharField(label='Apellidos', max_length=100)
    phone_number = forms.CharField(label='Número de Teléfono / WhatsApp', max_length=20)
    email = forms.EmailField(label='Correo Electrónico (opcional)', required=False)
    address = forms.CharField(label='Dirección de Envío', widget=forms.Textarea(attrs={'rows': 3}))
    notes = forms.CharField(label='Notas Adicionales (opcional)', required=False, widget=forms.Textarea(attrs={'rows': 3}))

    # ESTA FUNCIÓN ES LA MEJORA
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Añadimos una clase CSS a cada <p> que genera Django
        self.label_suffix = ""  # Opcional: quita los dos puntos ":" después de cada label
        for field in self.fields:
            # Esto envuelve cada campo en un div con una clase, dándonos control
            self.fields[field].widget.attrs.update({'class': 'form-input'})