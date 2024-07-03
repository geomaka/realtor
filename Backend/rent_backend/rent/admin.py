from django.contrib import admin
from .models import Landlord,Tenant,PaymentsReceived,Payments,Utilities,Property,PropertyDetails, HouseDetails

# Register your models here.
admin.site.register(Landlord)
admin.site.register(Tenant)
admin.site.register(Payments)
admin.site.register(PaymentsReceived)
admin.site.register(Utilities)
admin.site.register(Property)
admin.site.register(PropertyDetails)
admin.site.register(HouseDetails)
