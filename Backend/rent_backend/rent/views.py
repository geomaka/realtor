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
from django.forms.models import model_to_dict

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
                'landlord_id': landlord.id
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
        property_id = data.get("property_id")

        print(data)

        try:
            properties = Property.objects.get(pk=property_id)

        except Property.DoesNotExist:
            print("Does not exist")
 
        if first_name and last_name and phone and email and password and landlord_id and house_number and date_moved_in:
            hashed_password = make_password(password)
            tenant = Tenant.objects.create(house_number=house_number, first_name=first_name, last_name=last_name, phone=phone, email=email, date_moved_in = date_moved_in, password=hashed_password, landlord_id=landlord_id, property_id=property_id)
            data = {
                "first_name" : tenant.first_name,
                "last_name" : tenant.last_name,
                "email" : tenant.email,
                "phone" : tenant.phone,
                "house_number" : tenant.house_number,
                "landlord_id" : tenant.landlord_id,
                "property_id" : tenant.property_id
            }
            return JsonResponse({"tenant": data})
        else:
            return JsonResponse({"success": False, "message": "Fill all the fields"})
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
            print(data)

            if property_name:
                new_property = Property.objects.create(landlord = landlord, property_name = property_name)
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

            if bedroom_count not in ["1", "2", "3", "4"]:
                return JsonResponse({"error": "Invalid bedroom count"}, status=400)

            base_rent = None
            if bedroom_count == "1":
                base_rent = property_details.base_rent_1_bedroom
            elif bedroom_count == "2":
                base_rent = property_details.base_rent_2_bedroom
            elif bedroom_count == "3":
                base_rent = property_details.base_rent_3_bedroom
            elif bedroom_count == "4":
                base_rent = property_details.base_rent_4_bedroom
            else:
                return JsonResponse({"error": "Bedroom count not supported"}, status=400)

            house_detail = HouseDetails.objects.create(
                tenant=tenant,
                bedroom_count=bedroom_count,
                base_rent=base_rent
            )

            return JsonResponse({
                "message": "House details created successfully",
                "house_details": {
                    "tenant": house_detail.tenant.first_name,  # Assuming Tenant has a 'name' field
                    "bedroom_count": house_detail.bedroom_count,
                    "base_rent": str(house_detail.base_rent)  # Convert to string for JSON serialization
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
                        user, created = User.objects.get_or_create(username=tenant.email, defaults={"password": password})

                        if created:
                            user.set_password(password)
                            user.save()
                
                        user.backend = 'django.contrib.auth.backends.ModelBackend'

                        user = authenticate(request, username=tenant.email, password=password)
                        print(user)
                        if user is not None:
                            auth_login(request,user)
                            refresh = RefreshToken.for_user(user)

                            property_data = tenant.property.pk

                            return JsonResponse({
                                'status': 'success',
                                'role': 'tenant',
                                'propertyID' : property_data ,
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
            utilities = Utilities.objects.filter(tenant=tenant)
            print(utilities.values('rent'))
            data = json.loads(request.body)
            amount_paid = int(data.get("amount", 0))

            total_amount_due = sum(utility.total for utility in utilities)
            print(total_amount_due)

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

            if timezone.now().date() == get_dynamic_date().date():
                balance = total_amount_due
            else:
                balance = new_balance

            payment = Payments.objects.create(
                landlord=tenant.landlord,
                tenant=tenant,
                amount=total_amount_due, 
                paid=total_amount_due - new_balance,
                balance=balance,
                date_due=get_dynamic_date(),
                date_paid=timezone.now()
            )

            cl = MpesaClient() 
            phone_number = tenant.phone
            paid_amount = int(amount_paid)
            account_reference = f"Payment for {tenant.first_name} {tenant.last_name}"
            transaction_desc = f"Utility payment for {tenant.house_number}"
            callback_url = 'https://api.darajambili.com/express-payment' 
            response = cl.stk_push(phone_number, paid_amount, account_reference, transaction_desc, callback_url)

            response_data = {
                "landlord": payment.landlord.first_name,
                "name": payment.tenant.first_name,
                "amount": payment.amount,
                "paid": payment.paid,
                "balance": payment.balance,
                "date_due": payment.date_due,
                "date_paid": payment.date_paid
            }

            return JsonResponse({'success': True, 'data': response_data, 'mpesa_response': response.json()})

        except Tenant.DoesNotExist:
            return JsonResponse({'success': False, 'message': f"Tenant with id {tenant_id} does not exist"}, status=404)

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
        print(total_rent)

        Payments.objects.filter(tenant=tenant).update(amount=total)

        return JsonResponse({"success": True, "total": total})

    return JsonResponse({'error': 'Invalid request method'}, status=400)

def logout_view(request):
    if request.method == "GET":
        
        request.session.flush()

        logout(request)

        return JsonResponse({'message': 'Logged out successfully'})



    