For development, run

```
uvicorn main:app --reload
```

For production, run

```
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```