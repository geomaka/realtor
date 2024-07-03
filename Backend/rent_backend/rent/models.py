from django.db import models
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

# Create your models here.
class PasswordResetToken(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    user = GenericForeignKey('content_type', 'object_id')
    token = models.CharField(max_length=100)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Reset token for {self.user}"

class Landlord(models.Model):
    first_name = models.CharField(max_length =64)
    last_name = models.CharField(max_length = 64)
    email = models.EmailField(max_length = 64, unique = True)
    phone = models.BigIntegerField(blank = False)
    password = models.CharField(max_length = 128)


    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Property(models.Model):
    landlord = models.ForeignKey(Landlord, on_delete=models.CASCADE, related_name='properties')
    property_name = models.CharField(max_length=100, unique = True) 

    def __str__(self):
        return self.property_name


class Tenant(models.Model):
    landlord = models.ForeignKey(Landlord, on_delete = models.CASCADE)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='tenants')
    house_number = models.CharField(max_length = 10, primary_key=True)
    first_name = models.CharField(max_length = 64)
    last_name = models.CharField(max_length = 64)
    email = models.EmailField(max_length = 64, unique = True)
    phone = models.CharField(max_length = 10)
    password = models.CharField(max_length = 128)
    date_moved_in = models.DateTimeField()

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class HouseDetails(models.Model):
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name='house_details')
    bedroom_count = models.CharField(max_length=128)
    base_rent = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.tenant.first_name} - {self.bedroom_count} Bedrooms'

class Payments(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete = models.CASCADE,db_column='house_number')
    landlord = models.ForeignKey(Landlord, on_delete = models.CASCADE)
    amount = models.DecimalField(max_digits = 10, decimal_places = 2)
    paid = models.DecimalField(max_digits = 10, decimal_places = 2)
    balance = models.DecimalField(max_digits = 10, decimal_places = 2)
    date_paid = models.DateTimeField()
    date_due = models. DateTimeField()

    def __str__(self):
        return f"{self.tenant.first_name} {self.balance}"


class Utilities(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete = models.CASCADE)
    utility_name = models.CharField(max_length = 10)
    utility_cost = models.DecimalField(max_digits = 10, decimal_places = 2)
    rent = models.DecimalField(max_digits=10,decimal_places=2,default=0)
    total = models.DecimalField(max_digits = 10, decimal_places = 2, default = 0)

    def __str__(self):
        return f"{self.utility_name} {self.total}"

class PropertyDetails(models.Model):
    property = models.OneToOneField(Property, on_delete=models.CASCADE, related_name='details')
    number_of_houses = models.IntegerField()
    number_of_1_bedroom_houses = models.IntegerField(default=0)
    number_of_2_bedroom_houses = models.IntegerField(default=0)
    number_of_3_bedroom_houses = models.IntegerField(default=0)
    number_of_4_bedroom_houses = models.IntegerField(default=0)
    
    base_rent_1_bedroom = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    base_rent_2_bedroom = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    base_rent_3_bedroom = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    base_rent_4_bedroom = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    utilities = models.ManyToManyField(Utilities, related_name='properties')

    def __str__(self):
        return f"Details for {self.property.property_name}"


class PaymentsReceived(models.Model):
    landlord = models.ForeignKey(Landlord, on_delete = models.CASCADE)
    tenant = models.ForeignKey(Tenant, on_delete = models.CASCADE,db_column='house_number')
    amount = models.ForeignKey(Payments, on_delete = models.CASCADE)
    balance = models.DecimalField(max_digits =  10,decimal_places = 2,default = 0)
    total_amount = models.DecimalField(max_digits = 10, decimal_places = 2)

    def __str__(self):
        return f"{self.landlord.first_name} {self.total_amount}"
