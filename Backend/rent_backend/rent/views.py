from django.contrib.auth.hashers import make_password,check_password
from django.contrib import messages
from django.contrib.auth import logout
from django.core import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse,HttpResponseRedirect,JsonResponse
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.urls import reverse
from .models import Tenant,Landlord,Payments,Utilities,PaymentsReceived, Property,PropertyDetails
from datetime import datetime
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

# Create your views here.
def index(request):
    return HttpResponse("<h1>Hello</h1>")

@ensure_csrf_cookie
def getCSRF(request):
    if request.method == "GET":
        csrf_token = get_token(request)
        print(csrf_token)
        return JsonResponse({"csrfToken": csrf_token})

    else:
        return JsonResponse({"error": "not allowed"}, status=405)

def adminsignup(request):

    # return render(request,"rent/adminSignup.html")
    if request.method == "POST":
        data = json.loads(request.body)
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        phone = data.get("phone")
        password = data.get("password")

        if first_name and last_name and phone and email and password:
            hashed_pwd = make_password(password)
            landlord = Landlord.objects.create(first_name=first_name, last_name=last_name, phone=phone, email=email, password=hashed_pwd)
            print(landlord)
            data = {
                'message': 'Landlord created successfully',
                'landlord_id': landlord.id,
                'redirect_url': reverse('utilities', args=[landlord.id])
            }
            return JsonResponse(data)
        else: 
            return JsonResponse({'error': 'Fill all the fields'}, status=400)

    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

def signup(request):
    if request.method == "POST":
        data = json.loads(request.body)
        house_number = data.get("house_number")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        date_moved_in = data.get("date_moved_in")
        phone = data.get("phone")
        password = data.get("password")
        landlord_id = data.get("landlord_id")

        if first_name and last_name and phone and email and password and landlord_id and house_number and date_moved_in:
            hashed_password = make_password(password)
            tenant = Tenant.objects.create(house_number=house_number, first_name=first_name, last_name=last_name, phone=phone, email=email, date_moved_in = date_moved_in, password=hashed_password, landlord_id=landlord_id)
            data = {
                "first_name" : tenant.first_name,
                "last_name" : tenant.last_name,
                "email" : tenant.email,
                "phone" : tenant.phone,
                "house_number" : tenant.house_number
            }
            return JsonResponse({"tenant": data})
        else:
            return JsonResponse({"success": False, "message": "Fill all the fields"})
    else:
        landlords = Landlord.objects.all().values("id", "first_name", "last_name")
        return JsonResponse({"landlords": list(landlords)})

def property(request,landlord_id):
    if request.method == "POST":
        try:
            landlord = Landlord.objects.get(id=landlord_id)
            data = json.loads(request.body)
            property_name = data.get('property_name')
            print(data)

            if property_name:
                new_property = Property.objects.create(landlord = landlord, property_name = property_name)
                property_data = {"property_name" : property_name, "landlord": new_property.landlord.id, "property_id" : new_property.id}

                return JsonResponse({"property" : property_data})
            else:
                return JsonResponse({'error' : "an error has occured"})

        except Landlord.DoesNotExist:
            return JsonResponse({'error' : "landlord not found"})

def property_details(request, landlord_id, property_id):
    if request.method == "POST":
        try:
            landlord = Landlord.objects.get(id=landlord_id)
            property = Property.objects.get(id=property_id)
        except Landlord.DoesNotExist or Property.DoesNotExist:
            return JsonResponse({"error":"Does not exist"},status =  404)

        data = json.loads(request.body)
        number_of_houses = int(data.get('number_of_houses'))
        number_of_1_bedroom_houses = int(data.get('number_of_1_bedroom_houses'))
        number_of_2_bedroom_houses = int(data.get('number_of_2_bedroom_houses'))
        number_of_3_bedroom_houses = int(data.get('number_of_3_bedroom_houses'))
        number_of_4_bedroom_houses = int(data.get('number_of_4_bedroom_houses'))

        base_rent_1_bedroom = data.get('base_rent_1_bedroom')
        base_rent_2_bedroom = data.get('base_rent_2_bedroom')
        base_rent_3_bedroom = data.get('base_rent_3_bedroom')
        base_rent_4_bedroom = data.get('base_rent_4_bedroom')

        total_houses = number_of_1_bedroom_houses + number_of_2_bedroom_houses + number_of_3_bedroom_houses + number_of_4_bedroom_houses

        if number_of_houses == total_houses:
            property_details = PropertyDetails.objects.create(
                property = property,
                number_of_houses = number_of_houses,
                number_of_1_bedroom_houses = number_of_1_bedroom_houses,
                number_of_2_bedroom_houses = number_of_2_bedroom_houses,
                number_of_3_bedroom_houses = number_of_3_bedroom_houses,
                number_of_4_bedroom_houses = number_of_4_bedroom_houses,
                base_rent_1_bedroom = base_rent_1_bedroom,
                base_rent_2_bedroom = base_rent_2_bedroom,
                base_rent_3_bedroom = base_rent_3_bedroom,
                base_rent_4_bedroom = base_rent_4_bedroom
            )

            property_details_data = {
                    "Number of houses": property_details.number_of_houses,
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

            return JsonResponse({"Property_details" : property_details_data},status=201)
        else:
            return JsonResponse({"message" : "Number of houses are not equal"})
    else:
        return JsonResponse({"Error" : "invalid method"},status=405)

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
                        auth_login(request,user)
                        refresh = RefreshToken.for_user(user)
                        return JsonResponse({
                            'status': 'success',
                            'role': 'landlord',
                            'landlordID': landlord.id,
                            'access': str(refresh.access_token),
                            'refresh': str(refresh),
                        })
                return JsonResponse({'error': 'Invalid login details'}, status=401)

            except Landlord.DoesNotExist:
                try:
                    tenant = Tenant.objects.get(email=email)
                    if check_password(password, tenant.password):
                        user = authenticate(request, username=tenant.email, password=password)
                        print(user)
                        if user is not None:
                            login(request,user)
                            refresh = RefreshToken.for_user(user)
                            return JsonResponse({
                                'status': 'success',
                                'role': 'tenant',
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
        tenants = list(Tenant.objects.filter(landlord=landlord).values())
        return JsonResponse({'tenants' : tenants})

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

def get_dynamic_date():
    current_date = timezone.now()
    
    current_year = current_date.year
    current_month = current_date.month
    
    next_month = current_month + 1
    if next_month > 12:
        next_month = 1
        current_year += 1
    
    
    specific_date = datetime(current_year, next_month, 5) 
    
    return specific_date

def payments(request, tenant_id):
    if request.method == "POST":
        try:
            tenant = Tenant.objects.get(pk=tenant_id)
            utilities = Utilities.objects.filter(landlord=tenant.landlord)

            data = json.loads(request.body)
            amount_paid = int(data.get("amount", 0))

            for utility in utilities:
                total = utility.total
                new_total = utility.total - amount_paid
                utility.total = new_total
                utility.save()

            if timezone.now() == get_dynamic_date():
                balance += total
            else:
                balance = new_total

            payment = Payments.objects.create(
                landlord=tenant.landlord,
                tenant=tenant,
                amount=new_total,
                paid=amount_paid,
                balance=balance,
                date_due=get_dynamic_date(),
                date_paid=timezone.now()
            )

            data = {
                "landlord": payment.landlord.first_name,
                "name": payment.tenant.first_name,
                "amount": payment.amount,
                "paid": payment.paid,
                "balance": payment.balance,
                "date_due": payment.date_due,
                "date_paid": payment.date_paid
            }

            return JsonResponse({'success': True, 'data': data})

        except Exception as e:
            if 'payment' in locals():
                payment.delete()
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
            print(payment)
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


def utilities(request, landlord_id, property_id):
    try:
        landlord = Landlord.objects.get(pk=landlord_id)
        property = PropertyDetails.objects.get(pk=property_id)
    except (Landlord.DoesNotExist, PropertyDetails.DoesNotExist):
        return JsonResponse({'error': 'Landlord or the property not found'}, status=404)

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print(data)
            rent_for_1_bedroom = property.base_rent_1_bedroom if property.number_of_1_bedroom_houses > 0 else None
            rent_for_2_bedroom = property.base_rent_2_bedroom if property.number_of_2_bedroom_houses > 0 else None
            rent_for_3_bedroom = property.base_rent_3_bedroom if property.number_of_3_bedroom_houses > 0 else None
            rent_for_4_bedroom = property.base_rent_4_bedroom if property.number_of_4_bedroom_houses > 0 else None
            
            utilities_data = []

            rent_dict = {
                1: rent_for_1_bedroom,
                2: rent_for_2_bedroom,
                3: rent_for_3_bedroom,
                4: rent_for_4_bedroom
            }

            available_rents = {k: v for k, v in rent_dict.items() if v is not None}

            if available_rents and 'inputFields' in data:
                try:
                    with transaction.atomic():
                        total_utility_cost = 0

                        for item in data['inputFields']:
                            utility_name = item.get('utility_name')
                            utility_cost = item.get('utility_cost')
                            bedroom_count = item.get('bedroom_count')

                            if utility_name is None or utility_cost is None or bedroom_count is None:
                                return JsonResponse({'error': 'Utility name, cost, and bedroom count are required'}, status=400)

                            cost = int(utility_cost)
                            if cost < 0:
                                raise ValueError("Utility cost cannot be negative")

                            if bedroom_count not in available_rents:
                                return JsonResponse({'error': f'No available rent for {bedroom_count} bedroom houses'}, status=400)

                            total_rent = available_rents[bedroom_count]
                            total_utility_cost += cost

                            utility = Utilities.objects.create(
                                landlord=landlord,
                                utility_name=utility_name,
                                utility_cost=cost,
                                rent=total_rent,
                                total=total_rent + total_utility_cost
                            )

                            utilities_data.append({
                                'id': utility.id,
                                'utility_name': utility.utility_name,
                                'utility_cost': utility.utility_cost,
                                'bedroom_count': bedroom_count,
                                'base_rent': total_rent,
                                'total': utility.total
                            })

                        return JsonResponse({'utilities': utilities_data, 'total_utility_cost': total_utility_cost})

                except ValueError as e:
                    return JsonResponse({'error': str(e)}, status=400)

                except Exception as e:
                    return JsonResponse({'error': 'An unexpected error occurred'}, status=500)

            else:
                return JsonResponse({'error': 'Fill all the fields or no available rents'}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)

    else:
        utilities_data = list(Utilities.objects.filter(landlord=landlord).values())
        return JsonResponse({'utilities': utilities_data})

def delete_utilities(request,utilities_id,landlord_id):
    utility = Utilities.objects.get(pk = utilities_id)
    landlord = landlord = Landlord.objects.get(pk=landlord_id)
    total_utility_cost = Utilities.objects.filter(landlord=landlord).aggregate(total=Sum('utility_cost'))['total']
    total_rent = Utilities.objects.filter(landlord=landlord).aggregate(total=Sum('rent'))['total']
    if request.method == "DELETE":
        utility.delete()
        total_utility_cost = Utilities.objects.filter(landlord=landlord).aggregate(total=Sum('utility_cost'))['total']
        total_rent = Utilities.objects.filter(landlord=landlord).aggregate(total=Sum('rent'))['total']

        if total_utility_cost is None:
            total_utility_cost = 0

        if total_rent is None:
            total_rent = utility.rent

        total = total_utility_cost + total_rent

        Payments.objects.filter(landlord=landlord).update(amount=total)
            
        return JsonResponse({"success" : True, "total" : total})

    return JsonResponse({'error': 'Invalid request method'}, status=400)

def logout_view(request):
    if request.method == "GET":
        
        request.session.flush()

        logout(request)

        return JsonResponse({'message': 'Logged out successfully'})



    