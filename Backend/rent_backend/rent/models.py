from django.db import models

# Create your models here.
class Landlord(models.Model):
    first_name = models.CharField(max_length =64)
    last_name = models.CharField(max_length = 64)
    email = models.EmailField(max_length = 64, unique = True)
    phone = models.BigIntegerField(blank = False)
    password = models.CharField(max_length = 128)


    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Tenant(models.Model):
    landlord = models.ForeignKey(Landlord, on_delete = models.CASCADE)
    house_number = models.CharField(max_length = 10, primary_key=True)
    first_name = models.CharField(max_length = 64)
    last_name = models.CharField(max_length = 64)
    email = models.EmailField(max_length = 64, unique = True)
    phone = models.CharField(max_length = 10)
    password = models.CharField(max_length = 128)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

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
    landlord = models.ForeignKey(Landlord, on_delete = models.CASCADE)
    utility_name = models.CharField(max_length = 10)
    utility_cost = models.DecimalField(max_digits = 10, decimal_places = 2)
    rent = models.DecimalField(max_digits=10,decimal_places=2,default=0)
    total = models.DecimalField(max_digits = 10, decimal_places = 2, default = 0)

    def __str__(self):
        return f"{self.utility_name} {self.utility_cost}"


class PaymentsReceived(models.Model):
    landlord = models.ForeignKey(Landlord, on_delete = models.CASCADE)
    tenant = models.ForeignKey(Tenant, on_delete = models.CASCADE,db_column='house_number')
    amount = models.ForeignKey(Payments, on_delete = models.CASCADE)
    balance = models.DecimalField(max_digits =  10,decimal_places = 2,default = 0)
    total_amount = models.DecimalField(max_digits = 10, decimal_places = 2)

    def __str__(self):
        return f"{self.landlord.first_name} {self.total_amount}"
