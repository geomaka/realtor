from django.urls import path
from . import views

urlpatterns =[
    path("",views.index, name = "index"),
    path("landlord/<int:landlord_id>",views.payments_received, name = "payments_received"),
    path("adminsignup/csrf",views.getCSRF, name = "CSRF"),
    path("adminsignup",views.adminsignup, name = "adminsignup"),
    path("<int:landlord_id>/property", views.property, name = "property"),
    path("<int:landlord_id>/<int:property_id>/property_details", views.property_details, name = "property_details"),
    path("adminsignup/<int:landlord_id>/add-utilities", views.utilities, name = "utilities"),
    path('adminsignup/<int:landlord_id>/delete-utilities/<int:utilities_id>', views.delete_utilities, name='delete_utilities'),
    path("signup",views.signup, name= "signup"),
    path("login", views.login, name="login"),
    path("api/forgot-password/", views.forgot_password, name = "forgot_password"),
    path("api/reset-password",views.reset_password, name = "reset_password"),
    path("logout",views.logout_view, name = "logout"),
    path("<int:landlord_id>/tenants", views.tenants,name = "tenants"),
    path("tenants/<int:tenant_id>",views.tenant_detail, name = "tenant-detail"),
    path("tenants/<int:tenant_id>/payments",views.payments,name = "payments"),
    path("tenants/<int:tenant_id>/confirmdelete",views.delete,name = "confirmdelete")
]