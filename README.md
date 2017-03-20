Rota Server
===========

```
docker build -t steve/rota .
docker run -d -v /home/steve/rota:/db --restart=unless-stopped -p 32600:80 steve/rota
```

BELOW DEPRECATED...

To setup
```
cd src
virtualenv env
source env/bin/activate
pip install -r requirements.txt
pip install --editable .
```

To setup db and run:

```
export FLASK_APP=Rota
export FLASK_DEBUG=true
flask initdb
flask run
```
Some tests:
```
curl -H "Content-type: application/json" -X POST http://127.0.0.1:5000/rota -d '{"name": "new rota"}'
curl -H "Content-type: application/json" -X PUT  http://127.0.0.1:5000/rota/612a1e08-cdd3-493f-8fd2-f92658b8fe8b/2017-03-01 -d '["@steve","@jeff"]'
curl -H "Content-type: application/json" -X GET  http://127.0.0.1:5000/rota/612a1e08-cdd3-493f-8fd2-f92658b8fe8b
```

Dockerfile
----------

`docker build -t steve/rota .`
`docker run -d -v /home/steve/Projects/rota2/db:/db -P steve/rota`

