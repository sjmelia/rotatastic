FROM tiangolo/uwsgi-nginx-flask:flask-index

COPY ./app /app
ENV FLASK_APP main
WORKDIR /app
RUN pip install -r requirements.txt
ENV ROTA_SETTINGS /app/production.py
CMD python -m flask initdb && /usr/bin/supervisord
