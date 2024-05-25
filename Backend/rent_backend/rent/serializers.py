from rest_framework import serializers
from .models import Landlord, Tenant, Payments, Utilities, PaymentsReceived

class LandlordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Landlord
        fields = ('id', 'first_name', 'last_name', 'email', 'phone', 'password')

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ('id', 'landlord', 'house_number', 'first_name', 'last_name', 'email', 'phone', 'password')

class PaymentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payments
        fields = ('id', 'tenant', 'landlord', 'amount', 'paid', 'balance', 'date_paid', 'date_due')

class UtilitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilities
        fields = ('id', 'landlord', 'utility_name', 'utility_cost')

class PaymentsReceivedSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentsReceived
        fields = ('id', 'tenant', 'landlord', 'amount', 'date_received')
