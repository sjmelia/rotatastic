Rota Server
===========

```
docker build -t steve/rota .
docker run -d -v /home/steve/rota:/db --restart=unless-stopped -p 32600:80 steve/rota
```

Development Environment
-----------------------

To setup
```
cd src
virtualenv env
source env/bin/activate
pip install -r requirements.txt
```

To setup db and run:

```
export FLASK_APP=main
export FLASK_DEBUG=true
flask initdb
flask run
```

