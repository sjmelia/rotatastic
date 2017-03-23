Rotatastic!
===========

Rotatastic is an app for daily rotas built with Python Flask and React.

See it in production at http://www.rotatastic.com/

It's an example of a "low-fi" React app - although not quite vanilla JS; there
is no npm, webpack, babel, flux/redux etc. - just a spot of jquery, moment.js,
and bootstrap 4. All the rest of the client side logic can be found in
`/app/static/js/app.js`

Deploying with Docker
---------------------

To run, storing the sqlite db to `/var/db` on the host:

```
docker build -t arrayofbytes/rotatastic .
docker run -d -v /var/db:/db --restart=unless-stopped -p 32600:80 arrayofbytes/rotatastic
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

To initialise db and run:

```
export FLASK_APP=main.py
export FLASK_DEBUG=true
flask initdb
flask run
```

