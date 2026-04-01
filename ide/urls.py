from django.urls import path
from . import views

urlpatterns = [
    path('ide/', views.index, name='index'),
    path('', views.landing, name='index'),
    path('run/', views.run_code, name='run_code'),
    # path('chatbot/', views.chatbot, name='chatbot'),
    # path('chat/',  views.chat,     name='chat'),      # ← new chatbot API endpoint
]
