from django.contrib.auth.hashers import make_password,check_password
from django.contrib import messages
from django.contrib.auth import logout
from django.core import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse,HttpResponseRedirect,JsonResponse
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.urls import reverse
from .models import Tenant,Landlord,Payments,Utilities,PaymentsReceived, Property,PropertyDetails, HouseDetails
from datetime import datetime, timedelta
from django_daraja.mpesa.core import MpesaClient
from django.utils import timezone
import json
from django.db import transaction
from django.db.models import Sum
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie,csrf_protect
from django.contrib.auth import login as auth_login
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes,force_str
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.contenttypes.models import ContentType
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.forms.models import model_to_dict
from django.conf import settings

# Create your views here.
def index(request):
    return HttpResponse("<h1>Hello</h1>")

@ensure_csrf_cookie
def getCSRF(request):
    if request.method == "GET":
        csrf_token = get_token(request)
        return JsonResponse({"csrfToken": csrf_token})

    else:
        return JsonResponse({"error": "not allowed"}, status=405)


def adminsignup(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            first_name = data.get("first_name")
            last_name = data.get("last_name")
            email = data.get("email")
            phone = data.get("phone")
            password = data.get("password")
            payment_type = data.get("payment_type")
            till_number = data.get("till_number")
            paybill_number = data.get("paybill_number")
            account_number = data.get("account_number")

            if first_name and last_name and phone and email and password and payment_type:
                if payment_type == 'till':
                    if not till_number:
                        return JsonResponse({'error': 'Till number is required for till payment type'}, status=400)
                    if paybill_number or account_number:
                        return JsonResponse({'error': 'Paybill number and account number should be empty for till payment type'}, status=400)
                    paybill_number = None  
                    account_number = None  

                elif payment_type == 'paybill':
                    if not paybill_number:
                        return JsonResponse({'error': 'Paybill number is required for paybill payment type'}, status=400)
                    if not account_number:
                        return JsonResponse({'error': 'Account number is required for paybill payment type'}, status=400)
                    till_number = None  

                hashed_pwd = make_password(password)

                landlord = Landlord.objects.create(
                    first_name=first_name, 
                    last_name=last_name, 
                    phone=phone, 
                    email=email, 
                    password=hashed_pwd,
                    payment_type=payment_type,
                    till_number=till_number,
                    paybill_number=paybill_number,
                    account_number=account_number
                )

                send_mail(
                    'Welcome to Our Service',
                    f'Hello {landlord.first_name},\n\nThank you for signing up as a landlord on our platform.',
                    settings.EMAIL_HOST_USER,
                    [landlord.email],
                    fail_silently=False,
                )

                data = {
                    'message': 'Landlord created successfully',
                    'landlord_id': landlord.id
                }
                return JsonResponse(data, status=201)
            else:
                return JsonResponse({'error': 'Please fill all the required fields'}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

def signup(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            house_number = data.get("house_number")
            first_name = data.get("first_name")
            last_name = data.get("last_name")
            email = data.get("email")
            date_moved_in = data.get("date_moved_in")
            phone = data.get("phone")
            password = data.get("password")
            landlord_id = data.get("landlord_id")
            property_id = data.get("property_id")

            try:
                properties = Property.objects.get(pk=property_id)
            except Property.DoesNotExist:
                return JsonResponse({"error": "Property does not exist"}, status=404)

            if all([first_name, last_name, phone, email, password, landlord_id, house_number, date_moved_in]):
                hashed_password = make_password(password)
                tenant = Tenant.objects.create(
                    house_number=house_number,
                    first_name=first_name,
                    last_name=last_name,
                    phone=phone,
                    email=email,
                    date_moved_in=date_moved_in,
                    password=hashed_password,
                    landlord_id=landlord_id,
                    property_id=property_id
                )

                send_mail(
                    'Welcome to Your New Home',
                    f'Hello {tenant.first_name},\n\nThank you for signing up as a tenant at {properties.property_name}. We hope you enjoy your stay.',
                    settings.EMAIL_HOST_USER,  
                    [tenant.email],
                    fail_silently=False,
                )

                data = {
                    "first_name": tenant.first_name,
                    "last_name": tenant.last_name,
                    "email": tenant.email,
                    "phone": tenant.phone,
                    "house_number": tenant.house_number,
                    "landlord_id": tenant.landlord_id,
                    "property_id": tenant.property_id
                }
                return JsonResponse({"tenant": data}, status=201)
            else:
                return JsonResponse({"success": False, "message": "Fill all the fields"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        landlords = Landlord.objects.prefetch_related('properties').all()
        landlords_data = []
        for landlord in landlords:
            properties_data = []
            for property in landlord.properties.all():
                properties_data.append({
                    'id': property.id,
                    'address': property.property_name,
                })

            landlords_data.append({
                'id': landlord.id,
                'first_name': landlord.first_name,
                'last_name': landlord.last_name,
                'properties': properties_data,
            })
        return JsonResponse({"landlords": landlords_data})

def property(request,landlord_id):
    if request.method == "POST":
        try:
            landlord = Landlord.objects.get(id=landlord_id)
            data = json.loads(request.body)
            property_name = data.get('property_name')
            location =data.get('property_location')

            if property_name:
                new_property = Property.objects.create(landlord = landlord, property_name = property_name,location=location)
                property_data = {"property_name" : property_name, "landlord": new_property.landlord.id, "property_id" : new_property.id}

                return JsonResponse({"property" : property_data})
            else:
                return JsonResponse({'error' : "an error has occured"})

        except Landlord.DoesNotExist:
            return JsonResponse({'error' : "landlord not found"})

    else:
        properties = Property.objects.filter(landlord_id=landlord_id).values()
        landlord = Landlord.objects.get(pk = landlord_id)
        landlord_data = {
            "id": landlord.id,
            "first_name" : landlord.first_name,
            "last_name" : landlord.last_name
        }
        return JsonResponse({"properties" : list(properties),"landlord" : landlord_data})

def property_details(request, landlord_id, property_id):
    if request.method == "POST":
        try:
            landlord = Landlord.objects.get(id=landlord_id)
            property = Property.objects.get(id=property_id)
        except Landlord.DoesNotExist or Property.DoesNotExist:
            return JsonResponse({"error": "Landlord or Property does not exist"}, status=404)

        data = json.loads(request.body)
        number_of_houses = int(data.get('number_of_houses'))
        number_of_single_rooms = int(data.get('number_of_single_rooms'))
        number_of_bedsitters = int(data.get('number_of_bedsitters'))
        number_of_1_bedroom_houses = int(data.get('number_of_1_bedroom_houses'))
        number_of_2_bedroom_houses = int(data.get('number_of_2_bedroom_houses'))
        number_of_3_bedroom_houses = int(data.get('number_of_3_bedroom_houses'))
        number_of_4_bedroom_houses = int(data.get('number_of_4_bedroom_houses'))

        base_rent_single_room = data.get('base_rent_single_room')
        base_rent_bedsitter = data.get('base_rent_bedsitter')
        base_rent_1_bedroom = data.get('base_rent_1_bedroom')
        base_rent_2_bedroom = data.get('base_rent_2_bedroom')
        base_rent_3_bedroom = data.get('base_rent_3_bedroom')
        base_rent_4_bedroom = data.get('base_rent_4_bedroom')

        total_houses = (number_of_single_rooms + number_of_bedsitters + number_of_1_bedroom_houses +
                        number_of_2_bedroom_houses + number_of_3_bedroom_houses + number_of_4_bedroom_houses)

        if number_of_houses == total_houses:
            property_details, created = PropertyDetails.objects.update_or_create(
                property=property,
                defaults={
                    'number_of_houses': number_of_houses,
                    'number_of_single_rooms': number_of_single_rooms,
                    'number_of_bedsitters': number_of_bedsitters,
                    'number_of_1_bedroom_houses': number_of_1_bedroom_houses,
                    'number_of_2_bedroom_houses': number_of_2_bedroom_houses,
                    'number_of_3_bedroom_houses': number_of_3_bedroom_houses,
                    'number_of_4_bedroom_houses': number_of_4_bedroom_houses,
                    'base_rent_bedsitter': base_rent_bedsitter,
                    'base_rent_single_room': base_rent_single_room,
                    'base_rent_1_bedroom': base_rent_1_bedroom,
                    'base_rent_2_bedroom': base_rent_2_bedroom,
                    'base_rent_3_bedroom': base_rent_3_bedroom,
                    'base_rent_4_bedroom': base_rent_4_bedroom
                }
            )

            property_details_data = {
                "Number of houses": property_details.number_of_houses,
                "Number of single rooms": property_details.number_of_single_rooms,
                "Number of Bed sitters": property_details.number_of_bedsitters,
                "Number of 1 bedroom": property_details.number_of_1_bedroom_houses,
                "Number of 2 bedroom": property_details.number_of_2_bedroom_houses,
                "Number of 3 bedroom": property_details.number_of_3_bedroom_houses,
                "Number of 4 bedroom": property_details.number_of_4_bedroom_houses,
                "Rent 1 bedroom": property_details.base_rent_1_bedroom,
                "Rent 2 bedroom": property_details.base_rent_2_bedroom,
                "Rent 3 bedroom": property_details.base_rent_3_bedroom,
                "Rent 4 bedroom": property_details.base_rent_4_bedroom,
                "property": property_details.property.id
            }

            return JsonResponse({"Property_details": property_details_data}, status=201)
        else:
            return JsonResponse({"message": "Number of houses does not match the total"}, status=400)

    elif request.method == "PUT":
        try:
            landlord = Landlord.objects.get(id=landlord_id)
            property = Property.objects.get(id=property_id)
            property_details = PropertyDetails.objects.get(property=property)
        except Landlord.DoesNotExist or Property.DoesNotExist:
            return JsonResponse({"error": "Landlord or Property does not exist"}, status=404)
        except PropertyDetails.DoesNotExist:
            return JsonResponse({"error": "Property details not found"}, status=404)

        data = json.loads(request.body)
        number_of_houses = int(data.get('number_of_houses'))
        number_of_single_rooms = int(data.get('number_of_single_rooms'))
        number_of_bedsitters = int(data.get('number_of_bedsitters'))
        number_of_1_bedroom_houses = int(data.get('number_of_1_bedroom_houses'))
        number_of_2_bedroom_houses = int(data.get('number_of_2_bedroom_houses'))
        number_of_3_bedroom_houses = int(data.get('number_of_3_bedroom_houses'))
        number_of_4_bedroom_houses = int(data.get('number_of_4_bedroom_houses'))

        base_rent_single_room = data.get('base_rent_single_room')
        base_rent_bedsitter = data.get('base_rent_bedsitter')
        base_rent_1_bedroom = data.get('base_rent_1_bedroom')
        base_rent_2_bedroom = data.get('base_rent_2_bedroom')
        base_rent_3_bedroom = data.get('base_rent_3_bedroom')
        base_rent_4_bedroom = data.get('base_rent_4_bedroom')

        total_houses = (number_of_single_rooms + number_of_bedsitters + number_of_1_bedroom_houses +
                        number_of_2_bedroom_houses + number_of_3_bedroom_houses + number_of_4_bedroom_houses)

        if number_of_houses == total_houses:
            property_details.number_of_houses = number_of_houses
            property_details.number_of_single_rooms = number_of_single_rooms
            property_details.number_of_bedsitters = number_of_bedsitters
            property_details.number_of_1_bedroom_houses = number_of_1_bedroom_houses
            property_details.number_of_2_bedroom_houses = number_of_2_bedroom_houses
            property_details.number_of_3_bedroom_houses = number_of_3_bedroom_houses
            property_details.number_of_4_bedroom_houses = number_of_4_bedroom_houses
            property_details.base_rent_single_room = base_rent_single_room
            property_details.base_rent_bedsitter = base_rent_bedsitter
            property_details.base_rent_1_bedroom = base_rent_1_bedroom
            property_details.base_rent_2_bedroom = base_rent_2_bedroom
            property_details.base_rent_3_bedroom = base_rent_3_bedroom
            property_details.base_rent_4_bedroom = base_rent_4_bedroom
            property_details.save()

            property_details_data = {
                "Number of houses": property_details.number_of_houses,
                "Number of single rooms": property_details.number_of_single_rooms,
                "Number of Bed sitters": property_details.number_of_bedsitters,
                "Number of 1 bedroom": property_details.number_of_1_bedroom_houses,
                "Number of 2 bedroom": property_details.number_of_2_bedroom_houses,
                "Number of 3 bedroom": property_details.number_of_3_bedroom_houses,
                "Number of 4 bedroom": property_details.number_of_4_bedroom_houses,
                "Rent 1 bedroom": property_details.base_rent_1_bedroom,
                "Rent 2 bedroom": property_details.base_rent_2_bedroom,
                "Rent 3 bedroom": property_details.base_rent_3_bedroom,
                "Rent 4 bedroom": property_details.base_rent_4_bedroom,
                "property": property_details.property.id
            }

            return JsonResponse({"Property_details": property_details_data}, status=200)
        else:
            return JsonResponse({"message": "Number of houses does not match the total"}, status=400)

    else:
        try:
            property = Property.objects.get(id=property_id)
            property_details = PropertyDetails.objects.get(property=property)
            property_details_data = model_to_dict(property_details)
            return JsonResponse({"property_details": property_details_data}, status=200)
        except Property.DoesNotExist:
            return JsonResponse({"error": "Property not found"}, status=404)
        except PropertyDetails.DoesNotExist:
            return JsonResponse({"error": "Property details not found"}, status=404)

def house_details(request, property_id, tenant_id):
    if request.method == "POST":
        try:
            tenant = Tenant.objects.get(pk=tenant_id)
            property_instance = Property.objects.get(pk=property_id)
            property_details = PropertyDetails.objects.get(property=property_instance)
        except Property.DoesNotExist:
            return JsonResponse({"error": "Property not found"}, status=404)
        except Tenant.DoesNotExist:
            return JsonResponse({"error": "Tenant not found"}, status=404)
        except PropertyDetails.DoesNotExist:
            return JsonResponse({"error": "Property details not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

        try:
            data = json.loads(request.body)
            bedroom_count = data.get("bedroomCount")

            if bedroom_count not in ["single_room", "bedsitter", "1", "2", "3", "4"]:
                return JsonResponse({"error": "Invalid bedroom count"}, status=400)

            rent_dict = {
                "single_room": property_details.base_rent_single_room,
                "bedsitter": property_details.base_rent_bedsitter,
                "1": property_details.base_rent_1_bedroom,
                "2": property_details.base_rent_2_bedroom,
                "3": property_details.base_rent_3_bedroom,
                "4": property_details.base_rent_4_bedroom
            }

            base_rent = rent_dict.get(bedroom_count)
            if base_rent is None:
                return JsonResponse({"error": "Bedroom count not supported"}, status=400)

            house_detail = HouseDetails.objects.create(
                tenant=tenant,
                bedroom_count=bedroom_count,
                base_rent=base_rent
            )

            return JsonResponse({
                "message": "House details created successfully",
                "house_details": {
                    "tenant": house_detail.tenant.first_name,
                    "bedroom_count": house_detail.bedroom_count,
                    "base_rent": str(house_detail.base_rent)
                }
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            return JsonResponse({"error": "Tenant not found"}, status=404)

        try:
            house_details = HouseDetails.objects.get(tenant=tenant)
        except HouseDetails.DoesNotExist:
            return JsonResponse({"error": "House details not found for this tenant"}, status=404)

        return JsonResponse({"bedroom_count": house_details.bedroom_count})


def login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return JsonResponse({'error': 'Email and password are required.'}, status=400)

            try:
                landlord = Landlord.objects.get(email=email)
                if check_password(password, landlord.password):
                    user, created = User.objects.get_or_create(username=landlord.email, defaults={"password": password})

                    if created:
                        user.set_password(password)
                        user.save()
                
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                    user = authenticate(request, username=landlord.email, password=password)

                    if user is not None:
                        auth_login(request, user)
                        refresh = RefreshToken.for_user(user)

                        send_mail(
                            'Login Successful',
                            f'Hello {landlord.first_name},\n\nYou have successfully logged into your account.',
                            settings.EMAIL_HOST_USER,
                            [landlord.email],
                            fail_silently=False,
                        )

                        return JsonResponse({
                            'status': 'success',
                            'role': 'landlord',
                            'landlordID': landlord.id,
                            'access': str(refresh.access_token),
                            'refresh': str(refresh),
                        })

                return JsonResponse({'error': 'Invalid login details','status' : 'fail'}, status=401)

            except Landlord.DoesNotExist:
                try:
                    tenant = Tenant.objects.get(email=email)
                    if check_password(password, tenant.password):
                        user, created = User.objects.get_or_create(username=tenant.email, defaults={"password": password})

                        if created:
                            user.set_password(password)
                            user.save()
                
                        user.backend = 'django.contrib.auth.backends.ModelBackend'
                        user = authenticate(request, username=tenant.email, password=password)

                        if user is not None:
                            auth_login(request, user)
                            refresh = RefreshToken.for_user(user)

                            property_data = tenant.property.pk

                            send_mail(
                                'Login Successful',
                                f'Hello {tenant.first_name},\n\nYou have successfully logged into your account.',
                                settings.EMAIL_HOST_USER,
                                [tenant.email],
                                fail_silently=False,
                            )

                            return JsonResponse({
                                'status': 'success',
                                'role': 'tenant',
                                'propertyID': property_data,
                                'tenantID': tenant.house_number,
                                'access': str(refresh.access_token),
                                'refresh': str(refresh),
                            })

                    return JsonResponse({'error': 'Invalid login details'}, status=401)

                except Tenant.DoesNotExist:
                    return JsonResponse({'error': 'Invalid login details. No user found with this email.'}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

def send_reset_email(user, token, uid, request):
    content_type = ContentType.objects.get_for_model(user)
    reset_url = f"http://localhost:5173/login/reset-password/{uid}/{token}"

    email_subject = 'Password Reset Request'
    email_body = f'''
    Hi {user.first_name},

    You requested a password reset. Click the link below to reset your password:
    {reset_url}

    If you didn't request this, please ignore this email.
    '''
    send_mail(email_subject, email_body, 'noreply@example.com', [user.email])

class CustomTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return str(user.pk) + str(timestamp)

token_generator = CustomTokenGenerator()


def forgot_password(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get('email')

        landlord = Landlord.objects.filter(email=email).first()
        tenant = Tenant.objects.filter(email=email).first()

        if landlord:
            user = landlord
        elif tenant:
            user = tenant
        else:
            return JsonResponse({"error": "User with this email does not exist."}, status=400)

        user.last_login = None
        user.save()

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)

        send_reset_email(user, token, uid, request)

        return JsonResponse({"message": "Password reset link has been sent to your email."}, status=200)

def reset_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        uidb64 = data.get('uid')
        token = data.get('token')
        password = data.get('password')

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            content_type = ContentType.objects.get_for_model(Landlord) or ContentType.objects.get_for_model(Tenant)  # or Tenant
            user_model = content_type.model_class()
            user = get_object_or_404(user_model, pk=uid)
            if token_generator.check_token(user, token):
                if password:
                    user.password = make_password(password)
                    user.save()
                    return JsonResponse({"message": "Password has been reset successfully."}, status=200)
                else:
                    return JsonResponse({"error": "Passwords do not match."}, status=400)
            else:
                return JsonResponse({"error": "Invalid or expired reset link."}, status=400)
        except ContentType.DoesNotExist:
            return JsonResponse({"error": "Content type not found."}, status=500)
        except user_model.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"An error occurred: {e}"}, status=500)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)

def tenants(request,landlord_id):
    try:
        landlord = Landlord.objects.get(id=landlord_id)
        tenant = Tenant.objects.filter(landlord=landlord_id)
        tenants_list = []
        for tenant_instance in tenant:
            property_id = tenant_instance.property_id
            
            try:
                property_living_in = Property.objects.get(id=property_id)
                property_details = {
                    "property_name": property_living_in.property_name
                }
            except Property.DoesNotExist:
                property_details = {
                    "property_name": "Property not found"
                }

            tenants_list.append({
                "house_number": tenant_instance.house_number,
                "first_name": tenant_instance.first_name,
                "last_name": tenant_instance.last_name,
                "email": tenant_instance.email,
                "phone": tenant_instance.phone,
                "password": tenant_instance.password,
                "date_moved_in": tenant_instance.date_moved_in,
                "property_details": property_details
            })
        return JsonResponse({'tenants' : tenants_list})

    except Landlord.DoesNotExist:
        return JsonResponse({'error' 'landlord not found'},status = 404)


def tenant_detail(request, tenant_id):
    try:
        tenant = Tenant.objects.get(pk=tenant_id)
        tenant_data = {
            'house_number': tenant.house_number,
            'first_name': tenant.first_name,
            'last_name': tenant.last_name,
            'email': tenant.email,
            'phone': tenant.phone,
        }
        return JsonResponse(tenant_data)
    except Tenant.DoesNotExist:
        return JsonResponse({'error': 'Tenant not found'}, status=404)


def get_dynamic_date(date_moved_in):
    current_date = timezone.now()

    current_year = current_date.year
    current_month = current_date.month
    
    next_month = current_month + 1
    if next_month > 12:
        next_month = 1
        current_year += 1

    move_in_day = date_moved_in.day
    
    try:
        specific_date = datetime(current_year, next_month, move_in_day)
    except ValueError:
        last_day_of_next_month = calendar.monthrange(current_year, next_month)[1]
        specific_date = datetime(current_year, next_month, last_day_of_next_month)

    return specific_date

def remainder_email(date_moved_in, tenant):
    specific_date = get_dynamic_date(tenant.date_moved_in)
    reminder_date = specific_date - timedelta(days=5)

    if timezone.now().date() == reminder_date.date():
        send_mail(
            'Payment remainder',
            f'Hello {tenant.first_name},\n\nThis is a reminder that the rent is due in 5 Days.',
            settings.EMAIL_HOST_USER,
            [tenant.email],
            fail_silently=False,
             )

import base64
import requests
from decouple import config

def generate_access_token():
    try:
        consumer_key = config('MPESA_CONSUMER_KEY')
        consumer_secret = config('MPESA_CONSUMER_SECRET')
        
        auth_string = f'{consumer_key}:{consumer_secret}'
        
        auth_base64 = base64.b64encode(auth_string.encode()).decode()
        headers = {
            'Authorization': f'Basic {auth_base64}',
            'Content-Type': 'application/json'
        }

        url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

        response = requests.get(url, headers=headers)
        response.raise_for_status()

        access_token = response.json().get('access_token')

        return access_token

    except requests.exceptions.RequestException as e:
        print(f"Error generating access token: {e}")
        return None

def generate_password(number):
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password = base64.b64encode(f'{number}{settings.MPESA_PASSKEY}{timestamp}'.encode()).decode('utf-8')
    return password


def mpesa_express_payment(id,landlord,tenant,phone_number, amount, description):
    if amount <= 0:
        return {'error': 'Invalid amount. Amount must be greater than zero.'}
    endpoint = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    access_token = generate_access_token()
    if not access_token:
        return {'error': 'Failed to obtain access token'}

    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    payload = {
        'BusinessShortCode': landlord.paybill_number,
        'Password': generate_password(landlord.paybill_number),
        'Timestamp': datetime.now().strftime('%Y%m%d%H%M%S'),
        'TransactionType': 'CustomerPayBillOnline',
        'Amount': amount,
        'PartyA': phone_number,
        'PartyB': landlord.paybill_number,
        'PhoneNumber': phone_number,
        'CallBackURL': f'https://rent-ease-jxhm.onrender.com/rent/tenants/{id}/payments', 
        'AccountReference': landlord.account_number,
        'TransactionDesc': description
    }

    try:
        response = requests.post(endpoint, json=payload, headers=headers)
        response_data = response.json()
        return response_data
    except requests.exceptions.RequestException as e:
        print(f"Error making M-Pesa payment request: {e}")
        return {'error': str(e)}

def mpesa_till_payment(id, landlord, tenant, phone_number, amount, reference, description):
    if amount <= 0:
        print(amount)
        return {'error': 'Invalid amount. Amount must be greater than zero.'}
    endpoint = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    headers = {
        'Authorization': f'Bearer {generate_access_token()}',
        'Content-Type': 'application/json'
    }

    payload = {
        "BusinessShortCode": landlord.till_number,
        'Password': generate_password(landlord.till_number),
        'Timestamp': datetime.now().strftime('%Y%m%d%H%M%S'),
        'TransactionType': 'CustomerBuyGoodsOnline',
        'Amount': int(amount),
        'PartyA': phone_number,
        'PartyB': landlord.till_number,
        'PhoneNumber': phone_number,
        'CallBackURL': f'https://rent-ease-jxhm.onrender.com/rent/tenants/{id}/payments',
        'AccountReference': reference,
        'TransactionDesc': description
    }

    try:
        response = requests.post(endpoint, json=payload, headers=headers)
        response_data = response.json()
        return response_data
    except requests.exceptions.RequestException as e:
        return {'error': str(e)}

def payments(request, tenant_id):
    if request.method == "POST":
        try:
            tenant = Tenant.objects.get(pk=tenant_id)
            utilities = Utilities.objects.filter(tenant=tenant)
            data = json.loads(request.body)
            amount_paid = int(data.get("amount", 0))
            amount = amount_paid
            total_amount_due = sum(utility.total for utility in utilities)

            for utility in utilities:
                if amount_paid > 0:
                    if utility.total <= amount_paid:
                        amount_paid -= utility.total
                        utility.total = 0
                    else:
                        utility.total -= amount_paid
                        amount_paid = 0
                    utility.save()

            new_balance = sum(utility.total for utility in utilities)

            landlord = tenant.landlord
            phone = tenant.phone
            landlord_phone = f'0{landlord.phone}'
            if landlord_phone.startswith('0'):
                landlord_phone = '254' + landlord_phone[1:]

            if phone.startswith('0'):
                phone = '254' + phone[1:]

            response = None
            if landlord.paybill_number:
                response = mpesa_express_payment(
                    tenant_id,
                    landlord,
                    tenant,
                    phone,
                    amount,
                    f"For {tenant.house_number}"
                )
            elif landlord.till_number:
                response = mpesa_till_payment(
                    tenant_id,
                    landlord,
                    tenant,
                    phone,
                    int(amount),
                    f"{tenant.first_name}",
                    f"For {tenant.house_number}"
                )

            payment = Payments.objects.create(
                landlord=landlord,
                tenant=tenant,
                amount=total_amount_due,
                paid=total_amount_due - new_balance,
                balance=new_balance,
                date_due=datetime.now(),
                date_paid=datetime.now()
            )

            remainder_email(tenant.date_moved_in, tenant)

            response_data = {
                "landlord": payment.landlord.first_name,
                "name": payment.tenant.first_name,
                "amount": payment.amount,
                "paid": payment.paid,
                "balance": payment.balance,
                "date_due": payment.date_due,
                "date_paid": payment.date_paid
            }

            return JsonResponse({'success': True, 'data': response_data, 'mpesa_response': response})

        except Tenant.DoesNotExist:
            return JsonResponse({'success': False, 'message': f"Tenant with id {tenant_id} does not exist"}, status=404)

        except Exception as e:
            return JsonResponse({'success': False, 'message': f"Error initiating payment: {str(e)}"}, status=500)

    else:
        try:
            tenant = Tenant.objects.get(pk=tenant_id)
            payments = Payments.objects.filter(tenant_id=tenant_id)
            payments_data = []

            for payment in payments:
                payment_data = {
                    "name": tenant.first_name,
                    "landlord": tenant.landlord.first_name,
                    "paid": payment.paid,
                    "balance": payment.balance,
                    "date_paid": payment.date_paid
                }
                payments_data.append(payment_data)

            return JsonResponse({'payments': payments_data}, safe=False)

        except Tenant.DoesNotExist:
            return JsonResponse({'success': False, 'message': f"Tenant with id {tenant_id} does not exist"}, status=404)


def payments_received(request, landlord_id):
    try:
        landlord = Landlord.objects.get(pk=landlord_id)
        payments_received = Payments.objects.filter(landlord=landlord)
        landlord_data = {
            "first_name" : landlord.first_name,
            "last_name" : landlord.last_name,
            "email" : landlord.email,
            "phone" : landlord.phone
            }
        payment_received_data = []
        for payment_received in payments_received:
            payment = PaymentsReceived.objects.create(landlord = landlord,tenant=payment_received.tenant, amount = payment_received,balance = payment_received.amount,total_amount = payment_received.amount)
            payment_received_data.append({
                "tenant_name": payment_received.tenant.first_name,
                "total_amount_paid": payment_received.paid,
                "balance": payment_received.balance
                # "total_amount": payment_received.total_amount
            })
        
        return JsonResponse({'payments_received': payment_received_data,"landlord" : landlord_data})
    
    except Landlord.DoesNotExist:
        return JsonResponse({'error': 'Landlord not found'}, status=404)

def delete(request,tenant_id):
    tenant = Tenant.objects.get(pk = tenant_id)

    if request.method == "DELETE":
        try:
            tenant = Tenant.objects.get(pk=tenant_id)

            tenant.delete()

            return JsonResponse({"status": "success", "message": f"Tenant with ID {tenant_id} has been deleted."})

        except Tenant.DoesNotExist:
            return JsonResponse({"status": "error", "message": f"Tenant with ID {tenant_id} does not exist."}, status=404)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)


def utilities(request, property_id, tenant_id):
    if request.method == "POST":
        try:
            tenant = Tenant.objects.get(pk=tenant_id)
            property_instance = Property.objects.get(pk=property_id)
            property_details = PropertyDetails.objects.get(property=property_instance)

            data = json.loads(request.body)
            bedroom_count = data.get("bedroomCount")
            input_fields = data.get("inputFields")

            if not input_fields or not bedroom_count:
                return JsonResponse({"error": "Fill all the fields or no available rents"}, status=400)

            rent_dict = {
                "single_room": property_details.base_rent_single_room,
                "bedsitter": property_details.base_rent_bedsitter,
                "1": property_details.base_rent_1_bedroom,
                "2": property_details.base_rent_2_bedroom,
                "3": property_details.base_rent_3_bedroom,
                "4": property_details.base_rent_4_bedroom
            }

            base_rent = rent_dict.get(bedroom_count)
            if base_rent is None:
                return JsonResponse({"error": f"No available rent for {bedroom_count} bedroom houses"}, status=400)

            total_utility_cost = 0
            utilities_data = []

            Utilities.objects.filter(tenant=tenant).delete()

            with transaction.atomic():
                for item in input_fields:
                    utility_name = item.get('utility_name')
                    utility_cost = item.get('utility_cost')

                    if not utility_name or utility_cost is None:
                        return JsonResponse({'error': 'Utility name, cost required'}, status=400)

                    cost = int(utility_cost)
                    if cost < 0:
                        return JsonResponse({'error': 'Utility cost cannot be negative'}, status=400)

                    total_utility_cost += cost

                    utility = Utilities.objects.create(
                        tenant=tenant,
                        utility_name=utility_name,
                        utility_cost=cost,
                        rent=base_rent,
                        total=base_rent + total_utility_cost
                    )

                    utilities_data.append({
                        'id': utility.id,
                        'utility_name': utility.utility_name,
                        'utility_cost': utility.utility_cost,
                        'bedroom_count': bedroom_count,
                        'base_rent': base_rent,
                        'total': utility.total
                    })

                total = base_rent + total_utility_cost

                payment, created = Payments.objects.update_or_create(
                    tenant=tenant,
                    landlord=tenant.landlord,
                    defaults={'amount': total, 'paid': 0, 'balance': 0, 'date_paid': timezone.now(), 'date_due': timezone.now()}
                )

            return JsonResponse({'utilities': utilities_data, 'total_utility_cost': total_utility_cost, 'total': total}, status=201)

        except Tenant.DoesNotExist:
            return JsonResponse({"error": "Tenant not found"}, status=404)
        except Property.DoesNotExist:
            return JsonResponse({"error": "Property not found"}, status=404)
        except PropertyDetails.DoesNotExist:
            return JsonResponse({"error": "Property details not found"}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

def delete_utilities(request, utilities_id, tenant_id):
    try:
        utility = Utilities.objects.get(pk=utilities_id)
        tenant = Tenant.objects.get(pk=tenant_id)
    except Utilities.DoesNotExist:
        return JsonResponse({'error': 'Utility not found'}, status=404)
    except Tenant.DoesNotExist:
        return JsonResponse({'error': 'Tenant not found'}, status=404)

    if request.method == "DELETE":
        utility.delete()

        total_utility_cost = Utilities.objects.filter(tenant=tenant).aggregate(total=Sum('utility_cost'))['total']
        total_rent = utility.rent

        if total_utility_cost is None:
            total_utility_cost = 0

        if total_rent is None:
            total_rent = 0  

        total = total_utility_cost + total_rent

        Payments.objects.filter(tenant=tenant).update(amount=total)

        return JsonResponse({"success": True, "total": total})

    return JsonResponse({'error': 'Invalid request method'}, status=400)

def logout_view(request):
    if request.method == "GET":
        
        request.session.flush()

        logout(request)

        return JsonResponse({'message': 'Logged out successfully'})



    