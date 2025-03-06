from django import forms
from .models import Profile

class RegisterForm(forms.Form):
    username = forms.CharField(label="Username", max_length=150, widget=forms.TextInput(attrs={"placeholder": "randomtext"}) )
    password = forms.CharField(label="Password", widget=forms.PasswordInput)

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ["phone_number", "date_of_birth", "gender", "city", "country", "postal_code", "address"]
        widgets = {
            "date_of_birth": forms.DateInput(attrs={"type": "date"}),
        }