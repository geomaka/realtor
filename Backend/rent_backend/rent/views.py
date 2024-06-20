from django.contrib.auth.hashers import make_password,check_password
from django.contrib import messages
from django.contrib.auth import logout
from django.core import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse,HttpResponseRedirect,JsonResponse
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.urls import reverse
from .models import Tenant,Landlord,Payments,Utilities,PaymentsReceived
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
        phone = data.get("phone")
        password = data.get("password")
        landlord_id = data.get("landlord_id")

        if first_name and last_name and phone and email and password and landlord_id and house_number:
            hashed_password = make_password(password)
            tenant = Tenant.objects.create(house_number=house_number, first_name=first_name, last_name=last_name, phone=phone, email=email, password=hashed_password, landlord_id=landlord_id)
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
                    user = authenticate(request, username=landlord.email, password=password)
                    
                    if user is not None:
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
                        
                        if user is not None:
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


def utilities(request, landlord_id):
    try:
        landlord = Landlord.objects.get(pk=landlord_id)
    except Landlord.DoesNotExist:
        return JsonResponse({'error': 'Landlord not found'}, status=404)

    if request.method == "POST":
        data = json.loads(request.body)
        rent = data.get('rent')
        utilities_data = []

        if rent is not None and 'inputFields' in data:
            try:
                with transaction.atomic():
                    total_rent = int(rent)
                    total_utility_cost = 0

                    for item in data['inputFields']:
                        utility_name = item.get('utility_name')
                        utility_cost = item.get('utility_cost')

                        cost = int(utility_cost)
                        if cost < 0:
                            raise ValueError("Utility cost cannot be negative")

                        total_utility_cost += cost  

                        utility = Utilities.objects.create(
                            landlord=landlord,
                            utility_name=utility_name,
                            utility_cost=cost,
                            rent=rent,
                            total=total_rent + total_utility_cost  
                        )

                        utilities_data.append({
                            'id': utility.id,
                            'utility_name': utility.utility_name,
                            'utility_cost': utility.utility_cost
                        })

                    return JsonResponse({'utilities': utilities_data,'rent': utility.rent,'total': utility.total})

            except ValueError as e:
                return JsonResponse({'error': str(e)}, status=400)

            except Exception as e:
                return JsonResponse({'error': 'An unexpected error occurred'}, status=500)

        else:
            return JsonResponse({'error': 'Fill all the fields'}, status=400)

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



    