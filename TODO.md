NotFoundExc doesn't log in websockets, traceback:
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "C:\Users\Yehor\Documents\SocialNetwork\backend\exceptions\exceptions_handler.py", line 51, in wrapper
    return await func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\Yehor\Documents\SocialNetwork\backend\services\core_services\main_services\main_chat_service.py", line 150, in delete_message
    raise ResourceNotFound(detail=f"ChatService: User{user_data.user_id} tried to delete message: {message_data.message_id} that doesn't exist.", client_safe_detail="Message that you're trying to delete doesn't exist")
exceptions.custom_exceptions.ResourceNotFound: ChatService: Userda5dbfc8-4197-4bb9-9282-be59a1d238f9 tried to delete message: e3617555-6bbb-45a7-a3f7-529ba846a59c that doesn't exist.

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\uvicorn\protocols\websockets\websockets_impl.py", line 244, in run_asgi
    result = await self.app(self.scope, self.asgi_receive, self.asgi_send)  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 60, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\fastapi\applications.py", line 1054, in __call__
    await super().__call__(scope, receive, send)
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\starlette\applications.py", line 112, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\starlette\middleware\errors.py", line 152, in __call__
    await self.app(scope, receive, send)
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\starlette\middleware\cors.py", line 77, in __call__
    await self.app(scope, receive, send)
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\starlette\middleware\exceptions.py", line 62, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\starlette\routing.py", line 714, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\starlette\routing.py", line 734, in app
    await route.handle(scope, receive, send)
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\starlette\routing.py", line 362, in handle
    await self.app(scope, receive, send)
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\starlette\routing.py", line 95, in app
    await wrap_app_handling_exceptions(app, session)(scope, receive, send)
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\starlette\routing.py", line 93, in app
    await func(session)
  File "C:\Users\Yehor\AppData\Local\Programs\Python\Python312\Lib\site-packages\fastapi\routing.py", line 383, in app
    await dependant.call(**solved_result.values)
  File "C:\Users\Yehor\Documents\SocialNetwork\backend\exceptions\exceptions_handler.py", line 149, in wrapper
    return await func(websocket, *args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\Yehor\Documents\SocialNetwork\backend\websockets_chat\chat.py", line 127, in connect_to_websocket_chat_room
    db_message_data = await chat.execute_action(request_data=request_data, connection_data=connection_data)
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\Yehor\Documents\SocialNetwork\backend\exceptions\exceptions_handler.py", line 84, in wrapper
    raise e
  File "C:\Users\Yehor\Documents\SocialNetwork\backend\exceptions\exceptions_handler.py", line 51, in wrapper
    return await func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\Yehor\Documents\SocialNetwork\backend\services\core_services\main_services\main_chat_service.py", line 52, in execute_action
    return await self.delete_message(message_data=request_data, user_data=connection_data)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\Yehor\Documents\SocialNetwork\backend\exceptions\exceptions_handler.py", line 64, in wrapper
    raise NotFoundExc(client_safe_detail=e.client_safe_detail, dev_log_detail=str(e), exc_type=e) from e
exceptions.custom_exceptions.NotFoundExc: ChatService: Userda5dbfc8-4197-4bb9-9282-be59a1d238f9 tried to delete message: e3617555-6bbb-45a7-a3f7-529ba846a59c that doesn't exist. 