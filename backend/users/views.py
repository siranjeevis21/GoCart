from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import CustomUserSerializer, RegisterSerializer

User = get_user_model()

# Custom SimpleJWT Serializer to return user info in response and support email login
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims in JWT token
        token['role'] = user.role
        token['username'] = user.username
        token['email'] = user.email
        return token

    def validate(self, attrs):
        username_or_email = attrs.get("username")
        # Check if the user is logging in using email
        if "@" in username_or_email:
            try:
                user = User.objects.get(email=username_or_email)
                attrs["username"] = user.username
            except User.DoesNotExist:
                pass
                
        data = super().validate(attrs)
        
        # Include user details in response body
        user = self.user
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'phone': user.phone,
            'address': user.address
        }
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class UserProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = CustomUserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IsAdminUserPermission(permissions.BasePermission):
    """
    Custom permission to only allow administrators (role == 'ADMIN').
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class AdminUsersListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = CustomUserSerializer
    permission_classes = (IsAdminUserPermission,)
