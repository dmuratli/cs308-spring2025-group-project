from django.db import models
from Crypto.Hash import SHA256
from Crypto.Random.random import getrandbits
# Create your models here.

class User(models.Model):
    username = models.CharField(max_length=128, blank= False, null= False, unique= True)
    password = models.CharField(max_length=128, blank= False, null= False)
    salt = models.CharField(max_length=256, blank= False, null= False)
    