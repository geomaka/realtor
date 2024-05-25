from django.contrib import admin
from .models import Landlord,Tenant,PaymentsReceived,Payments,Utilities

# Register your models here.
admin.site.register(Landlord)
admin.site.register(Tenant)
admin.site.register(Payments)
admin.site.register(PaymentsReceived)
admin.site.register(Utilities)
