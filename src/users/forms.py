from django import forms
from .models import Profile

class RegisterForm(forms.Form):
    username = forms.CharField(label="Username", max_length=150, widget=forms.TextInput(attrs={"placeholder": "randomtext"}) )
    password = forms.CharField(label="Password", widget=forms.PasswordInput)
    email = forms.EmailField(label="E-mail", widget= forms.EmailInput(attrs={"placeholder": "sometext"}))

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = [
            "name",
            "email",
            "phone_number",
            "address_line1",
            "address_line2",
            "city",
            "postal_code",
        ]