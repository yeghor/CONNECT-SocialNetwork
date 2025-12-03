## Local image storage
This application suport choice using between S3 and Local storage to store images.

#### Local images naming:
- Post: {PostId}-{ImageNumber}.png/jpg
- User: {UserId}.png/jpg

Filenames **must** be unique

## Dependencies
Required pips on Windows:
```bash
pip install python-magic-bin==0.4.14
```


On Windows: In case error: Module magic has no attribute magic.from_buffer(...) ...
```bash
pip uninstall python-magic
pip install python-magic
pip install python-magic-bin==0.4.14
```


### AWS CLI
If this error: The AWS Access Key Id you provided does not exist in our records.
Update your AWS CLI

## Tests
Coming soon

## Debug mode

The `DEBUG` variable in the `.env` file controls how the application handles exceptions:

- `DEBUG=True` — when an exception is raised, you will see the full stack trace. Exceptions are not written to the log file.  
- `DEBUG=False` — the application raises client-safe FastAPI `HTTPException`s and records them in the `.log` file.

## Exceptions

Exception handlers decorators rules:
1. Use exception handler decorators only in functions that don't raise any exceptions that the decorator not handling. 
2. Use exception handler decorators only if functions that being called outside the class. (It handles, but follow thi rule)
3. Make sure that exceptions decorator supports async functions! 

Caution! The Pydantic **ValidationError** can be occured in two cases:
- ISE, code 500. When code interactions with pydantic schema is invalid
- BR, code 400. When user sends invalid data

So, if there is error in code - check "BadRequest Invalid request data received" logs

## Chats

Return to user only chat rooms that contain at least one message. 
To create room user have to send at least one message.
Dialoque, group equals to chat room.

When action on message needs to be validated, like deleting or changing - firsty call database chat layer, then websocket layer chat manager. To prevent desynchronization.

For groups, ChatRoom model `approved` field must always be setted on `True`. To create group - user and it's participants must be friends. (following each other)

`created` ChatRoom model field change manualy on chat approval.

### Chat pagination

Add note about pagination normalization... 


## Frontend-Backend 

Backend must **never** provide successful response with `detail` field. It will break frontend DTO!

Fetchers wrapper over fetching functions that you pass to createInfiniteQueryOptionsUtils must always take page as a last param to prevent automatic infiniteQueryOptions creation crushes.

# Issues 

Pydantic schemas designed poorly. The application often returns unused or extra data. Which is not critical, but influences project support.

This is the most problematic part of the application.