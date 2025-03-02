from django import forms

class RegisterForm(forms.Form):
    username = forms.CharField(label="Username", max_length=150, widget=forms.TextInput(attrs={"placeholder": "randomtext"}) )
    password = forms.CharField(label="Password", widget=forms.PasswordInput)